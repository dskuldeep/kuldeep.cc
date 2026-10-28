import json, re
from urllib.parse import urlparse
from collections import defaultdict
adv=json.load(open("raw/ads_adv.json"))
ALIAS={"target corp.":"Target","albertsons cos. inc.":"Albertsons","albertsons companies":"Albertsons","albertsons cos.":"Albertsons",
 "williams-sonoma inc.":"Williams-Sonoma","williams‑sonoma":"Williams-Sonoma","mrs. myers":"Mrs. Meyer's","mrs. meyers":"Mrs. Meyer's","mrs. meyer’s":"Mrs. Meyer's",
 "audible (amazon-owned)":"Audible","the knot worldwide (the knot":"The Knot Worldwide","the knot":"The Knot Worldwide","cursor (spacex acquisition)":"Cursor",
 "bestmoney.com":"BestMoney","lowe’s":"Lowe's","vistaprint us":"VistaPrint","the home depot":"Home Depot","dbi (designer brands inc) /":"DSW",
 "intuit quickbooks":"Intuit","llbean.com":"L.L.Bean","temu.com":"Temu","geico":"GEICO","next insurance":"ERGO NEXT Insurance","enterprise":"Enterprise Mobility",
 "finder au":"Finder","variant group (pdf.net)":"pdf.net","university of new england (u":"University of New England","nerdwallet":"NerdWallet",
 "zoominfo technologies inc":"ZoomInfo","endurance warranty":"Endurance Warranty","make b. – boticário's makeup":"Boticário (Make B.)","booking holdings":"Booking Holdings"}
EXCL={"roundel","omnicom media","chatgpt ads","booking.com","salesforce","capterra","cme automotive","wiredco","apple","mars","cogwheel marketing","zanobe",
 "japan airlines","anthropic","spacex","wkn d","wknd","intercom","pipedrive","gong","vanta","drata","secureframe","freshdesk","zendesk","front","help scout",
 "shopify","technode","ppc land","techjournal","search engine roundtable","neugenm","tru commerce","heirloom groceries","georgia-pacific","flywheel",
 "chatgpt ads (openai)","interpublic group (ipg)","wpp media","opascope","solved6","index lab","q1media","gpt ads ai","promptmarketing","mav","retell ai","galgorm group","event helper"}
CAT={"Target":"Retail","Adobe":"Software","Expedia":"Travel","Williams-Sonoma":"Retail","Best Buy":"Retail","Ford":"Automotive","Audible":"Media & entertainment",
 "Mazda":"Automotive","Jotform":"Software","BestMoney":"Finance","Audemars Piguet":"Luxury","Mrs. Meyer's":"Consumer goods","Qualcomm":"Technology",
 "Monday.com":"Software","HubSpot":"Software","Wayfair":"Retail","Enterprise Mobility":"Travel","The Knot Worldwide":"Marketplace","Albertsons":"Grocery",
 "Lowe's":"Retail","VistaPrint":"Small-business services","Sephora":"Retail","New Balance":"Apparel","HelloFresh":"Food delivery","Delta Vacations":"Travel",
 "Pottery Barn":"Retail","IndusInd Bank":"Finance","Canva":"Software","Cursor":"Software","WeightWatchers":"Health & wellness","Dose":"Health & wellness",
 "Capital One":"Finance","Intuit":"Finance","Hungryroot":"Food delivery","NerdWallet":"Finance","Newegg":"Retail","Top10.com":"Comparison site",
 "L’Oréal":"Beauty","Betterment":"Finance","KFC":"Restaurants","Boticário (Make B.)":"Beauty","Chewy":"Retail","Ulta Beauty":"Retail","Home Depot":"Retail",
 "Petco":"Retail","Gap":"Apparel","Marriott":"Travel","Inspirato":"Travel","Super.com":"Travel","Wyndham Business":"Travel","Grand Geneva Resort":"Travel",
 "Montage Hotels & Resorts":"Travel","Trivago":"Travel","Brush Creek Ranch":"Travel","ABN AMRO":"Finance","Bajaj Life Insurance":"Insurance","Tanishq":"Retail",
 "Fastrack":"Apparel","Traya":"Health & wellness","Tata Neu":"Retail","Shaadi.com":"Marketplace","Axis Max Life":"Insurance","Palmonas":"Retail",
 "Robinhood":"Finance","Thrivent Bank":"Finance","Creditas":"Finance","Resume.io":"Software","LegalNature":"Legal services","Attio":"Software","HiBob":"Software",
 "Cloudflare":"Technology","Optimizely":"Software","Mastercard":"Finance","Sago":"Software","Outset":"Software","Portland Leather":"Apparel","Cars.com":"Automotive",
 "Bouygues Telecom":"Telecom","Barclays":"Finance","Barclaycard":"Finance","Rocket Mortgage":"Finance","NAB":"Finance","Vanguard":"Finance","BMO":"Finance",
 "giffgaff":"Telecom","Vodafone":"Telecom","Sky":"Telecom","Finder":"Comparison site","Coursera":"Education","Lyca Mobile USA":"Telecom","EverQuote":"Insurance",
 "Angi":"Home services","Tumble":"Pets","Temu":"Retail","Runway AI":"Software","Fubo":"Media & entertainment","L.L.Bean":"Apparel","Ironclad":"Software",
 "Endurance Warranty":"Automotive","Talkpal":"Education","Kwik Fit":"Automotive","Ramp":"Finance","Neon":"Software","SoFi":"Finance","BMW USA":"Automotive",
 "Volkswagen":"Automotive","Turo":"Travel","Booking Holdings":"Travel","Scheels":"Retail","GetYourGuide Deutschland":"Travel","Talent Inc.":"Recruiting",
 "Quince":"Apparel","Zapier":"Software","The Wall Street Journal":"Media & entertainment","Speechify":"Software","Preply":"Education","Advance Auto Parts":"Automotive",
 "AT&T":"Telecom","Lemonade":"Insurance","Darktrace":"Software","Wiz":"Software","Sage":"Software","Span.app":"Software","Harbor Freight":"Retail",
 "ZoomInfo":"Software","Aikido Security":"Software","AirOps":"Software","DSW":"Apparel","BEHR":"Consumer goods","Zalando":"Apparel","ERGO NEXT Insurance":"Insurance",
 "GEICO":"Insurance","Allianz":"Insurance","New York Life":"Insurance","Forbes":"Media & entertainment","Hiscox":"Insurance","Bradesco Seguros Group":"Insurance",
 "Budget Direct":"Insurance","pdf.net":"Software","Consolidated Insurances":"Insurance","The Meadowbrook School":"Education","UNIVO Education":"Education",
 "University of New England":"Education"}
COUNTRY={"IndusInd Bank":"India","Bajaj Life Insurance":"India","Tanishq":"India","Fastrack":"India","Traya":"India","Tata Neu":"India","Shaadi.com":"India",
 "Axis Max Life":"India","Palmonas":"India","KFC":"India","Boticário (Make B.)":"Brazil","Creditas":"Brazil","Bradesco Seguros Group":"Brazil","ABN AMRO":"Netherlands",
 "Bouygues Telecom":"France","Barclays":"UK","Barclaycard":"UK","giffgaff":"UK","Vodafone":"UK","Sky":"UK","Kwik Fit":"UK","Hiscox":"UK","Zalando":"Europe",
 "NAB":"Australia","Vanguard":"Australia","Finder":"Australia","Budget Direct":"Australia","Consolidated Insurances":"Australia","University of New England":"Australia",
 "UNIVO Education":"India","BMO":"Canada","GetYourGuide Deutschland":"Germany"}
NEWS={"digiday.com","adexchanger.com","adweek.com","adage.com","marketingbrew.com","emarketer.com","businessinsider.com","cnbc.com","searchengineland.com",
 "searchenginejournal.com","theverge.com","techcrunch.com","reuters.com","retaildive.com","cnbctv18.com","businesswire.com","pymnts.com","digitalcommerce360.com",
 "retailtouchpoints.com","insuranceage.co.uk","thehindubusinessline.com","fastcompanybrasil.com","tomsguide.com","openai.com","ads.openai.com","corporate.target.com","abnamro.com","smartcompany.com.au"}
g=defaultdict(list)
for r in adv:
    if not r["data"]: continue
    dom=urlparse(r["url"]).netloc.replace("www.","")
    if dom=="arobis.ai": continue
    for a in r["data"].get("advertisers") or []:
        b=(a.get("brand") or "").strip().split("\n")[0]
        if not b: continue
        b=ALIAS.get(b.lower(),b)
        if b.lower() in EXCL or b not in CAT: continue
        g[b].append({"evidence":(a.get("evidence") or "").strip().split("\n")[0],"url":r["url"],"domain":dom,"published":r["published"]})
out=[]
for b,xs in g.items():
    xs.sort(key=lambda x:(0 if x["domain"] in NEWS else 1, x["published"] or "9999"))
    first=min((x["published"] for x in xs if x["published"]), default="")
    out.append({"brand":b,"category":CAT[b],"market":COUNTRY.get(b,""),"evidence":xs[0]["evidence"][:280],"source_url":xs[0]["url"],"source_domain":xs[0]["domain"],
      "first_reported":first,"sources":len(set(x["domain"] for x in xs)),"source_urls":sorted(set(x["url"] for x in xs))[:6]})
out.sort(key=lambda x:(-x["sources"],x["brand"]))
json.dump(out,open("adv_curated.json","w"),indent=1)
from collections import Counter
print(len(out)); print(Counter(o["category"] for o in out).most_common()); print(Counter(o["market"] for o in out))
print([b for b in CAT if b not in g])
