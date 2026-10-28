import json, re, statistics
from collections import defaultdict, Counter
d=json.load(open("bench_norm.json"))
OTHER=r"\b(google|meta|facebook|instagram|linkedin|bing|tiktok|netflix|search ads|youtube|amazon ads|first page sage|wordstream)\b"
REL=r"(more|less|lift|higher|lower|better|worse|increase|decrease|rose|fell|vs\.?|versus|compared|times|continue)"
NEWS={"digiday.com","adexchanger.com","adweek.com","adage.com","adage.substack.com","marketingbrew.com","emarketer.com","businessinsider.com","cnbc.com",
 "searchengineland.com","searchenginejournal.com","seroundtable.com","ppc.land","theinformation.com","axios.com","wsj.com","ft.com","bloomberg.com","reuters.com",
 "techcrunch.com","theverge.com","campaignlive.com","mediapost.com","martech.org","thenextweb.com","qz.com","forbes.com","lbbonline.com","ppc.live","aisearch.similarweb.com"}
keep=[]
for x in d:
    v=x["value"].lower(); a=x["attributed_to"].lower()
    if re.search(OTHER,v) or re.search(OTHER,a): continue
    if x["metric"] in ("CTR","CVR","ROAS") and re.search(REL,v): continue
    if x["metric"]=="CTR" and not (0.05<=x["high"]<=15): continue
    if x["metric"]=="CVR" and not (0.01<=x["high"]<=30): continue
    if x["metric"]=="CPM" and not (1<=x["high"]<=150): continue
    if x["metric"]=="CPC" and not (0.02<=x["high"]<=60): continue
    if x["metric"]=="ROAS" and not (0.1<=x["high"]<=15): continue
    if x["metric"]=="CPA" and not (1<=x["high"]<=5000): continue
    if x["metric"]=="MIN_SPEND" and x["high"]>1e6: continue
    if re.search(r"not (explicitly|directly) (stated|quantified)", v): continue
    x["source_type"]="official" if "openai.com" in x["domain"] else "trade press" if x["domain"] in NEWS else "agency / vendor"
    keep.append(x)
g=defaultdict(list)
for x in keep: g[(x["metric"],round(x["low"],2),round(x["high"],2),x["currency"])].append(x)
rows=[]
for k,xs in g.items():
    xs.sort(key=lambda y:(y["published"] or "9999"))
    rank={"official":0,"trade press":1,"agency / vendor":2}
    best=sorted(xs,key=lambda y:(rank[y["source_type"]], y["published"] or "9999"))[0]
    att=Counter(y["attributed_to"] for y in xs if y["attributed_to"]).most_common(1)
    rows.append({"metric":k[0],"value":best["value"],"low":k[1],"high":k[2],"currency":k[3],
      "measured_by":(att[0][0] if att else best["domain"]),"industry":best["industry"],"region":best["region"],"sample":best["sample"],"period":best["period"],
      "source_url":best["url"],"source_domain":best["domain"],"source_title":best["title"],"source_type":best["source_type"],"published":best["published"],
      "cited_by":len(set(y["domain"] for y in xs)),"citing_urls":sorted(set(y["url"] for y in xs))[:8]})
print(len(keep),"kept ->",len(rows),"distinct")
print(Counter(r["metric"] for r in rows)); print(Counter(r["source_type"] for r in rows))
json.dump(rows,open("bench_curated.json","w"),indent=1)
for met in ["CPM","CPC","CTR","CVR","CPA","ROAS","MIN_SPEND"]:
    for r in sorted([r for r in rows if r["metric"]==met],key=lambda r:-r["cited_by"]):
        print(f"{met:9} {r['value'][:42]:42} | {r['measured_by'][:28]:28} | {r['source_domain'][:24]:24} | {r['published']} | x{r['cited_by']} | {r['industry'][:18]} | {r['region'][:10]}")
