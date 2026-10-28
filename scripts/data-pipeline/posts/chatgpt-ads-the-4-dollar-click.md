OpenAI has never published a benchmark for ChatGPT Ads. Nine months after launch, there is no official average CPC, no CTR, no conversion rate. What exists instead is a sprawl of agency case studies, platform panels, trade-press scoops and screenshots, each reporting its own handful of numbers.

So I collected them. The [ChatGPT Ads Index](/data/chatgpt-ads) pulls together every figure I could find in public reporting: 281 mentions of a price or performance number, deduplicated to **184 distinct data points from 73 sources**, each linked to where it was reported. Alongside that I tracked [141 named advertisers](/data/chatgpt-ads/advertisers) and a [dated timeline](/data/chatgpt-ads/timeline) of 39 platform changes.

The medians are easy to state: **$4.00 CPC, $37.64 CPM, 0.98% CTR.** What they mean is more interesting. Read together, the data says ChatGPT Ads is not the premium brand channel it launched as, and that its prices are being set by OpenAI's guidance more than by the market.

> **ChatGPT Ads started as a $250,000 club for brands and became a $25-a-day self-serve auction in four months. The click price never moved.**

***

## **1. The $4 click that never moved**

When OpenAI turned on CPC bidding in April 2026, it published a recommendation: start with a maximum bid of $3–$5 per click. Here is the median CPC reported in public sources, month by month, since then.

![Line chart of median reported ChatGPT Ads CPC by month, flat at roughly $4 from March to October 2026](/media/posts/2026-10/0e6d186c-fd96-4235-9574-fe8ff0eec3c5.png "Median reported CPC has sat at about $4 every month since launch")

$3.62 in March. $4.00 in April and May. $3.71, $4.20, $3.75, then $4.00 in September and $4.00 in October. In a period when the platform went from one country to 89, from a few hundred advertisers to more than 100,000, and from a closed pilot to open self-serve, the price of a click did not move by more than about 50 cents.

That is not what a newly discovered market looks like. Prices in a fresh auction usually swing hard as supply and demand find each other. A flat line sitting exactly in the middle of the vendor's recommended range suggests something else: **the recommendation became the price.** Advertisers with no historical data anchored on OpenAI's guidance, and OpenAI's relevance-weighted second-price auction had enough inventory to clear most of them near their bids.

The practical consequence: today's CPC benchmark tells you what advertisers are willing to bid, not what the inventory is worth. As more advertisers compete for the same high-intent conversations (and OpenAI tunes its bid-strength guidance), expect the median to start drifting, and the spread between cheap and expensive categories to widen.

## **2. Two pricing models, one price**

ChatGPT Ads can be bought per impression or per click. If those two markets were mispriced against each other, someone would arbitrage them. So I checked.

At the median reported CPM of $37.64 and the median CTR of 0.98%, an impression buyer effectively pays **$37.64 ÷ (1,000 × 0.0098) = $3.84 per click.** The median CPC buyer pays $4.00. The two models clear within 4% of each other.

That is a useful sanity check on the dataset itself: medians assembled from dozens of unrelated sources agree with each other to within cents. It also tells you which way to buy. With CPM and CPC this close, the choice comes down to your CTR. Above about 1%, you get your clicks cheaper buying impressions; below it, buy clicks and let OpenAI carry the risk.

## **3. CPMs fell, then wandered**

The CPM story is the one most people have heard: launch at $60, fall fast.

![Line chart of median reported ChatGPT Ads CPM by month: about $60 in February and March, falling to $35 in April](/media/posts/2026-10/6e161945-d6b0-45f5-894c-657fb7721d80.png "CPMs dropped from the $60 launch price within two months")

The launch CPM of $60 lasted roughly two months. By April, with CPC bidding available and minimums cut, buyers were reporting $25–$45 and the monthly median fell to about $35. Since then it has wandered between $35 and $50, with lower numbers appearing as the platform opened in cheaper markets. The October dip is a mix effect: reports from newer markets (about $6 in Turkey, €17 in the Netherlands) and practitioner quotes around $10, not a price cut in the US.

The lesson for anyone budgeting: **"the ChatGPT CPM" no longer exists.** There is a US/UK price and a rest-of-world price, and blended averages will keep falling as the market mix shifts, even if no individual market gets cheaper.

## **4. The price of entry fell 10,000x**

The more dramatic collapse was not in unit prices. It was in the cost of getting through the door.

![Bar chart on a log scale: minimum spend fell from $250,000 in February to $50,000 in April to $25 a day in May 2026](/media/posts/2026-10/e9590b37-2e23-4019-8aa7-58b936053efe.png "The minimum commitment to advertise in ChatGPT fell 10,000x in four months")

In February, pilot advertisers were asked for commitments of $200,000–$250,000. By April the figure was $50,000. In late May, OpenAI removed the self-serve minimum entirely; campaigns now start at a $25 daily budget (₹725 in India). That is a 10,000x fall in the price of entry in four months.

Put that next to two numbers OpenAI has disclosed. In August, ChatGPT Ads passed a **$1 billion annualised revenue run rate**. In October, OpenAI said **more than 100,000 advertisers** had run campaigns. Dividing one by the other is crude, since the figures are from different months and the advertiser count is cumulative, but it gives an order of magnitude: about **$10,000 a year, or roughly $830 a month, per advertiser.**

That is not the economics of a premium brand channel. It is the economics of a self-serve long tail, the same shape as Google Ads or Meta: a few large spenders and a very large number of small ones. ChatGPT Ads launched as an exclusive pilot with Target, Adobe and Williams-Sonoma. It has become a small-business ad network that also has Target, Adobe and Williams-Sonoma on it.

## **5. Clicks are rare, and that's the product**

![Histogram of reported ChatGPT Ads CTRs: most between 0.5% and 1.5%](/media/posts/2026-10/097406bd-7995-4205-996e-74dd59ecb816.png "Nine in ten reported CTRs are under 2%")

92% of reported CTRs are below 2%, and 73% fall between 0.5% and 1.5%. That is a fraction of what search ads typically achieve.

It is tempting to read that as weakness. I think it is structural. A ChatGPT ad sits *below* a complete answer. The user already has what they asked for; the ad competes with the answer, not with nine other blue links. People who click are unusually far along: they have read a tailored comparison and want the next step. Which is why the most interesting reports in the dataset are not CTRs at all, but the handful of conversion and ROAS figures. They range wildly, from 0.2x ROAS in one test to 8.4x in another. Only 9 sources publish a conversion rate at all (median 1.9%).

> **The channel has a lot of evidence about the cost of attention and almost none about the value of it.**

That is the real gap in the market right now. Pixel and Conversions API support only arrived in May, and conversion-optimised bidding in June. Most of the case studies were run before advertisers could measure properly.

## **6. Who is actually buying**

![Bar chart of ChatGPT advertisers by category: Software 25, Finance 19, Retail 18, Travel 14, Insurance 12](/media/posts/2026-10/c48c3b6c-faf2-413d-8f0c-c182a992d773.png "Software, finance, retail, travel and insurance dominate named advertisers")

Of the 141 brands named in public reporting, half (70) are in four categories: **software, finance, insurance and travel.** That isn't random. These are considered purchases: the categories where people already ask ChatGPT to compare options ("best CRM for a 50-person team", "which travel card has no FX fees"). Advertisers are following the queries, and the queries in ChatGPT skew toward decisions.

Two other patterns stand out. The first is the speed of the shift from AI tools to mainstream brands. In April, Sensor Tower's top advertisers were Speechify, Jotform and Natural Intelligence; by July they had been displaced by Booking Holdings, Intuit, Home Depot and L.L.Bean. The second is how quickly OpenAI started protecting its own turf: by September it reportedly stopped approving ads for standalone AI image and audio tools, a category that included some of spring's biggest spenders.

## **7. From one market to 89**

![Step chart of the number of countries with ChatGPT Ads, from 1 in February to 89 in October 2026](/media/posts/2026-10/fbf57fc8-65d0-4a82-a4fe-308d4cbff23c.png "From one country to 89 in eight months")

One country in February. Four by the end of March. Then a long pause until the UK in June, followed by a burst: five more markets in August, 31 European countries on 24 August, India three days later, Southeast Asia in September, and 26 more countries on 21 October, for 89 in total.

The shape matters more than the speed. The flat stretch from March to July is when OpenAI was building the machinery (self-serve, CPC bidding, measurement, policy). Once that existed, expansion was mostly a legal and payments exercise. The next step is to monetise each market better, and that is when the flat $4 click from section 1 should start to move.

## **What this means if you're deciding whether to advertise**

1. **Benchmark against $4 and 1%, not $60.** Launch-era numbers still circulate widely; they describe a product that no longer exists.
2. **Buy on the model that matches your CTR.** CPM and CPC currently price a click within cents of each other; your own CTR decides which wins.
3. **Treat conversion data as the scarce asset.** Install the pixel and Conversions API before you scale. The advertisers who can prove ROAS will set the next phase of pricing.
4. **Move early in considered-purchase categories.** If people ask ChatGPT to compare products like yours, your competitors are probably already testing.
5. **Expect pricing to diverge.** An auction anchored on vendor guidance is a temporary state. Prices in competitive categories will rise; long-tail inventory will get cheaper.

## **Data and method**

All figures come from the [ChatGPT Ads benchmarks](/data/chatgpt-ads/benchmarks), [advertisers](/data/chatgpt-ads/advertisers) and [timeline](/data/chatgpt-ads/timeline) datasets, each downloadable as CSV. Medians use distinct reported values in USD; ranges count at their midpoint; ranges wider than 3x and CTRs above 5% are excluded. Monthly medians group figures by the month they were published and require at least two reports. Single-account tests vary widely, and OpenAI does not publish benchmarks, so treat individual figures as anecdotes and the medians as the signal. The full process is in the [methodology](/data/methodology).

The data is free to reuse under CC BY 4.0. If you cite it, link to the [ChatGPT Ads Index](/data/chatgpt-ads).
