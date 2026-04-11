# Cloudflare Pages Deployment Guide

This project uses Next.js static export mode (`output: "export"`) for deployment to Cloudflare Pages.

## Quick Setup

### Configuration Files in Repository

- **`.node-version`** - Ensures Node.js 20 is used
- **`public/_headers`** - Custom headers for caching and security
- **`next.config.ts`** - Configured with `output: "export"` for static generation

## Cloudflare Pages Dashboard Setup (One-Time)

When connecting your repository to Cloudflare Pages:

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Select your repository
3. **Configure build settings:**

   ```
   Framework preset:     None (important!)
   Build command:        npm run build
   Build output directory: out
   ```

4. **Add environment variable:**
   ```
   NODE_VERSION = 20
   ```

5. Click **Save and Deploy**

### ⚠️ Important: Why "None" Framework Preset?

Cloudflare auto-detects Next.js and tries to use the `@opennextjs/cloudflare` adapter, which expects server-side rendering. Since we use static export (`output: "export"`), this conflicts.

Setting framework preset to **"None"** tells Cloudflare to treat it as a static site and simply deploy the `out` directory contents.

## Build Output

The build generates a static site in the `out/` directory with:
- All pages as static HTML
- Auto-generated OpenGraph images (1200x630 PNG) for each page
- `sitemap.xml` - Dynamic sitemap with all blog posts and case studies
- `robots.txt` - Crawler directives
- JSON-LD structured data for SEO

## Domain Configuration

The site is configured for **kuldeep.cc** domain. All metadata, canonical URLs, and sitemaps use this domain.

## Troubleshooting

**Error: "pages-manifest.json not found"**
- This happens when Cloudflare tries to use the Next.js adapter instead of static export
- Solution: Set Framework preset to "None" in Cloudflare dashboard

**Build succeeds but deployment fails**
- Verify the build output directory is set to `out` (not `.next`)
- Ensure `output: "export"` is set in `next.config.ts`
