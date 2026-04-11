# Cloudflare Pages Deployment Guide

Simple Next.js deployment to Cloudflare Pages.

## Quick Setup

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

2. Select your GitHub repository

3. **Configure build settings:**
   ```
   Framework preset:     Next.js
   Build command:        npm run build
   Build output directory: (leave as detected)
   ```

4. Click **Save and Deploy**

That's it! Cloudflare will automatically detect Next.js and handle the build.

## What Gets Deployed

Your site includes:
- All pages (homepage, journal, case studies)
- Auto-generated OpenGraph images (1200x630 PNG) for each page
- `sitemap.xml` - Dynamic sitemap with all blog posts and case studies
- `robots.txt` - Crawler directives
- JSON-LD structured data for SEO

## Custom Domain

After deployment:
1. Go to **Custom domains** tab in Cloudflare Pages
2. Click **Set up a custom domain**
3. Enter: `kuldeep.cc`
4. Follow DNS configuration instructions

## Future Deployments

All future pushes to your `main` branch will automatically trigger a new deployment. That's it!
