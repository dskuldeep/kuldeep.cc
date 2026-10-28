import json, re, os, statistics, hashlib
from collections import Counter, defaultdict
HERE=os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE,"analyze.py")).read().split("rows=[json.loads")[0].replace("OUT=sys.argv[1]","OUT='/Users/kuldeeppaul/Working/kuldeep.cc/src/data'"))
rows=[json.loads(l) for l in open(os.path.join(HERE,"results.jsonl"))]
TRAIN=["GPTBot","ClaudeBot","Google-Extended","CCBot","Applebot-Extended","Meta-ExternalAgent","Bytespider","Amazonbot","cohere-training-data-crawler","MistralAI-Training"]
SEARCH=["OAI-SearchBot","Claude-SearchBot","PerplexityBot","DuckAssistBot","MistralAI-Index","Amzn-SearchBot","YouBot"]
USER=["ChatGPT-User","Claude-User","Perplexity-User","Meta-ExternalFetcher","MistralAI-User"]
LEGACY=["anthropic-ai","Claude-Web"]
out={}
sites=[]
for r in rows:
    if not valid_robots(r["robots.txt"]): continue
    body=r["robots.txt"]["body"]; g=parse(body)
    eff={t:blocked(rules_for(g,t)[1]) for t in tokens}
    named={t:rules_for(g,t)[0] for t in tokens}
    star_block=blocked([x for gg in g if "*" in gg["uas"] for x in gg["rules"]])
    exp_blocks=sorted(t for t in ai_tokens if named[t] and eff[t])
    cs=re.findall(r"(?im)^\s*content-signal\s*:\s*(.+)$",body)
    cd=[gg for gg in g if any(u in [t.lower() for t in ai_tokens] for u in gg["uas"]) and re.search(r"(?im)crawl-delay",body)]
    sites.append({"rank":r["rank"],"domain":r["domain"],"eff":eff,"named":named,"star":star_block,"exp":exp_blocks,"cs":cs,
                  "llms":valid_llms(r["llms.txt"]),"tld":r["domain"].rsplit(".",1)[-1]})
N=len(sites); print("sites",N)
pct=lambda a,b: round(100*a/b,1) if b else 0
gpt=[s for s in sites if s["eff"]["GPTBot"] and not s["star"]]
# 1 leakiness: of sites explicitly blocking GPTBot (not via *), share leaving other training bots open
leak={t:pct(sum(not s["eff"][t] for s in gpt),len(gpt)) for t in TRAIN if t!="GPTBot"}
anyleak=pct(sum(any(not s["eff"][t] for t in ["ClaudeBot","Google-Extended","CCBot","Meta-ExternalAgent","Applebot-Extended"]) for s in gpt),len(gpt))
out["leak"]={"gptBlockers":len(gpt),"openPct":leak,"anyMajorOpenPct":anyleak}
# all-major-training-blocked
major=["GPTBot","ClaudeBot","Google-Extended","CCBot","Meta-ExternalAgent","Applebot-Extended","Bytespider","Amazonbot"]
full=sum(all(s["eff"][t] for t in major) for s in sites if not s["star"])
out["blocksAllMajorTraining"]={"n":full,"pctOfRobots":pct(full,N),"pctOfGptBlockers":pct(full,len(gpt))}
# 2 zombie: block legacy anthropic token but ClaudeBot open
zl=[s for s in sites if (s["eff"]["anthropic-ai"] or s["eff"]["Claude-Web"]) and (s["named"]["anthropic-ai"] or s["named"]["Claude-Web"])]
zombie=[s for s in zl if not s["eff"]["ClaudeBot"]]
out["zombie"]={"legacyBlockers":len(zl),"claudeBotOpen":len(zombie),"pct":pct(len(zombie),len(zl)),"examples":[s["domain"] for s in sorted(zombie,key=lambda s:s["rank"])[:12]]}
# 3 typology among sites naming any AI bot
typ=Counter()
for s in sites:
    if s["star"]: typ["blocks every bot (*)"]+=1; continue
    if not any(s["named"][t] for t in ai_tokens): typ["no AI rules"]+=1; continue
    tb=any(s["eff"][t] for t in TRAIN); sb=any(s["eff"][t] for t in SEARCH); ub=any(s["eff"][t] for t in USER)
    if tb and (sb or ub): typ["blocks training and AI search/agents"]+=1
    elif tb: typ["blocks training only"]+=1
    elif sb or ub: typ["blocks search/agents only"]+=1
    else: typ["names AI bots, blocks none"]+=1
out["typology"]=dict(typ)
# 4 search self-removal
out["searchBlocked"]={t:pct(sum(s["eff"][t] and not s["star"] for s in sites),N) for t in SEARCH+USER}
# OAI-SearchBot blockers among those naming it
# 5 list length / templates
lens=[len(s["exp"]) for s in sites if s["exp"]]
out["listLength"]={"n":len(lens),"median":statistics.median(lens),"p90":sorted(lens)[int(.9*len(lens))],"max":max(lens),
  "dist":{k:sum(1 for l in lens if lo<=l<=hi) for k,(lo,hi) in {"1":(1,1),"2-5":(2,5),"6-10":(6,10),"11-25":(11,25),"26-50":(26,50),"51+":(51,999)}.items()}}
h=Counter(tuple(s["exp"]) for s in sites if len(s["exp"])>=5)
top=h.most_common(8)
out["templates"]=[{"size":len(k),"sites":v,"bots":list(k)[:8]} for k,v in top]
out["templateShare"]=pct(sum(v for k,v in h.items() if v>=3),sum(h.values()))
# legacy tokens in lists
withlist=[s for s in sites if len(s["exp"])>=3]
out["legacyInLists"]=pct(sum(any(t in s["exp"] for t in LEGACY) for s in withlist),len(withlist))
# 6 content signals
cs=[s for s in sites if s["cs"]]
vals=Counter()
for s in cs:
    for line in s["cs"]:
        for kv in re.findall(r"([a-z\-]+)\s*=\s*(yes|no)",line.lower()): vals["=".join(kv)]+=1
out["contentSignal"]={"sites":len(cs),"pct":pct(len(cs),N),"values":dict(vals.most_common(8))}
# 7 llms.txt contradiction
ll=[s for s in sites if s["llms"]]
out["llmsContradiction"]={"llmsWithRobots":len(ll),"blockGPTBot":pct(sum(s["eff"]["GPTBot"] for s in ll),len(ll)),
  "blockAnyTraining":pct(sum(any(s["eff"][t] for t in TRAIN) for s in ll),len(ll)),
  "baselineBlockGPTBot":pct(sum(s["eff"]["GPTBot"] for s in sites),N),
  "examples":[s["domain"] for s in sorted([s for s in ll if s["eff"]["GPTBot"]],key=lambda s:s["rank"])[:10]]}
# 8 TLDs
tl=defaultdict(list)
for s in sites: tl[s["tld"]].append(s)
out["tld"]=sorted([{"tld":"."+k,"n":len(v),"blocksAnyPct":pct(sum(bool(s["exp"]) for s in v),len(v)),"gptPct":pct(sum(s["eff"]["GPTBot"] for s in v),len(v))} for k,v in tl.items() if len(v)>=60],key=lambda x:-x["blocksAnyPct"])
# 9 per-operator consistency: search vs training per operator
pairs={"OpenAI":("GPTBot","OAI-SearchBot"),"Anthropic":("ClaudeBot","Claude-SearchBot"),"Perplexity":(None,"PerplexityBot"),"Mistral":("MistralAI-Training","MistralAI-Index")}
out["operatorSplit"]={}
for op,(tr,se) in pairs.items():
    if not tr: continue
    b=[s for s in sites if s["eff"][tr] and not s["star"]]
    out["operatorSplit"][op]={"trainingBlockers":len(b),"searchAlsoBlockedPct":pct(sum(s["eff"][se] for s in b),len(b))}
# 10 star-blocks
out["starBlock"]={"n":sum(s["star"] for s in sites),"pct":pct(sum(s["star"] for s in sites),N)}
# google-extended vs googlebot
ge=[s for s in sites if s["eff"]["Google-Extended"] and not s["star"]]
out["googleExtended"]={"blockers":len(ge),"googlebotAlsoBlocked":sum(s["eff"]["Googlebot"] for s in ge)}
# top1k rate per bot class
json.dump(out,open(os.path.join(HERE,"deep.json"),"w"),indent=1)
print(json.dumps(out,indent=1)[:6000])

# ---- strict zombie: ClaudeBot not named, * group has no Disallow:/ at all
raw={json.loads(l)["domain"]:json.loads(l) for l in open(os.path.join(HERE,"results.jsonl"))}
strict=[]
for s in zl:
    g=parse(raw[s["domain"]]["robots.txt"]["body"])
    star=[x for gg in g if "*" in gg["uas"] for x in gg["rules"]]
    if not s["named"]["ClaudeBot"] and not any(k=="disallow" and v in ("/","/*") for k,v in star):
        strict.append(s)
out["zombieStrict"]={"n":len(strict),"pct":pct(len(strict),len(zl)),"examples":[s["domain"] for s in sorted(strict,key=lambda s:s["rank"])[:15]]}
# ---- typo / non-ascii user-agent tokens that look like AI bots
bad=[];
KNOWN={t.lower() for t in tokens}
import unicodedata
for s in sites:
    body=raw[s["domain"]]["robots.txt"]["body"]
    for m in re.finditer(r"(?im)^\s*user-agent\s*:\s*(.+?)\s*$",body):
        ua=m.group(1)
        if any(ord(c)>127 for c in ua):
            norm=unicodedata.normalize("NFKC",ua).replace("‑","-").replace("‐","-").replace("–","-").replace(" "," ")
            if norm.lower().split("/")[0].strip() in KNOWN: bad.append((s["rank"],s["domain"],ua))
out["nonAsciiTokens"]={"sites":len({b[1] for b in bad}),"examples":[f"{d}: {u!r}" for r,d,u in sorted(bad)[:10]]}
# ---- template cluster domains
big=out["templates"][0]
key=None
for k,v in h.most_common(1): key=k
dom=[s for s in sites if tuple(s["exp"])==key]
out["topTemplate"]={"bots":list(key),"examples":[s["domain"] for s in sorted(dom,key=lambda s:s["rank"])[:15]],"tlds":Counter(s["tld"] for s in dom).most_common(6)}
json.dump(out,open(os.path.join(HERE,"deep.json"),"w"),indent=1)
print(json.dumps({k:out[k] for k in ["zombieStrict","nonAsciiTokens","topTemplate"]},indent=1))
