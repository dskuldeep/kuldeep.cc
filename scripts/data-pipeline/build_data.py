import json, os, re, statistics, sys
from urllib.parse import urlparse
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from engines import ENGINES, USERS, REFERRERS
from crawlers import F
EXA=os.path.join(HERE,"..","exa"); FREE=os.path.join(HERE,"..","free")
OUT=sys.argv[1]; os.makedirs(OUT,exist_ok=True)
UPDATED="2026-10-29"
def slug(s): return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-")
def dump(name,obj): json.dump(obj,open(os.path.join(OUT,name+".json"),"w"),indent=1,ensure_ascii=False)

# ---------- ChatGPT ads: benchmarks
GENERIC=r"^(our|this site|article|unknown|n/?a|the page|chatgpt ads|openai ads team / this site|agency blogs|practitioner|case study|advertisers?$|$)"
rows=json.load(open(os.path.join(EXA,"bench_curated.json")))
DROP={("seroundtable.com","5.4%"),("customdigitalsolutions.co",None),("campaignlive.com","6.4%"),("digitalagencynetwork.com","6.64%")}
rows=[r for r in rows if not (r["metric"]=="CPM" and r["source_domain"] in ("ppc.land","digiday.com") and r["low"] in (4.82,7.63,10.33,3.02))]
rows=[r for r in rows if not any(r["source_domain"]==d and (v is None or r["value"].strip()==v) for d,v in DROP)]
for r in rows:
    if r["source_domain"]=="adformatie.nl" and r["metric"]=="CTR": r["low"]=r["high"]=0.6
bench=[]
for i,r in enumerate(sorted(rows,key=lambda r:(["CPM","CPC","CTR","CVR","CPA","ROAS","MIN_SPEND"].index(r["metric"]),-r["cited_by"],r["low"]))):
    mb=r["measured_by"].strip()
    if re.search(GENERIC,mb.lower()) or len(mb)>48: mb=r["source_domain"]
    bench.append({"id":i+1,"metric":r["metric"].replace("MIN_SPEND","Min. spend"),"value":r["value"][:90],"low":r["low"],"high":r["high"],"currency":r["currency"],
      "measuredBy":mb,"context":"; ".join(x for x in [r["industry"][:40],r["region"][:30],r["sample"][:60]] if x and x.lower() not in ("null","none","n/a","not specified")),
      "sourceType":r["source_type"],"sourceTitle":(r["source_title"] or r["source_domain"])[:140],"sourceUrl":r["source_url"],"sourceDomain":r["source_domain"],
      "published":r["published"] or None,"citedBy":r["cited_by"]})
CAP={"CTR":5,"CVR":15}
def med(metric,cur=True):
    vals=[(b["low"]+b["high"])/2 for b in bench if b["metric"]==metric and (not cur or b["currency"]=="USD") and (b["high"]<=b["low"]*3 or b["low"]==0) and b["high"]<=CAP.get(metric,1e9)]
    return {"median":round(statistics.median(vals),2),"n":len(vals),"min":round(min(vals),2),"max":round(max(vals),2)} if vals else None
summary={"cpm":med("CPM"),"cpc":med("CPC"),"ctr":med("CTR",False),"cvr":med("CVR",False),
 "dataPoints":len(bench),"sources":len(set(b["sourceDomain"] for b in bench)),
 "mentionsReviewed":sum(r["cited_by"] for r in rows)}
dump("chatgpt-ads-benchmarks",{"updated":UPDATED,"summary":summary,"rows":bench})
print("bench",summary)

# ---------- timeline
tl=json.load(open(os.path.join(EXA,"time_curated.json")))
dump("chatgpt-ads-timeline",{"updated":UPDATED,"rows":[{"id":i+1,"date":t["date"],"title":t["title"],"detail":t["detail"],"type":t["type"],"sourceUrl":t["source_url"],"sourceDomain":t["source_domain"]} for i,t in enumerate(tl)]})

# ---------- advertisers
adv=json.load(open(os.path.join(EXA,"adv_curated.json")))
dump("chatgpt-ads-advertisers",{"updated":UPDATED,"rows":[{"id":i+1,"brand":a["brand"],"category":a["category"],"market":a["market"] or None,"evidence":a["evidence"],
  "sourceUrl":a["source_url"],"sourceDomain":a["source_domain"],"firstReported":a["first_reported"] or None,"sources":a["sources"]} for i,a in enumerate(sorted(adv,key=lambda a:(-a["sources"],a["brand"].lower())))]})
print("adv",len(adv),"timeline",len(tl))

# ---------- engines + users + referrers
users=[{"engine":e,"metric":m,"value":v,"asOf":d,"statedBy":s,"sourceUrl":u} for e,m,v,d,s,u in USERS]
dump("ai-engines",{"updated":UPDATED,"rows":ENGINES})
dump("ai-user-numbers",{"updated":UPDATED,"rows":users})
dump("ai-referrers",{"updated":UPDATED,"rows":[{"host":h,"product":p,"operator":o,"note":n} for h,p,o,n in REFERRERS]})

# ---------- crawlers: featured + full registry from ai.robots.txt (MIT)
reg=json.load(open(os.path.join(FREE,"robots.json")))
def clean(v):
    v=re.sub(r"\[([^\]]+)\]\([^)]+\)",r"\1",v or "").strip()
    return None if not v or v.lower().startswith("unclear") else v
featured=[]; ftok=set()
for tok,op,purpose,product,resp,ua,ips,docs,summ in F:
    featured.append({"token":tok,"slug":slug(tok),"operator":op,"purpose":purpose,"product":product,"respectsRobots":resp,"userAgent":ua,"ipList":ips,"docs":docs,"summary":summ,"featured":True})
    ftok.add(tok.lower())
others=[]
seen_reg=set()
for tok,v in reg.items():
    k=tok.lower().split("/")[0]
    if tok.lower() in ftok or k in ftok or k in seen_reg: continue
    seen_reg.add(k)
    others.append({"token":tok,"operator":clean(v.get("operator")),"function":clean(v.get("function")),"respectsRobots":clean(v.get("respect")),"featured":False})
others.sort(key=lambda x:x["token"].lower())
dump("ai-crawlers",{"updated":UPDATED,"featured":featured,"registry":others,"registrySource":"https://github.com/ai-robots-txt/ai.robots.txt"})
print("crawlers",len(featured),len(others))
