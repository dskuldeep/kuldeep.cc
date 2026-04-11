# Content Management System Guide

Your website now uses a simple, file-based CMS that works perfectly with Cloudflare Pages and is completely free!

## How to Add Content

### Adding a Case Study

1. Create a new `.md` file in the `content/case-studies/` directory
2. Name it using kebab-case (e.g., `my-first-case-study.md`)
3. Add frontmatter and content:

```markdown
---
title: "Building AI-Powered Marketing Automation at Maxim AI"
description: "How we scaled marketing operations 10x with multi-agent AI systems"
date: "2026-01-15"
tags: ["AI", "Marketing", "Automation"]
---

# Challenge

Describe the problem you were solving...

## Solution

Explain your approach...

## Results

Share the measurable outcomes...

## Key Takeaways

- Bullet point 1
- Bullet point 2
```

4. Save the file and deploy - it will automatically appear on your website!

### Adding a Blog Post

1. Create a new `.md` file in the `content/blog/` directory
2. Name it using kebab-case (e.g., `ai-marketing-trends-2026.md`)
3. Add frontmatter and content:

```markdown
---
title: "AI Marketing Trends for 2026"
excerpt: "A look at how AI is reshaping marketing automation and data-driven growth strategies"
date: "2026-01-15"
tags: ["AI", "Marketing", "Trends"]
---

# Introduction

Start your post here...

## Main Content

Use markdown formatting for rich content:

- **Bold text**
- *Italic text*
- [Links](https://example.com)
- Code blocks
- Images

## Conclusion

Wrap up your thoughts...
```

4. Save the file and deploy!

## Markdown Formatting Cheat Sheet

- `#` Heading 1
- `##` Heading 2
- `###` Heading 3
- `**bold text**` - **bold text**
- `*italic text*` - *italic text*
- `[link text](URL)` - [link text](URL)
- `` `code` `` - `code`
- `- bullet point` - bullet lists
- `1. numbered item` - numbered lists

## Deploying to Cloudflare Pages

1. Push your changes to GitHub
2. In Cloudflare Pages dashboard:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Framework preset: Next.js

3. Your content will automatically be deployed!

## Upgrading to a WYSIWYG CMS (Optional)

If you want a visual editor instead of writing markdown files, you have several options:

### Option 1: Payload CMS (Recommended)

**Pros:**
- Beautiful admin UI
- Built-in WYSIWYG editor
- Works with Cloudflare D1 (PostgreSQL)
- Can use Cloudflare R2 for media storage
- Completely free and open source

**Setup:**
```bash
npm install payload@beta @payloadcms/db-postgres @payloadcms/richtext-lexical
```

Then follow Payload's documentation to configure collections for Case Studies and Blog Posts.

**Cost:** Free (just pay for Cloudflare D1 and R2 storage, which is very cheap)

### Option 2: Sanity.io

**Pros:**
- Excellent WYSIWYG editor
- Real-time collaboration
- Great developer experience

**Cost:** Free tier available, paid plans start at $99/month

### Option 3: Keystatic

**Pros:**
- Git-based (stores content in your repo)
- Free and open source
- Works offline

**Cost:** Completely free

### Option 4: Tina CMS

**Pros:**
- Visual editing directly on your site
- Git-based
- Good free tier

**Cost:** Free for personal projects, $29/month for commercial use

## Current System Benefits

Your current markdown-based system has several advantages:

✅ **Completely Free** - No monthly fees ever
✅ **Fast** - Static files = blazing fast load times
✅ **Version Controlled** - All content is in Git
✅ **Portable** - Easy to migrate to any platform
✅ **Simple** - No database to manage
✅ **Works Offline** - Write content anywhere

## Need Help?

- **Markdown help:** [Markdown Guide](https://www.markdownguide.org/)
- **Frontmatter reference:** See the example files in `content/` directories
- **Deployment issues:** Check Cloudflare Pages documentation

## Quick Tips

1. **Preview locally:** Run `npm run dev` to see your changes before deploying
2. **Check for errors:** Make sure your frontmatter YAML is valid
3. **Use descriptive file names:** They become the URL slug
4. **Add tags:** Tags help organize and categorize your content
5. **Date format:** Use `YYYY-MM-DD` format for dates

Happy writing! 🚀
