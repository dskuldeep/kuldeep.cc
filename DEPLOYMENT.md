# Cloudflare Pages Deployment

## Cloudflare Pages Settings

**CRITICAL: These exact settings are required:**

1. **Framework preset**: None
2. **Build command**: `npm run build`
3. **Build output directory**: (leave empty - vinext handles deployment)
4. **Root directory**: (leave empty)

**IMPORTANT: Remove any "Deploy command" or set it to empty**
- Cloudflare Pages may have auto-detected `npx wrangler deploy` - this must be removed
- The deployment happens via the build command using vinext

## Environment Variables (REQUIRED)

**Must set this in Cloudflare Pages dashboard:**
- `NODE_VERSION` = `22` (vinext requires Node.js 22 or higher)

## Alternative Build Command (Recommended)

If the above doesn't work, use this combined build command:
- **Build command**: `npm run build && npm run deploy`

This will:
1. Run `npm run build` (builds Next.js)
2. Run `npm run deploy` (runs `vinext deploy` which deploys to Cloudflare Workers)

Make sure any separate "Deploy command" field is empty or removed.
