import json, os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import exalib as X
EXCL = ["reddit.com","x.com","twitter.com","facebook.com","youtube.com","linkedin.com"]
ENGINES = {
 "chatgpt": "ChatGPT search (OpenAI)", "chatgpt-atlas": "ChatGPT Atlas browser", "google-ai-overviews": "Google AI Overviews",
 "google-ai-mode": "Google AI Mode", "gemini": "Google Gemini app", "perplexity": "Perplexity", "comet": "Perplexity Comet browser",
 "claude": "Claude (Anthropic) web search", "copilot": "Microsoft Copilot", "meta-ai": "Meta AI assistant", "grok": "Grok (xAI)",
 "deepseek": "DeepSeek chatbot", "le-chat": "Mistral Le Chat", "you-com": "You.com", "brave": "Brave Search AI answers / Ask Brave",
 "kagi": "Kagi Assistant", "duckduckgo": "DuckDuckGo Duck.ai and DuckAssist", "amazon-rufus": "Amazon Rufus shopping assistant",
}
U_SCHEMA={"type":"object","properties":{"stats":{"type":"array","items":{"type":"object","properties":{
 "metric":{"type":"string","description":"weekly active users, monthly active users, daily active users, queries per day, paid subscribers, visits per month, etc."},
 "value":{"type":"string"},"as_of":{"type":"string","description":"date the number refers to, YYYY-MM or YYYY-MM-DD"},
 "stated_by":{"type":"string","description":"who stated it: company exec/official blog/earnings call, or third-party estimator name"}}}}}}
U_Q="Extract every usage number for {e}: weekly/monthly/daily active users, queries per day, subscribers, visits. Include the date it refers to and who stated it. Only numbers present on the page."
I_SCHEMA={"type":"object","properties":{
 "search_index":{"type":"string","description":"which web index/search provider grounds its answers (own index, Bing, Google, Brave, etc.) per the page"},
 "crawlers":{"type":"array","items":{"type":"string"},"description":"user-agent tokens of crawlers/fetchers it uses"},
 "referrer_domains":{"type":"array","items":{"type":"string"},"description":"domains that appear as referrer in analytics when users click links from it"},
 "utm":{"type":"string","description":"any utm_source parameter it appends to outbound links"},
 "ads":{"type":"string","description":"whether it shows ads, since when"},
 "launch":{"type":"string","description":"launch date of the product/feature"},
 "citation_behavior":{"type":"string","description":"how it shows sources/citations"}}}
I_Q="For {e}: what web search index or provider grounds its answers, which crawler user agents it uses, what referrer domain/utm appears in analytics for its outbound clicks, whether it shows ads, launch date, and how it cites sources. Only facts stated on the page."
jobs=[]
for slug,e in ENGINES.items():
    jobs.append((slug,"users",f"{e} weekly active users monthly active users 2026",U_Q.format(e=e),U_SCHEMA,8))
    jobs.append((slug,"users",f"how many people use {e} usage numbers",U_Q.format(e=e),U_SCHEMA,6))
    jobs.append((slug,"facts",f"{e} which search index powers its web answers and crawler user agent",I_Q.format(e=e),I_SCHEMA,8))
    jobs.append((slug,"facts",f"{e} referral traffic referrer utm_source analytics",I_Q.format(e=e),I_SCHEMA,6))
def one(j):
    slug,kind,q,sq,sc,n=j
    r=X.search(q,n=n,summary=sq,schema=sc,start="2025-01-01",exclude_domains=EXCL,kind="eng_"+kind)
    return [{"engine":slug,"kind":kind,"query":q,"url":x["url"],"title":x.get("title"),"published":(x.get("publishedDate") or "")[:10],"data":X.parse_summary(x)} for x in r.get("results",[])]
with ThreadPoolExecutor(6) as ex:
    rows=[r for rs in ex.map(one,jobs) for r in rs]
json.dump(rows,open(os.path.join(X.HERE,"raw","engines.json"),"w"),indent=1)
print("engines rows",len(rows),"spent $%.3f"%X.spent())

DOCS=["https://developers.openai.com/api/docs/bots","https://platform.openai.com/docs/bots",
 "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
 "https://docs.perplexity.ai/guides/bots","https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers",
 "https://developers.google.com/search/docs/crawling-indexing/google-user-triggered-fetchers","https://support.apple.com/en-us/119829",
 "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers","https://developer.amazon.com/amazonbot","https://commoncrawl.org/ccbot",
 "https://docs.mistral.ai/robots","https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot","https://about.you.com/youbot/",
 "https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0","https://developers.cloudflare.com/ai-crawl-control/reference/bots/",
 "https://www.kimi.ai/policies/kimi-crawlers","https://allenai.org/crawler","https://search.brave.com/help/brave-search-crawler",
 "https://help.openai.com/en/articles/20001207-ads-in-chatgpt-the-basics","https://help.openai.com/en/articles/20001047-ads-in-chatgpt",
 "https://openai.com/index/chatgpt-ads-expands-26-new-countries/","https://openai.com/index/testing-ads-in-chatgpt/",
 "https://openai.com/index/chatgpt-ads-expands-across-europe/"]
docs={}
for i in range(0,len(DOCS),8):
    r=X.contents(DOCS[i:i+8],text=40000,kind="docs")
    for x in r.get("results",[]): docs[x.get("url") or x.get("id")]= {"title":x.get("title"),"published":x.get("publishedDate"),"text":x.get("text","")}
json.dump(docs,open(os.path.join(X.HERE,"raw","docs.json"),"w"),indent=1)
print("docs",len(docs),"spent $%.3f"%X.spent())
