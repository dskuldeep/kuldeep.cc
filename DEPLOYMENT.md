# Cloudflare Pages Deployment

## Cloudflare Pages Settings

**CRITICAL: These exact settings are required:**

1. **Framework preset**: None
2. **Build command**: `npm run build && npm run deploy`
3. **Build output directory**: (leave empty - vinext handles deployment)
4. **Root directory**: (leave empty)

## Environment Variables (if not set)

Add this if needed:
- `NODE_VERSION` = `20`

The build will:
1. Run `npm run build` (builds Next.js)
2. Run `npm run deploy` (runs `vinext deploy` which deploys to Cloudflare Workers)
