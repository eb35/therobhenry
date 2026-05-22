# Deploying to Cloudflare Pages

Production site: **https://therobhenry.com**

## Prerequisites

- Cloudflare account with access to the `therobhenry.com` zone
- Node.js `>=22.12.0` (see `package.json`)
- Git repo pushed to GitHub (or GitLab) for CI deploy, *or* Wrangler CLI for manual deploy

## Local check before deploy

```sh
npm run build
npm run preview
```

Open `http://localhost:4321` and verify `/`, `/about`, `/blog`, `/blog/hello-again`, and `/rss.xml`.

## Option A: Cloudflare Pages (Git — recommended)

1. In [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select this repository.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist` (Astro + Cloudflare adapter outputs here; Wrangler serves `./dist` per `wrangler.jsonc`)
   - **Node version:** 22 or later (match `engines` in `package.json`)
4. Save and deploy. Fix any build errors from the Pages build log.
5. **Custom domain:** Pages project → **Custom domains** → add `therobhenry.com` (and `www.therobhenry.com` if needed).
6. Update DNS at your registrar per Cloudflare’s instructions (usually CNAME to `*.pages.dev` or nameservers on Cloudflare).

## Option B: Manual deploy with Wrangler

```sh
npm run build
npx wrangler pages deploy dist --project-name=astro-therobhenry
```

Use the same project name as in `wrangler.jsonc` if you already created a Worker/Pages project.

## After first deploy

- Confirm `https://therobhenry.com/sitemap-index.xml` loads.
- Validate RSS: https://validator.w3.org/feed/ (feed URL: `https://therobhenry.com/rss.xml`).
- Old WordPress URLs will not redirect automatically; add redirect rules in Cloudflare if needed later.

## Ongoing workflow

1. Edit content or code locally (`npm run dev`).
2. Commit and push to the branch connected to Pages.
3. Pages runs `npm run build` and publishes automatically.
