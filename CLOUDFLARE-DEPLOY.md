# Cloudflare Pages Deployment Instructions

Your site is now configured for static export. Follow these steps to deploy:

## Cloudflare Pages Settings

In your Cloudflare Pages dashboard, configure:

1. **Framework preset**: None (or select "Create React App" / "Static Site")
   - DO NOT use "Next.js" preset as this project uses static export

2. **Build command**: `npm run build`

3. **Build output directory**: `out`

4. **Node version**: 18 or higher

## Why These Settings?

- This Next.js project uses `output: "export"` which generates a static site
- The `out` directory contains all static HTML, CSS, and JavaScript files
- No server-side rendering or API routes are used
- This avoids the 3 MiB Worker bundle size limit

## Alternative: Deploy from CLI

```bash
npm run build
npx wrangler pages deploy out
```

Your site should now deploy successfully!
