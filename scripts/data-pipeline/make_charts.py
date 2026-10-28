import json, os, sys, statistics
from collections import defaultdict, Counter
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from chart import *
D="/Users/kuldeeppaul/Working/kuldeep.cc/src/data"
S=json.load(open(f"{D}/robots-study.json")); deep=json.load(open("../study/deep.json"))
bench=json.load(open(f"{D}/chatgpt-ads-benchmarks.json")); adv=json.load(open(f"{D}/chatgpt-ads-advertisers.json"))
B=json.load(open("../exa/bench_norm.json"))
pct={b["token"]:b["blockedPct"] for b in S["bots"]}
SRC_R="Source: robots.txt files of the Tranco top 10,000 domains, fetched Oct 29, 2026. Analysis: Kuldeep Paul"
SRC_A="Source: ChatGPT Ads Index, 184 public data points from 73 sources. Compiled by Kuldeep Paul"
out={}
def save(name,svg): open(f"{name}.svg","w").write(svg); out[name]=name
# ---------- Blog A: robots
top=[b for b in S["bots"] if b["token"] not in ("Webzio-Extended","Googlebot")][:14]
save("a1-most-blocked",hbar("The most-blocked AI crawlers","Share of top-10k sites with a robots.txt that fully disallow each bot",SRC_R,
  [(b["token"],b["blockedPct"]) for b in top],highlight={"GPTBot","ClaudeBot","Google-Extended","CCBot"},label_w=250))
save("a2-train-vs-search",grouped_hbar("Publishers block training, not answers","Share of sites blocking each operator's training, search and user-fetch bots",SRC_R,
  [("OpenAI",[pct["GPTBot"],pct["OAI-SearchBot"],pct["ChatGPT-User"]]),("Anthropic",[pct["ClaudeBot"],pct["Claude-SearchBot"],pct["Claude-User"]]),
   ("Perplexity",[None,pct["PerplexityBot"],pct["Perplexity-User"]]),("Meta",[pct["Meta-ExternalAgent"],pct["meta-webindexer"],pct["Meta-ExternalFetcher"]]),
   ("Mistral",[pct["MistralAI-Training"],pct["MistralAI-Index"],pct["MistralAI-User"]])],
  [("Training crawler","#0a0a0a"),("Search / index crawler","#8a8a8a"),("User-triggered fetcher","#cfcfcf")]))
leak=deep["leak"]["openPct"]
save("a3-leaky",hbar("Blocking GPTBot rarely means blocking AI training",f"Of {deep['leak']['gptBlockers']} sites that block GPTBot, share that leave each other training crawler open",SRC_R,
  sorted([(k,v) for k,v in leak.items()],key=lambda x:-x[1]),label_w=330,maxv=100,highlight={"Google-Extended","Applebot-Extended","Meta-ExternalAgent","Amazonbot","ClaudeBot"}))
t=deep["typology"]
save("a4-typology",stack("What 5,701 robots.txt files say to AI","Each site classified by how its robots.txt treats AI crawlers",SRC_R,[
  ("No AI-specific rules",t["no AI rules"],"#ffffff"),("Names AI bots but blocks none",t["names AI bots, blocks none"],"#e3e3e3"),
  ("Blocks AI training only",t["blocks training only"],"#9a9a9a"),("Blocks training and AI search / agents",t["blocks training and AI search/agents"],"#0a0a0a"),
  ("Blocks every bot via *",t["blocks every bot (*)"],"#555555"),("Blocks AI search / agents only",t["blocks search/agents only"],"#cccccc")]))
tl=[x for x in deep["tld"]]
save("a5-tld",hbar("Who blocks AI depends on where you are","Share of top-10k sites (with robots.txt) blocking at least one AI crawler, by top-level domain",SRC_R,
  [(f"{x['tld']}  (n={x['n']})",x["blocksAnyPct"]) for x in tl],label_w=230,highlight={f"{x['tld']}  (n={x['n']})" for x in tl if x['tld'] in ('.fr','.de')}))
lc=deep["llmsContradiction"]
save("a6-llms",vbar("Two camps: walls and welcome mats","Share of sites blocking GPTBot: all sites vs. sites that publish an llms.txt",SRC_R,
  [("All sites with robots.txt",lc["baselineBlockGPTBot"]),("Sites with llms.txt",lc["blockGPTBot"])],fmt=lambda v:f"{v}%"))
ld=deep["listLength"]["dist"]
save("a7-listlen",vbar("AI blocklists are long, copied and stale",f"Number of AI bots each blocking site disallows (median {deep['listLength']['median']}, longest {deep['listLength']['max']})",SRC_R,
  [(f"{k} bots",v) for k,v in ld.items()],fmt=lambda v:f"{v:,}",ylab="Sites"))
# ---------- Blog B: ads
months=["2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10"]
ml=["Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"]
def series(m,cap):
    by=defaultdict(list)
    for x in B:
        if x["metric"]==m and x["published"] and (m in("CTR",) or x["currency"]=="USD") and (x["high"]<=x["low"]*3 or x["low"]==0) and x["high"]<=cap:
            by[x["published"][:7]].append((x["low"]+x["high"])/2)
    return [round(statistics.median(by[k]),2) if len(by[k])>=2 else None for k in months],{k:len(by[k]) for k in months}
cpc,ncpc=series("CPC",40); cpm,ncpm=series("CPM",150)
save("b1-cpc-flat",lines("The $4 click","Median reported ChatGPT Ads CPC by month of publication, USD",SRC_A,[("CPC","#0a0a0a","",cpc)],ml,fmt=lambda v:f"${v:.2f}" if isinstance(v,float) else f"${v}",maxv=8,
  annot=[(2,4.0,"CPC bidding arrives, $3–5 recommended")]))
save("b2-cpm",lines("CPMs fell, then wandered","Median reported ChatGPT Ads CPM by month of publication, USD",SRC_A,[("CPM","#0a0a0a","",cpm)],ml,fmt=lambda v:f"${v:.0f}",maxv=90))
import math
mins=[("Feb 2026 · pilot commitment",250000,"$250,000"),("Apr 2026 · self-serve beta",50000,"$50,000"),("May 2026 · no minimum, daily budget",25,"$25 a day")]
lab={round(math.log10(v),4):t for _,v,t in mins}
save("b3-minimum",hbar("The price of entry fell 10,000x in four months","Minimum spend to advertise in ChatGPT (bars on a log scale)",
  "Sources: CNBC, Adweek, Digiday, PPC Land, OpenAI Help Center. Compiled by Kuldeep Paul",
  [(l,round(math.log10(v),4)) for l,v,_ in mins],fmt=lambda v:lab[v],label_w=400,maxv=5.6))
ctrs=sorted((x["low"]+x["high"])/2 for x in B if x["metric"]=="CTR" and x["high"]<=5 and (x["high"]<=x["low"]*3))
bins=[("<0.5%",0,0.5),("0.5–0.75%",0.5,0.75),("0.75–1%",0.75,1.0),("1–1.5%",1.0,1.5),("1.5–2%",1.5,2.0),("2–3%",2.0,3.0),("3%+",3.0,99)]
save("b4-ctr",vbar("Nine in ten reported CTRs are under 2%",f"Distribution of {len(ctrs)} reported ChatGPT Ads click-through rates",SRC_A,
  [(l,sum(1 for c in ctrs if a<=c<b)) for l,a,b in bins],ylab="Reports",highlight={"0.5–0.75%","0.75–1%","1–1.5%"}))
cty=[1,4,4,4,5,5,40,60,89]
save("b5-countries",lines("From one country to 89 in eight months","Countries where ChatGPT Ads are available, end of month",
  "Sources: OpenAI announcements and help center; Reuters; The Hindu BusinessLine. Compiled by Kuldeep Paul",
  [("countries","#0a0a0a","",cty)],ml,fmt=lambda v:f"{int(v)}",maxv=100,step=True))
cats=Counter(r["category"] for r in adv["rows"]).most_common(10)
save("b6-categories",hbar("Who is buying ChatGPT ads",f"Advertisers named in public reporting, by category (top 10 of {len(adv['rows'])} brands)",
  "Source: ChatGPT Ads Index, advertisers dataset. Compiled by Kuldeep Paul",cats,fmt=lambda v:f"{v}",highlight={"Software","Finance","Insurance"},label_w=260))
# ---------- Blog C: the AI search stack
save("c1-reach",hbar("Google's AI surfaces reach the most people","Officially stated users of the largest AI answer surfaces (millions)",
  "Sources: Google earnings and I/O 2026; OpenAI (Oct 2026). Compiled by Kuldeep Paul",
  [("AI Overviews · monthly",2500),("ChatGPT · weekly",1200),("AI Mode · monthly",1000),("Gemini app · monthly",950)],
  fmt=lambda v:f"{v:,}M",label_w=320,highlight={"AI Overviews · monthly","AI Mode · monthly","Gemini app · monthly"}))
save("c2-optout",grouped_hbar("You can opt out of the small engines, not the big one","Share of top-10k sites blocking the crawler that controls each engine's answers (AI Overviews: Googlebot)",SRC_R,
  [("ChatGPT",[pct["OAI-SearchBot"],pct["GPTBot"]]),("Claude",[pct["Claude-SearchBot"],pct["ClaudeBot"]]),("Perplexity",[pct["PerplexityBot"],None]),
   ("Gemini",[pct["Google-Extended"],None]),("AI Overviews",[pct["Googlebot"],None])],
  [("Answer / search crawler","#0a0a0a"),("Training crawler","#bdbdbd")],maxv=20))
wk=[("Feb 25",400),("Jul 25",700),("Oct 25",800),("Feb 26",900),("Aug 26",1000),("Oct 26",1200)]
save("c3-chatgpt-growth",vbar("ChatGPT tripled in 20 months","ChatGPT weekly active users, millions, as stated by OpenAI",
  "Sources: OpenAI posts and DevDay; secondary reporting where noted on kuldeep.cc/data. Compiled by Kuldeep Paul",wk,fmt=lambda v:f"{v:,}"))
gm=[("Jul 25",450),("Feb 26",750),("Jul 26",950)]
save("c4-gemini-growth",vbar("Gemini more than doubled in a year","Gemini app monthly active users, millions, as stated by Google",
  "Sources: Alphabet earnings calls. Compiled by Kuldeep Paul",gm,fmt=lambda v:f"{v:,}"))
print("charts:",len(out))
