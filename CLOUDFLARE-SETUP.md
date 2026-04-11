# Cloudflare Pages - Quick Setup Guide

## Current Configuration Status

✅ **Build configuration is complete and ready**
- Static export configured in `next.config.ts` with `output: "export"`
- All SEO features working (OG images, sitemap, robots.txt)
- Build successfully tested locally (13 pages generated)

✅ **Repository files configured**
- `.node-version` - Ensures Node.js 20
- `public/_headers` - Cache and security headers
- `DEPLOYMENT.md` - Full deployment documentation

## Deployment Steps (One-Time Setup)

### Step 1: In Cloudflare Dashboard

1. Go to: **Cloudflare Dashboard** → **Workers & Pages** → **Create application**
2. Click **Pages** tab → **Connect to Git**
3. Authorize and select your GitHub repository: `kuldeep-cc`
4. Configure build settings:

```
Project name:          kuldeep-cc
Production branch:     main
Framework preset:      None        ⚠️ CRITICAL: Must be "None", not "Next.js"!
Build command:         npm run build
Build output directory: out
Root directory:        /
```

5. Add environment variable:
```
Variable name:  NODE_VERSION
Value:          20
```

6. Click **Save and Deploy**

### Step 2: Wait for Build

The first build will:
- Install dependencies
- Run `npm run build`
- Generate all static pages in `out/` directory
- Deploy to Cloudflare's global network

Build time: ~30-60 seconds

### Step 3: Configure Custom Domain

1. After successful deployment, go to **Custom domains** tab
2. Click **Set up a custom domain**
3. Enter: `kuldeep.cc`
4. Follow DNS configuration instructions

## Why "Framework preset: None"?

🚫 **Don't use "Next.js" preset** - It tries to use `@opennextjs/cloudflare` adapter which expects server-side rendering files that don't exist in static export mode.

✅ **Use "None"** - Treats the project as a static site and deploys the `out/` directory directly.

## What Gets Deployed

```
out/
├── index.html                    (Homepage)
├── opengraph-image               (1200x630 PNG)
├── sitemap.xml                   (Auto-generated with all posts)
├── robots.txt                    (SEO configuration)
├── journal/
│   ├── index.html
│   └── [slug]/
│       ├── index.html
│       └── opengraph-image       (Unique per post)
├── case-studies/
│   ├── index.html
│   └── [slug]/
│       ├── index.html
│       └── opengraph-image       (Unique per case study)
└── _next/static/                 (CSS, JS, images)
```

## Post-Deployment Verification

After deployment, verify:

1. ✅ Homepage loads at `https://kuldeep-cc.pages.dev`
2. ✅ OG images work: Check any URL with `https://www.opengraph.xyz/url/`
3. ✅ Sitemap accessible: `https://kuldeep-cc.pages.dev/sitemap.xml`
4. ✅ Robots.txt accessible: `https://kuldeep-cc.pages.dev/robots.txt`

## Future Deployments

Once configured, **all future deployments are automatic**:
- Push to `main` branch → Auto-deploy to production
- Push to feature branch → Deploy preview URL
- No manual steps required

## Need Help?

See `DEPLOYMENT.md` for detailed troubleshooting and advanced options.
