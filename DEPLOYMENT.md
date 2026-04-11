# Deployment Guide

This project automatically deploys to Cloudflare Workers on every push to the `main` branch.

## Setup GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. Get your Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Click "Continue to summary" → "Create Token"
5. Copy the token (you won't see it again!)

### 2. Get your Cloudflare Account ID

1. Go to https://dash.cloudflare.com
2. Select any site
3. On the right sidebar, scroll down to find "Account ID"
4. Copy the Account ID

### 3. Add secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

   - Name: `CLOUDFLARE_API_TOKEN`
     Value: [your API token from step 1]

   - Name: `CLOUDFLARE_ACCOUNT_ID`
     Value: [your account ID from step 2]

## How It Works

1. Push code to the `main` branch
2. GitHub Actions automatically triggers
3. Installs dependencies
4. Runs `npm run deploy` (which uses `vinext`)
5. Your site is live on Cloudflare!

## Manual Deployment

You can also deploy manually from your local machine:

```bash
npm run deploy
```

Make sure you're logged in to Cloudflare first:

```bash
npx wrangler login
```

## Preview Deployments

To deploy a preview version:

```bash
npm run deploy:preview
```
