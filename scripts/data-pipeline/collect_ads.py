import json, os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import exalib as X

START = "2025-12-01"
EXCL = ["linkedin.com","reddit.com","x.com","twitter.com","facebook.com","youtube.com","medium.com"]

M_SCHEMA = {"type":"object","properties":{
 "is_first_party_data":{"type":"boolean","description":"true if the publisher ran the ads themselves or reports its own/clients' campaign data; false if quoting others"},
 "metrics":{"type":"array","items":{"type":"object","properties":{
  "metric":{"type":"string","description":"one of CPM, CPC, CTR, CVR, CPA, ROAS, min_spend, impressions, clicks, spend, other"},
  "value":{"type":"string","description":"exact value as stated, with unit/currency"},
  "attributed_to":{"type":"string","description":"who measured/reported it (agency, advertiser, OpenAI, publisher itself)"},
  "industry":{"type":"string"},
  "region":{"type":"string"},
  "sample":{"type":"string","description":"sample size, spend, or duration if stated"},
  "data_period":{"type":"string"}}}}}}
M_Q = ("Extract every numeric ChatGPT Ads (OpenAI ads in ChatGPT) pricing or performance figure stated on the page: "
       "CPM, CPC, CTR, conversion rate, CPA, ROAS, minimum spend/commitment, impressions, clicks, spend. "
       "Include who measured it. Do not invent; skip numbers about Google/Meta unless used as comparison context.")

T_SCHEMA = {"type":"object","properties":{"events":{"type":"array","items":{"type":"object","properties":{
 "date":{"type":"string","description":"YYYY-MM-DD or YYYY-MM as precise as stated"},
 "event":{"type":"string","description":"one sentence, factual"},
 "type":{"type":"string","description":"launch, expansion, format, policy, pricing, tooling, partnership, metric"}}}}}}
T_Q = ("List every dated milestone about ads in ChatGPT (OpenAI advertising): announcements, tests, launches, country expansions, "
       "new ad formats, self-serve/Ads Manager, pricing changes, policy rules, advertiser counts, partnerships. Only items with a date stated or clearly implied by the article date.")

A_SCHEMA = {"type":"object","properties":{"advertisers":{"type":"array","items":{"type":"object","properties":{
 "brand":{"type":"string"},"category":{"type":"string"},
 "evidence":{"type":"string","description":"what the page says about this brand advertising in ChatGPT"}}}}}}
A_Q = ("List brands/companies the page says are advertising in ChatGPT ads (running ads, launch partners, early advertisers, case studies). "
       "Exclude brands only mentioned as ad tech vendors or agencies unless they run their own ads.")

bench_q = [
 "ChatGPT ads CPM pricing", "ChatGPT ads CPC results", "ChatGPT ads click-through rate data", "ChatGPT ads conversion rate case study",
 "ChatGPT ads ROAS results", "we tested ChatGPT ads results", "ChatGPT ads benchmark report", "ChatGPT ads B2B results",
 "ChatGPT ads ecommerce results", "ChatGPT ads SaaS campaign results", "ChatGPT ads minimum spend commitment",
 "ChatGPT ads cost per click compared to Google Ads", "OpenAI ads $60 CPM advertisers", "ChatGPT ads getting cheaper CPM drop",
 "ChatGPT ads agency results clients", "ChatGPT ads performance first month", "ChatGPT ads Europe results",
 "ChatGPT ads UK results", "ChatGPT ads cost per acquisition", "ChatGPT ads CPC auction pricing launch",
 "ChatGPT ads lead generation results", "ChatGPT ads travel brand results", "ChatGPT ads finance insurance results",
 "ChatGPT ads retail results", "ChatGPT ads healthcare", "ChatGPT ads local business results",
 "ChatGPT ads vs Meta ads performance", "ChatGPT Ads Manager self-serve campaign results", "ChatGPT ads impressions clicks spend data",
 "early ChatGPT ads advertiser feedback numbers",
]
time_q = [
 "OpenAI announces ads in ChatGPT", "OpenAI testing ads in ChatGPT free and Go tiers", "ChatGPT ads launch United States",
 "ChatGPT ads expands to new countries", "ChatGPT ads expands across Europe", "ChatGPT Ads Manager self-serve launch",
 "ChatGPT ads new ad formats", "ChatGPT ads policy sensitive topics health politics", "ChatGPT ads CPC bidding introduced",
 "ChatGPT ads advertisers number OpenAI", "ChatGPT ads partnership ad tech", "ChatGPT ads shopping product ads",
 "ChatGPT ads conversions API pixel measurement", "ChatGPT ads minimum spend lowered", "ChatGPT ads Plus Pro users ad-free",
 "OpenAI advertising revenue projection", "OpenAI hires ads executive", "ChatGPT ads India launch", "ChatGPT ads Canada Australia",
 "ChatGPT ads Japan Brazil launch", "ChatGPT ads agency partners program", "ChatGPT ads API",
 "ChatGPT ads changelog", "ChatGPT ads timeline", "Fidji Simo ads ChatGPT",
]
adv_q = [
 "brands advertising on ChatGPT", "first advertisers in ChatGPT ads launch partners", "brand runs ads in ChatGPT",
 "retailer advertising in ChatGPT ads", "travel company ChatGPT ads", "bank fintech advertising ChatGPT",
 "SaaS company runs ChatGPT ads", "CPG brand ChatGPT ads", "automaker ChatGPT ads", "telecom ChatGPT ads",
 "ChatGPT ads case study brand", "Target Walmart ChatGPT ads", "ChatGPT ads examples screenshots brands",
 "which companies are advertising in ChatGPT", "ChatGPT ads early adopters brands list", "holding company agency ChatGPT ads clients",
 "DTC brand ChatGPT ads test", "insurance company ChatGPT ads", "education company ChatGPT ads", "ChatGPT sponsored ads brand appears",
]

def run(qs, sq, schema, kind, n=10):
    def one(q):
        r = X.search(q, n=n, summary=sq, schema=schema, start=START, exclude_domains=EXCL, kind=kind)
        out = []
        for x in r.get("results", []):
            out.append({"query": q, "url": x["url"], "title": x.get("title"), "published": (x.get("publishedDate") or "")[:10],
                        "author": x.get("author"), "data": X.parse_summary(x)})
        return out
    with ThreadPoolExecutor(6) as ex:
        res = [row for rows in ex.map(one, qs) for row in rows]
    return res

for name, qs, sq, sc in [("ads_bench", bench_q, M_Q, M_SCHEMA), ("ads_time", time_q, T_Q, T_SCHEMA), ("ads_adv", adv_q, A_Q, A_SCHEMA)]:
    rows = run(qs, sq, sc, name)
    json.dump(rows, open(os.path.join(X.HERE, "raw", name + ".json"), "w"), indent=1)
    print(name, len(rows), "rows; spent so far $%.3f" % X.spent())
