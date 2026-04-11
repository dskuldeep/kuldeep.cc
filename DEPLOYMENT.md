# Cloudflare Pages Deployment

Your GitHub repo is already connected to Cloudflare Pages.

## IMPORTANT: Update Cloudflare Pages Settings

Go to your Cloudflare Pages project → Settings → Builds & deployments and set:

- **Framework preset**: **None** (NOT Next.js - this is critical!)
- **Build command**: `npx vinext deploy`
- **Build output directory**: Leave empty
- **Node version**: 20

## Why "None"?

Cloudflare auto-detects Next.js and tries to use `opennextjs-cloudflare`, but we're using `vinext` instead. Setting framework to "None" prevents the auto-detection.
