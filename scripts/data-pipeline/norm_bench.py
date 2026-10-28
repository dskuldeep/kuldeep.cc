import json, re
from urllib.parse import urlparse
from collections import Counter, defaultdict
rows=json.load(open("raw/ads_bench.json"))
seen={}
for r in rows:
    if r["url"] in seen or not r["data"]: continue
    seen[r["url"]]=r
def canon(m):
    m=(m or "").lower()
    if "cpm" in m or "per thousand" in m or "per mille" in m: return "CPM"
    if "cpc" in m or "cost per click" in m: return "CPC"
    if "ctr" in m or "click-through" in m or "click through" in m: return "CTR"
    if "roas" in m or "return on ad" in m: return "ROAS"
    if "cpa" in m or "cost per acq" in m or "cost per lead" in m or "cpl" in m or "cost per conv" in m: return "CPA"
    if "conversion rate" in m or m.strip() in ("cvr","cr") or "cvr" in m: return "CVR"
    if "min" in m and ("spend" in m or "commit" in m or "budget" in m): return "MIN_SPEND"
    return None
NUM=r"(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k|K|m|M|million|thousand)?\b"
def nums(v):
    out=[]
    for a,suf in re.findall(NUM, v):
        x=float(a.replace(",",""))
        if suf in ("k","K","thousand"): x*=1e3
        if suf in ("m","M","million"): x*=1e6
        out.append(x)
    return out
def cur(v):
    return "GBP" if "£" in v else "EUR" if "€" in v else "USD" if "$" in v or "usd" in v.lower() else None
dps=[]
for u,r in seen.items():
    d=r["data"] or {}
    for m in d.get("metrics") or []:
        v=str(m.get("value") or "")
        if not v or v.lower() in ("null","none"): continue
        c=canon(m.get("metric"))
        if not c: continue
        # skip comparison numbers about other platforms
        ctx=" ".join(str(m.get(k) or "") for k in ("attributed_to","industry","region","sample","data_period")).lower()
        vv=v.lower()
        if re.search(r"\b(google|meta|facebook|linkedin|bing|tiktok)\b", vv) and "chatgpt" not in vv: continue
        ns=nums(v)
        if not ns: continue
        lo,hi=min(ns[:2]),max(ns[:2])
        if c in ("CTR","CVR"):
            if "%" not in v: continue
        if c in ("CPM","CPC","CPA","MIN_SPEND") and not cur(v): continue
        if c=="ROAS" and hi>50: continue
        dps.append({"metric":c,"value":v.strip(),"low":lo,"high":hi,"currency":cur(v) if c not in ("CTR","CVR","ROAS") else None,
          "attributed_to":(m.get("attributed_to") or "").strip(),"industry":(m.get("industry") or "").strip(),"region":(m.get("region") or "").strip(),
          "sample":(m.get("sample") or "").strip(),"period":(m.get("data_period") or "").strip(),
          "first_party":bool(d.get("is_first_party_data")),"url":u,"domain":urlparse(u).netloc.replace("www.",""),
          "title":r["title"],"published":r["published"]})
print(len(dps)); print(Counter(d["metric"] for d in dps)); print(Counter(d["first_party"] for d in dps))
json.dump(dps,open("bench_norm.json","w"),indent=1)
