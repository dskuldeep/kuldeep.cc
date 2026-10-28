import json, os, re, sys
from collections import defaultdict
HERE=os.path.dirname(os.path.abspath(__file__))
OUT=sys.argv[1]
cr=json.load(open(os.path.join(OUT,"ai-crawlers.json")))
feat={c["token"].lower():c for c in cr["featured"]}
tokens=[c["token"] for c in cr["featured"]]+[c["token"] for c in cr["registry"]]
NOT_AI={"googlebot","bingbot","applebot","facebookexternalhit","petalbot"}
ai_tokens=[t for t in tokens if t.lower() not in NOT_AI]

def parse(body):
    groups=[]; cur=None; last_ua=False
    for raw in body.splitlines():
        line=raw.split("#",1)[0].strip()
        if ":" not in line: continue
        k,v=line.split(":",1); k=k.strip().lower(); v=v.strip()
        if k=="user-agent":
            if not last_ua or cur is None:
                cur={"uas":[],"rules":[]}; groups.append(cur)
            cur["uas"].append(v.split("/")[0].strip().lower()); last_ua=True
        elif k in ("allow","disallow") and cur is not None:
            cur["rules"].append((k,v)); last_ua=False
        else:
            last_ua=False
    return groups
def rules_for(groups,tok):
    t=tok.lower(); hit=[g for g in groups if t in g["uas"]]
    if hit: return True,[r for g in hit for r in g["rules"]]
    star=[g for g in groups if "*" in g["uas"]]
    return False,[r for g in star for r in g["rules"]]
def blocked(rules):
    dis=any(k=="disallow" and v in ("/","/*") for k,v in rules)
    allow_root=any(k=="allow" and v in ("/","/*","/$") for k,v in rules)
    return dis and not allow_root
def valid_robots(r):
    b=r.get("body") or ""
    return r.get("status")==200 and "user-agent" in b.lower() and not b.lstrip().startswith("<")
def valid_llms(r):
    b=(r.get("body") or "").lstrip()
    return (r.get("status")==200 and (r.get("final") or "").rstrip("/").endswith("llms.txt") and "html" not in (r.get("ctype") or "").lower()
            and not b.startswith("<") and len(b)>20 and ("#" in b[:400] or "](" in b))

rows=[json.loads(l) for l in open(os.path.join(HERE,"results.jsonl"))]
rows.sort(key=lambda r:r["rank"])
TIERS=[("Top 1,000",1,1000),("1,001–5,000",1001,5000),("5,001–10,000",5001,10000)]
bot=defaultdict(lambda:{"explicit":0,"blocked":0,"allowed":0,"top1k":0})
tier=defaultdict(lambda:{"sites":0,"withRobots":0,"blocksAnyAi":0,"llmsTxt":0})
with_robots=0; any_ai=0; mention_any=0; gpt_block=0; split=0; llms=0
top=[]; llms_sites=[]
for r in rows:
    tname=next(n for n,a,b in TIERS if a<=r["rank"]<=b)
    tier[tname]["sites"]+=1
    L=valid_llms(r["llms.txt"])
    if L: llms+=1; tier[tname]["llmsTxt"]+=1; llms_sites.append({"rank":r["rank"],"domain":r["domain"]})
    if not valid_robots(r["robots.txt"]):
        if r["rank"]<=1000 and L: top.append({"rank":r["rank"],"domain":r["domain"],"blocks":[],"allows":[],"llmsTxt":True})
        continue
    with_robots+=1; tier[tname]["withRobots"]+=1
    g=parse(r["robots.txt"]["body"])
    blocks=[]; allows=[]; named_any=False; explicit_block_any=False
    for t in tokens:
        exp,rl=rules_for(g,t)
        b=blocked(rl)
        s=bot[t]
        if exp: s["explicit"]+=1
        if b:
            s["blocked"]+=1
            if r["rank"]<=1000: s["top1k"]+=1
        elif exp: s["allowed"]+=1
        if t.lower() in NOT_AI: continue
        if exp:
            named_any=True
            if b: blocks.append(t); explicit_block_any=True
            elif t.lower() in feat: allows.append(t)
    if explicit_block_any: any_ai+=1; tier[tname]["blocksAnyAi"]+=1
    if named_any: mention_any+=1
    gb=blocked(rules_for(g,"GPTBot")[1]); sb=blocked(rules_for(g,"OAI-SearchBot")[1])
    if gb: gpt_block+=1
    if gb and not sb: split+=1
    if r["rank"]<=1000: top.append({"rank":r["rank"],"domain":r["domain"],"blocks":blocks,"allows":allows,"llmsTxt":L})
pct=lambda a,b: round(100*a/b,1) if b else 0
def slug(s): return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-")
bots=[]
for t in tokens:
    s=bot[t]
    bots.append({"token":t,"slug":slug(t) if t.lower() in feat else None,"explicit":s["explicit"],"blocked":s["blocked"],"allowed":s["allowed"],
                 "blockedPct":pct(s["blocked"],with_robots),"blockedTop1k":s["top1k"]})
bots.sort(key=lambda b:-b["blocked"])
tiers=[{"tier":n,**tier[n],"blocksAnyAiPct":pct(tier[n]["blocksAnyAi"],tier[n]["withRobots"]),"llmsTxtPct":pct(tier[n]["llmsTxt"],tier[n]["sites"])} for n,_,_ in TIERS]
out={"updated":"2026-10-29","fetchedAt":"2026-10-29",
 "sample":{"list":"Tranco top 1M","listDate":"2026-10-29","domains":len(rows),"withRobots":with_robots,"withLlmsTxt":llms},
 "headline":{"blocksAnyAiPct":pct(any_ai,with_robots),"blocksAnyAi":any_ai,"blocksGptbotPct":pct(gpt_block,with_robots),
   "splitSearchTrainingPct":pct(split,gpt_block),"splitSearchTraining":split,"llmsTxtPct":pct(llms,len(rows)),"mentionsAnyAiPct":pct(mention_any,with_robots)},
 "bots":bots,"tiers":tiers,"topSites":top,"llmsTxtSites":llms_sites[:400]}
json.dump(out,open(os.path.join(OUT,"robots-study.json"),"w"),indent=1)
print(json.dumps(out["sample"]),json.dumps(out["headline"]))
print(json.dumps(tiers,indent=0))
for b in bots[:30]: print(b["token"],b["blocked"],b["blockedPct"],"explicit",b["explicit"],"top1k",b["blockedTop1k"])
