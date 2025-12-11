# Deploying Your Next.js App to Cloudflare Pages

This guide will walk you through deploying your application to Cloudflare Pages, configuring environment variables, and handling authentication redirects.

## 1. Prerequisites (Already Configured)
We have already:
- [x] Installed `@cloudflare/next-on-pages` adapter.
- [x] Added the `pages:build` script to your `package.json`.
- [x] Configured `next.config.ts` for Image compatibility (`unoptimized: true`).

## 2. Push Your Code
Ensure all your changes are committed and pushed to your GitHub (or GitLab) repository.
```bash
git add .
git commit -m "Setup for Cloudflare deployment"
git push
```

## 3. Create Project in Cloudflare Dashboard
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** -> **Create Application**.
3. Select the **Pages** tab -> **Connect to Git**.
4. Select your repository (`landing_page`).
5. **Project Name**: Choose a name (e.g., `landing-page-app`).
6. **Production Branch**: Usually `main` or `master`.

## 4. Configure Build Settings
Cloudflare should detect Next.js, but ensure these settings are correct:

- **Framework Preset**: `Next.js`
- **Build Command**: `npm run pages:build` (IMPORTANT: Do not use the default `next build`)
- **Build Output Directory**: `.vercel/output/static`
- **Node.js Version**: Navigate to Settings -> Environment Variables and add `NODE_VERSION` = `20` (or higher) if needed later, but default should work.

## 5. Configure Environment Variables (Secrets)
You must copy your secrets from `.env.local` to Cloudflare.

 **Settings** -> **Environment Variables** -> **Add variable**

Add the following (copy values from your local `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (If you are using it server-side)
- `NPM_FLAGS` = `--legacy-peer-deps` (CRITICAL: Fixes Next.js 16 build error)

> **Note**: Do NOT add `NEXT_PUBLIC_SITE_URL` yet if you don't know your final Cloudflare domain, or set it to the provided `*.pages.dev` domain after the first deployment.

## 6. Deploy
Click **Save and Deploy**.
- Cloudflare will clone your repo, install dependencies, and run `npm run pages:build`.
- Wait for the "Success" message.

## 7. Post-Deployment Configuration (Critical for Auth!)
Once deployed, you will get a URL like `https://landing-page-app.pages.dev`.

### Update Supabase for Redirects
Authentication providers (Google, Azure) need to know this new domain.

1.  **Go to Supabase Dashboard** -> Authentication -> URL Configuration.
2.  **Site URL**: Change this to your new Cloudflare URL (e.g., `https://landing-page-app.pages.dev`).
3.  **Redirect URLs**: Add `https://landing-page-app.pages.dev/auth/callback`.

### Update OAuth Providers
You generally *don't* need to change Google/Azure if you are just using Supabase as the middleman and your Supabase project URL hasn't changed.
**HOWEVER**, if you are using specific redirects that go strictly to your domain, you might need to add:
- **Google Cloud Console**: Add `https://landing-page-app.pages.dev` to Authorized Javascript Origins (if using implicit flow) or just ensure Supabase handles it. *Usually, Supabase handles the callback, so you only update Supabase.*

## 8. Troubleshooting
- **Images broken?** existing `next/image` usage without a loader won't work perfectly on the free tier without `unoptimized: true` (which we added).
- **"Edge Function" errors?** Verify you aren't using Node.js specific APIs (like `fs`) in your dynamic routes. Next-on-pages runs on the Edge.
