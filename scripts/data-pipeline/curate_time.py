import json
ev=json.load(open("time_norm.json"))
T=[
("2025-09-24","OpenAI job listings signal an in-house ads platform","Job postings describe building advertising infrastructure for ChatGPT.","signal","ppc.land"),
("2025-12-02","\"Code red\" pauses ad work","OpenAI redirects resources toward ChatGPT product quality, pausing advertising development.","signal","ppc.land"),
("2026-01-16","OpenAI announces ads are coming to ChatGPT","Testing planned for adult Free and Go users in the US; Plus, Pro, Business and Enterprise stay ad-free. ChatGPT Go launches at $8/month the same day.","announcement","cnbc.com"),
("2026-01-27","$60 CPM pricing reported","The Information reports a $60 CPM baseline for ChatGPT placements.","pricing","ppc.land"),
("2026-02-09","US pilot goes live","Ads begin showing to logged-in adult Free and Go users in the US. Launch agencies include Omnicom, WPP and Dentsu; reported minimum commitment $200K–$250K.","launch","openai.com"),
("2026-02-09","Albertsons, Target and Williams-Sonoma confirm participation","Retailers announce they are among the first advertisers in the OpenAI ad pilot.","advertisers","businesswire.com"),
("2026-02-20","First independent ad sightings measured","Adthena finds ads in 0.8% of 500+ analysed prompts; Expedia, Qualcomm, Best Buy and Enterprise Mobility among confirmed advertisers.","measurement","ppc.land"),
("2026-03-02","Criteo becomes first ad tech partner","Criteo connects its advertiser base (~17,000) to the US pilot.","partners","ppc.land"),
("2026-03-11","Ads Manager dashboard enters testing","A small group of partners gets an early Ads Manager.","tooling","ppc.land"),
("2026-03-23","Former Meta executive hired to lead ad sales","Dave Dugan joins OpenAI to lead global ad solutions.","people","editorandpublisher.com"),
("2026-03-26","$100M annualised revenue; pilot expands","Reuters reports a $100M annualised run rate six weeks in. Pilot opens in Canada, Australia and New Zealand.","milestone","reuters.com"),
("2026-04-10","Self-serve Ads Manager quietly launches; minimum drops to $50K","CPC bidding appears with $3–$5 recommended bids; minimum commitment cut from $250K to $50K.","pricing","ppc.land"),
("2026-04-16","StackAdapt joins as DSP partner","Ad Age reports StackAdapt is selling ChatGPT inventory.","partners","adage.com"),
("2026-04-17","CPMs fall from $60 to as low as $25","Digiday reports buyer CPMs of $25–$35; Ad Age reports some as low as $15.","pricing","digiday.com"),
("2026-04-21","OAI-AdsBot documented","OpenAI adds the OAI-AdsBot landing-page verification crawler to its public bot docs.","policy","ppc.land"),
("2026-04-23","Ads extend to logged-out users","AdExchanger reports ads appearing for logged-out ChatGPT sessions.","inventory","adexchanger.com"),
("2026-04-30","Privacy policy updated for ads","OpenAI's US privacy policy discloses receipt of advertiser purchase data.","policy","ppc.land"),
("2026-05-05","Self-serve Ads Manager beta opens to US advertisers","CPC bidding, a pixel and Conversions API launch; Dentsu, Omnicom, Publicis and WPP plus Adobe, Criteo, Kargo, Pacvue and StackAdapt named partners.","tooling","searchenginejournal.com"),
("2026-05-07","Expansion plan for UK, Mexico, Brazil, Japan, South Korea","OpenAI says the pilot will reach five more markets within weeks.","expansion","openai.com"),
("2026-05-29","Self-serve minimum spend removed","The $50K minimum is dropped for self-serve; daily budgets start at $25.","pricing","briefs.co"),
("2026-06-05","CPA (conversion-optimised) bidding activated","Conversion-optimised campaigns become available in the US self-serve beta.","tooling","barefoot-performance.com"),
("2026-06-06","UK becomes first European market","Ads go live in the United Kingdom.","expansion","similarweb.com"),
("2026-06-08","Active advertisers jump 46% in a week","Similarweb tracks 2,585 → 3,770 weekly active advertisers; 5,171 unique since 30 March.","measurement","similarweb.com"),
("2026-07-15","Policy update opens finance and health categories","Certain US financial-services and health categories become eligible case by case.","policy","dialogueads.com"),
("2026-07-24","Product ads gain prices and star ratings","Product feed ads begin showing price and review data.","format","searchengineland.com"),
("2026-08-06","Product carousels, oCPC and URL macros ship","Multi-product carousel, oCPC beta for product feed campaigns and dynamic URL macros.","format","seroundtable.com"),
("2026-08-11","Ads live in UK, Mexico, Brazil, Japan and South Korea","OpenAI confirms the five-market expansion.","expansion","openai.com"),
("2026-08-24","ChatGPT ads launch in 31 European countries","Consent-first rollout including Germany, France, Spain, Italy and the Netherlands.","expansion","ansa.it"),
("2026-08-27","India launch with ₹725 daily minimum","Ads reach logged-in adults on Free and Go in India; WPP and Omnicom named launch agencies, 50+ brands live.","expansion","thehindubusinessline.com"),
("2026-08-31","$1B annualised run rate in under 200 days","OpenAI cites 1B+ weekly users, 40+ countries and a $500 credit match for new advertisers.","milestone","sprites.ai"),
("2026-09-04","Self-serve opens in India","Indian advertisers get Ads Manager access.","tooling","thehindubusinessline.com"),
("2026-09-09","AI image and audio tool ads restricted","The Information reports OpenAI stopped approving ads for standalone AI image/audio tools.","policy","dialogueads.com"),
("2026-09-14","Sponsored Agents: first AI-native ad format","Select clients test ads that open a chat with the brand's own AI agent; Wayfair in pilot.","format","digiday.com"),
("2026-09-17","Shopify storefront integration","ChatGPT Ads integration announced for Shopify merchants.","partners","emarketer.com"),
("2026-09-22","Equativ joins as technology partner","Equativ launches Ad Studio for ChatGPT Ads.","partners","equativ.com"),
("2026-09-23","Asia expansion takes ChatGPT Ads past 60 countries","Seven more Asian markets including Indonesia, Malaysia and the Philippines.","expansion","openai.com"),
("2026-10-18","Multi-image visual format during image generation","OpenAI rewrites its ads help article and introduces a multi-image ad format.","format","soku.ai"),
("2026-10-21","26 more countries; 100,000+ advertisers","ChatGPT Ads reaches 89 countries; more than 100,000 advertisers have run campaigns.","milestone","cnbc.com"),
("2026-10-26","Multi-image ads open beta in Ads Manager","4–6 square images sharing one title and body.","format","soku.ai"),
]
out=[]
for d,title,detail,typ,dom in T:
    extra=[{"domain":"businesswire.com","date":"2026-02-09","url":"https://www.businesswire.com/news/home/20260209314733/en/Albertsons-Companies-Announces-Participation-in-OpenAI-Advertising-Pilot-Program"}]
    ev2=ev+extra
    cand=[e for e in ev2 if dom in e["domain"] and e["date"][:10]==d] or [e for e in ev2 if dom in e["domain"] and e["date"][:7]==d[:7]] or [e for e in ev2 if dom in e["domain"]]
    url=cand[0]["url"] if cand else None
    out.append({"date":d,"title":title,"detail":detail,"type":typ,"source_url":url,"source_domain":dom})
    if not url: print("MISSING",d,dom)
json.dump(out,open("time_curated.json","w"),indent=1); print(len(out))
