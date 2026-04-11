# Cloudflare Pages Deployment Guide

This project uses Next.js static export mode and is configured for Cloudflare Pages deployment.

## Automated Configuration Files

The following files are committed to the repository for automated deployment:

- **`wrangler.toml`** - Cloudflare Pages configuration
- **`.node-version`** - Specifies Node.js 20
- **`cloudflare.json`** - Build configuration
- **`next.config.ts`** - Configured with `output: "export"` for static generation

## Deployment Options

### Option 1: Using Cloudflare Pages Dashboard (Git Integration)

1. Go to Cloudflare Pages dashboard
2. Connect your GitHub repository
3. **Important:** Override the auto-detected settings with:
   - **Framework preset**: `None` (not Next.js!)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Environment variables**: Add `NODE_VERSION=20`

The auto-detection tries to use the Next.js adapter which conflicts with static export. Setting preset to "None" treats it as a static site.

### Option 2: Using Wrangler CLI (Recommended for Full Automation)

This method provides complete automation without manual dashboard configuration:

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Build and deploy:
   ```bash
   npm run build
   npx wrangler pages deploy out --project-name=kuldeep-cc
   ```

4. For automated CI/CD, add this to your GitHub Actions:
   ```yaml
   name: Deploy to Cloudflare Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - uses: cloudflare/pages-action@v1
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             projectName: kuldeep-cc
             directory: out
   ```

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
