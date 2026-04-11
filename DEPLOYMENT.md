# Cloudflare Pages Deployment

Your GitHub repo is already connected to Cloudflare Pages. Just update these settings:

## Cloudflare Pages Settings

Go to your Cloudflare Pages project settings and set:

- **Framework preset**: Next.js (SSR)
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Node version**: 20

That's it! Every push to `main` will auto-deploy.

The project uses `vinext` which handles Next.js → Cloudflare Workers conversion automatically.
