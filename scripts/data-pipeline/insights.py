"""Derived series for /data charts: monthly ad price medians, CTR distribution, robots deep-dive stats."""
import json, os, statistics, sys
from collections import defaultdict, Counter
HERE=os.path.dirname(os.path.abspath(__file__)); OUT=sys.argv[1]
B=json.load(open(os.path.join(HERE,"..","exa","bench_norm.json")))
deep=json.load(open(os.path.join(HERE,"..","study","deep.json")))
adv=json.load(open(os.path.join(OUT,"chatgpt-ads-advertisers.json")))["rows"]
months=["2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10"]
def monthly(m,cap):
    by=defaultdict(list)
    for x in B:
        if x["metric"]==m and x["published"] and (m=="CTR" or x["currency"]=="USD") and (x["high"]<=x["low"]*3 or x["low"]==0) and x["high"]<=cap:
            by[x["published"][:7]].append((x["low"]+x["high"])/2)
    return [{"month":k,"median":round(statistics.median(by[k]),2) if len(by[k])>=2 else None,"n":len(by[k])} for k in months]
ctr=[(x["low"]+x["high"])/2 for x in B if x["metric"]=="CTR" and x["high"]<=5 and x["high"]<=x["low"]*3]
bins=[("<0.5%",0,0.5),("0.5–0.75%",0.5,0.75),("0.75–1%",0.75,1.0),("1–1.5%",1.0,1.5),("1.5–2%",1.5,2.0),("2–3%",2.0,3.0),("3%+",3.0,99)]
firsts=Counter((a["firstReported"] or "")[:7] for a in adv if a["firstReported"])
out={
 "ads":{
  "cpcByMonth":monthly("CPC",40),"cpmByMonth":monthly("CPM",150),
  "ctrDistribution":[{"label":l,"count":sum(1 for c in ctr if a<=c<b)} for l,a,b in bins],
  "countriesByMonth":[{"month":m,"countries":c} for m,c in zip(months,[1,4,4,4,5,5,40,60,89])],
  "advertisersFirstReported":[{"month":m,"count":firsts.get(m,0)} for m in months],
  "minimumSpend":[{"date":"2026-02","label":"Pilot commitment","usd":250000},{"date":"2026-04","label":"Self-serve beta","usd":50000},{"date":"2026-05","label":"Daily budget, no minimum","usd":25}],
 },
 "robots":{k:deep[k] for k in ["leak","blocksAllMajorTraining","typology","tld","contentSignal","llmsContradiction","listLength","templateShare","legacyInLists","zombieStrict","nonAsciiTokens","operatorSplit","starBlock","googleExtended"]},
}
out["robots"]["topTemplate"]={"size":len(deep["topTemplate"]["bots"]),"sites":deep["templates"][0]["sites"]}
json.dump(out,open(os.path.join(OUT,"insights.json"),"w"),indent=1,ensure_ascii=False)
print("ok")
