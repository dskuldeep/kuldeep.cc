Every website now has an opinion about AI, and most of them never wrote it down. The ones that did put it in a thirty-two-year-old text file called robots.txt.

I wanted to know what those opinions actually are, so I went and read them. On 29 October 2026 I fetched the robots.txt and llms.txt files of the 10,000 most popular domains on the web (the [Tranco](https://tranco-list.eu/) research ranking), parsed every rule the way a crawler would, and checked how each site treats 197 known AI crawlers and user agents.

The headline numbers are on the [study page](/data/ai-search/robots-txt-study): **22.2% of top sites with a robots.txt block at least one AI crawler, 17.9% block GPTBot, and 9.8% publish an llms.txt.** Those numbers are fine, but they are not the interesting part. The interesting part is what the files reveal when you read them closely: what publishers think they are doing, what they are actually doing, and who is really writing the rules.

> **The short version: publishers are fighting a war on training data while leaving the doors to AI answers wide open. And the blocklists they fight it with are copied, leaky and quietly broken.**

***

## **1. Publishers block training, not answers**

The most-blocked AI crawlers are, without exception, crawlers that collect training data.

![Bar chart of the most-blocked AI crawlers. CCBot 19.0%, Bytespider 18.7%, GPTBot 17.9%, ClaudeBot 16.9%, Google-Extended 15.5%](/media/posts/2026-10/9436a1f5-036e-47f1-b13a-2ddf42743bbb.png "The most-blocked AI crawlers across the top 10,000 sites")

CCBot, Common Crawl's dataset crawler, tops the list at 19.0%. It is not even an AI company. It is a non-profit archive, but its open dataset feeds a large share of LLM pre-training, and publishers have figured that out. Then come Bytespider (ByteDance, 18.7%), GPTBot (17.9%), ClaudeBot (16.9%) and Google-Extended (15.5%).

Now look at the same operators' *other* bots, the ones that decide whether you show up in their AI answers.

![Grouped bars comparing training, search and user-fetch crawler block rates for OpenAI, Anthropic, Perplexity, Meta and Mistral](/media/posts/2026-10/2187f408-a5fb-4dd0-9f56-16df7af80bda.png "Training crawlers are blocked roughly twice as often as answer crawlers")

OpenAI's training crawler is blocked by 17.9% of sites; its search crawler, OAI-SearchBot, by 7.6%. Anthropic's ClaudeBot is blocked by 16.9%; Claude-SearchBot by 7.4%. The pattern holds for Meta and Mistral. Publishers block training at roughly twice the rate they block answers.

This is not an accident of lazy configuration. Of the 1,019 sites that block GPTBot, **587 (57.6%) explicitly or implicitly let OAI-SearchBot through**. Strip out the 232 sites that block *every* bot with a blanket `User-agent: *` rule, and the share rises to 71%. That is exactly the split [OpenAI's own documentation](/data/ai-search/crawlers/oai-searchbot) recommends: opt out of training, stay visible in search.

The inference is that the web's position on AI has already settled, and it is not the one you read about. It isn't "keep AI out". It is **"don't learn from me, but do cite me."** Publishers want to be a source, not a dataset.

## **2. Most AI blocklists leak**

Here is where it gets uncomfortable for anyone who thinks they have opted out of AI training.

I took the 810 sites that explicitly block GPTBot (excluding blanket blockers) and checked whether they also block the other major training crawlers.

![Bar chart: of sites blocking GPTBot, share leaving each other training crawler open. Amazonbot 37%, Applebot-Extended 35.1%, Meta-ExternalAgent 34.1%, Google-Extended 27.3%](/media/posts/2026-10/a125a45d-04a5-4d53-a7a9-ae288c78df34.png "Blocking GPTBot rarely means blocking AI training")

- 37% leave **Amazonbot** open.
- 35% leave **Applebot-Extended** open.
- 34% leave **Meta-ExternalAgent** open.
- 27% leave **Google-Extended** open.
- 19% leave **ClaudeBot** open.

**Half of all GPTBot blockers (50.0%) leave at least one of ClaudeBot, Google-Extended, CCBot, Meta-ExternalAgent or Applebot-Extended unblocked.** Only 344 sites, 6% of the sample, block all eight major training crawlers.

The reason is obvious once you see it: these rules were written in response to news, not in response to a threat model. GPTBot was announced in August 2023 and made headlines; sites added it. Google-Extended, Applebot-Extended and Meta-ExternalAgent arrived later and quietly, and many robots.txt files were never touched again. If your goal is to keep your content out of model training, blocking one company's crawler buys you very little. The data is still being collected, just by someone else.

## **3. The zombie rules**

Robots.txt files are full of rules for bots that no longer exist in the form they were written for.

Anthropic's current documentation lists three bots: ClaudeBot, Claude-SearchBot and Claude-User. But two older tokens, `anthropic-ai` and `Claude-Web`, still appear in hundreds of files. Of the sites that block one of those legacy tokens, 51 neither name ClaudeBot nor block it via their wildcard rule. Those sites believe they have blocked Anthropic. They have blocked a name Anthropic's crawler doesn't use.

The list includes espn.com, abcnews.com, sciencemag.org and science.org, ovh.com, marca.com, ctvnews.ca and a cluster of Hearst titles (Elle, Esquire, Cosmopolitan, Good Housekeeping) that share a template.

It goes further than one company. **66% of AI blocklists with three or more entries include at least one legacy Anthropic token.** These lists are not written; they are inherited.

The strangest case I found was typographic. Seven sites, including chatgpt.com, academia.edu, foreignpolicy.com, launchpad.net and europepmc.org, block `Perplexity‑User`. Look closely at that hyphen: it is U+2011, a *non-breaking* hyphen, not the ASCII `-` the real bot sends. The rule can never match. The likely source is Perplexity's own crawler documentation: the version I captured displays the bot's name in its table heading with exactly that character, while the code samples use a normal hyphen. Copy the heading, and you publish a rule that does nothing.

> **Robots.txt has become a copy-and-paste genre. The errors propagate along with the rules.**

## **4. The web's most common AI policy is written by Cloudflare**

If you hash every AI blocklist with five or more entries and count duplicates, 46% of them belong to a group of three or more sites with an identical list.

![Histogram of the number of AI bots each blocking site disallows: median 13, longest 192](/media/posts/2026-10/159e1ae8-74a1-4a69-ac53-5f977c34bc57.png "AI blocklists are long, copied and stale")

The single most common list, 23 bots and identical to the character, appears on **152 sites**. Every one of the examples I inspected also carries a `Content-Signal` header, the policy syntax Cloudflare introduced with its managed robots.txt. In other words, the most widely deployed AI policy on the top 10,000 sites wasn't written by any of those 152 sites. It is a default that their CDN wrote for them.

That has a consequence nobody talks about. When Cloudflare updates its template, a meaningful slice of the web's AI policy changes overnight with no editorial decision behind it. When it doesn't, 152 sites keep blocking `Claude-Web` and miss whatever bot launched last month. Infrastructure defaults now shape AI's access to the web more than any individual publisher does.

Cloudflare's Content Signals are spreading on their own, too: 336 sites (5.9%) already publish them. The most common values are `search=yes` and `ai-train=no`, which is the training/answers split from section 1 expressed in a newer, more explicit syntax.

## **5. Walls and welcome mats**

There is a second protocol for talking to AI: llms.txt, a Markdown file that tells language models what a site is and where its best content lives. 983 of the top 10,000 domains (9.8%) serve one.

The interesting part is who they are. Among sites with an llms.txt, **only 4.2% block GPTBot, against 17.9% across all sites.** They are four times less likely to block OpenAI's training crawler.

![Bar chart: 17.9% of all sites block GPTBot vs 4.2% of sites with an llms.txt](/media/posts/2026-10/f51aee35-3d91-4f18-bdbd-fde59f39e2b3.png "Sites that publish llms.txt are four times less likely to block GPTBot")

The web is splitting into two camps that barely overlap. Publishers, mostly media and content businesses whose product *is* the text, build walls. SaaS, developer and commerce brands, whose text is marketing for a product sold elsewhere, roll out welcome mats. For the second group, being learned by a model is free distribution. For the first, it is unpaid licensing.

A handful of sites do both: gravatar.com, meetup.com, glassdoor.com and oreilly.com publish an llms.txt *and* block GPTBot. That combination is coherent: help AI answer questions about me, but don't train on me. I suspect it is where most sites will end up.

## **6. Geography and size**

Blocking is not evenly spread.

![Bar chart of AI blocking by top-level domain: .fr 45.9%, .de 29.9%, .com 23.6%, .edu 5.5%](/media/posts/2026-10/75eb3104-51fb-4ecb-b7c2-528ab10a48dd.png "French and German sites block AI at up to twice the rate of .com")

**French domains block AI at almost twice the rate of .com (45.9% vs 23.6%), and German domains at 29.9%.** That lines up with European publishers' collective push for licensing deals and with the EU's text-and-data-mining opt-out rules, which make a machine-readable reservation legally meaningful. At the other end, .edu (5.5%), .gov (7.7%) and .io (7.3%) sites barely block at all; universities and governments want to be read, and developer tools want to be recommended.

Size matters too. **27.4% of the top 1,000 sites block at least one AI crawler, against about 22% further down the list.** The biggest sites have the most valuable content, the most legal staff, and the most leverage to negotiate licensing deals. For them, robots.txt is partly a bargaining position.

## **7. What 5,701 robots.txt files actually say**

Pull all of it together and the picture is less dramatic than the coverage suggests.

![Stacked bar classifying 5,701 robots.txt files: 67.8% no AI rules, 9.4% block training only, 10.4% block training and AI search](/media/posts/2026-10/e0dd97aa-d869-4ce0-934e-53025bb799f8.png "Two-thirds of top sites have no AI-specific rules at all")

Two-thirds of top sites (67.8%) have no AI-specific rules at all. 8.2% name AI bots only to allow them or restrict a few paths. 9.4% block training only. 10.4% block training and also some AI search or agent crawlers. 4.1% block every bot indiscriminately. And almost nobody (11 sites) blocks AI answers while allowing training.

## **What this means if you run a website**

1. **Decide what you are protecting.** If the goal is to stay out of training data, block every training crawler, not just GPTBot: CCBot, ClaudeBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, Amazonbot, Bytespider and the rest. The [crawler directory](/data/ai-search/crawlers) lists them with their purpose.
2. **Don't accidentally leave AI answers.** OAI-SearchBot, Claude-SearchBot, PerplexityBot and the user-triggered fetchers decide whether you are cited. Blocking them doesn't protect your content from training; it only removes you from the answer.
3. **Audit inherited rules.** Replace `anthropic-ai` and `Claude-Web` with ClaudeBot. Retype any bot name you copied from a web page; invisible characters break rules.
4. **Know what your CDN wrote for you.** If you use a managed robots.txt, read it. It is your policy now.
5. **Remember the one you can't block.** Google-Extended does not remove you from AI Overviews or AI Mode. Only blocking Googlebot does, and that removes you from Google Search. More on that asymmetry in [a separate piece](/writing/ai-search-opt-out-asymmetry).

## **Data and method**

Everything here comes from the [robots.txt study dataset](/data/ai-search/robots-txt-study), which you can download as CSV. Rules were parsed per RFC 9309: a bot is governed by the group that names it (version suffixes ignored), otherwise by the `*` group, and counts as blocked when that group disallows `/` without a root-level Allow. 5,701 of the 10,000 domains served a valid robots.txt; most of the rest are API, CDN and tracking hostnames with no website. Full details are in the [methodology](/data/methodology).

The data is free to reuse under CC BY 4.0. If you cite it, link to the [study page](/data/ai-search/robots-txt-study).
