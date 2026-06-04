# Deploying to Cloudflare Workers

Production site: **https://therobhenry.com**

This project uses **Astro 6** with **`@astrojs/cloudflare`** (Worker + static assets). Deploy with **Workers Builds**, not classic “Pages output directory only.”

## Prerequisites

- Cloudflare account with access to the `therobhenry.com` zone
- Node.js `>=22.12.0` (see `package.json`)
- Git repo on GitHub (private is fine): `eb35/therobhenry`
- [Cloudflare Images](https://developers.cloudflare.com/images/) available on your account (used for `/_image` resizing)

## Local check before deploy

```sh
npm run build
npm run preview
```

Verify `/`, `/about`, `/blog`, `/blog/hello-again`, `/rss.xml`, and that blog hero images load (not broken `/_image` icons).

## Workers Builds (Git — recommended)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Import from Git**.
2. Select **`eb35/therobhenry`** and grant access if the repo is private.
3. Build settings:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`
   - **Root directory:** (blank)
   - **Node version:** 22 or later
4. Do **not** use “build output directory only” without `wrangler deploy` — that skips the Worker and breaks routing/images.
5. After deploy, open the **workers.dev** URL from the deployment log.
6. **Custom domain:** application → **Custom domains** → add `therobhenry.com` (and `www` if needed).

## Manual deploy with Wrangler

```sh
npm run build
npx wrangler deploy
```

Project name comes from [`wrangler.jsonc`](wrangler.jsonc) (`therobhenry`).

## Images (Cloudflare + Astro)

Blog heroes use Astro `<Image />`. In [`astro.config.mjs`](astro.config.mjs):

```js
imageService: { build: 'compile', runtime: 'cloudflare-binding' }
```

- **At build time**, prerendered pages get optimized WebP/JPEG files under `/_astro/` (no `/_image` URLs). This avoids 404s because the `/_image` worker route is not used for static pages in Astro 6.
- **`IMAGES`** binding in [`wrangler.jsonc`](wrangler.jsonc) stays enabled for **runtime** resizing if you add server-rendered pages later.
- **`ASSETS`** serves static files from `./dist` (Astro maps assets to `dist/client` in the generated worker config).

After deploy, view source on `/blog`: image `src` should look like `/_astro/blog-placeholder-1.*.webp`, not `/_image?href=...`.

## After first deploy

- Confirm `https://therobhenry.com/sitemap-index.xml` loads.
- Validate RSS: https://validator.w3.org/feed/ (feed URL: `https://therobhenry.com/rss.xml`).
- Old WordPress URLs are not redirected automatically; add rules in Cloudflare if needed later.
- Legacy blog may live at `wordpress.therobhenry.com` (separate host; DNS-only subdomain recommended).

## Ongoing workflow

Git (branch → PR → merge, including mistakes on local `main`): **[WORKFLOW.md](WORKFLOW.md)**.

Deploy path after merge to **`main`**: **Workers Builds** runs `npm run build` then `npx wrangler deploy`.

### Protecting `main` on GitHub

`main` triggers production deploys, so it should be protected when your plan allows it.

**Private repo on GitHub Free:** branch protection is not available (GitHub returns *Upgrade to GitHub Pro or make this repository public*). You still get value from the CI workflow and PR habit; GitHub’s “unprotected branch” banner may remain until you pick one of:

| Option | Cost | Notes |
|--------|------|--------|
| **GitHub Pro** | ~$4/mo | Keep `eb35/therobhenry` private; run the script below. |
| **Public repo** | Free | Fine for this site if you never commit secrets (Wrangler tokens stay in Cloudflare). |
| **No protection** | Free | CI runs on PRs/pushes but cannot block merges. |

When Pro or public applies:

1. Confirm a green GitHub Actions **build** check on `main` (workflow `.github/workflows/ci.yml`).
2. `gh auth login`
3. `./scripts/protect-main-branch.sh`

That enables PRs (0 approvals for solo work), required **build** check, up-to-date branches, and blocks force-push/deletion. Override check name with `REQUIRED_STATUS_CHECK='CI / build'` if your repo shows a different label in the merge box.
