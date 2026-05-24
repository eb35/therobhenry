# Agent context: astro-therobhenry

Personal site and blog for **Rob Henry** at **https://therobhenry.com**. Rebuilt from the Astro blog template; revived May 2026 with Astro 6 + Cloudflare.

## Stack

- **Astro** 6 (`astro.config.mjs`) — `site: https://therobhenry.com`
- **Content**: Markdown & MDX via Astro content collections (`src/content.config.ts`)
- **Styling**: Bear Blog–style CSS in `src/styles/global.css` (teal accent `#0d6e6e`); Tailwind v4 wired via Vite
- **Fonts**: Local Atkinson (`astro.config.mjs`, `src/assets/fonts/`)
- **Integrations**: `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`
- **Deploy**: Cloudflare via `@astrojs/cloudflare` + Wrangler (`wrangler.jsonc`)
- **Astro Docs MCP**: `.cursor/mcp.json` — live Astro documentation for agents (`search_astro_docs`). Reload Cursor after config changes.

## Project layout

```text
public/                 # favicon.svg, static assets
src/
  components/           # Header, Footer, BaseHead, …
  content/blog/         # Blog posts (Markdown/MDX)
  layouts/              # BlogPost.astro
  pages/                # index, about, blog/, rss.xml.js
  styles/global.css
  consts.ts             # SITE_TITLE, SITE_DESCRIPTION
docs/DEPLOY.md          # Cloudflare Workers deploy steps
.npmrc                  # min-release-age=7
renovate.json           # dependency update bot config
astro.config.mjs
wrangler.jsonc
```

## Routes

| Path | Source |
|------|--------|
| `/` | `src/pages/index.astro` |
| `/about` | `src/pages/about.astro` |
| `/blog` | `src/pages/blog/index.astro` |
| `/blog/*` | `src/pages/blog/[...slug].astro` |
| `/rss.xml` | `src/pages/rss.xml.js` |

## Content collections

- Collection: `blog` in `src/content.config.ts`
- Posts: `src/content/blog/**/*.{md,mdx}`
- Schema: `title`, `description`, `pubDate`, optional `updatedDate`, optional `heroImage`
- Slug = filename without extension (e.g. `hello-again.md` → `/blog/hello-again`)

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server (`localhost:4321`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run generate-types` | `wrangler types` |

**Node**: `>=22.12.0` · **npm**: 11.10+ (for `min-release-age` in `.npmrc`)

## Dependencies

- **`.npmrc`**: `min-release-age=7` — npm refuses versions published in the last 7 days. Override one-off: `npm install pkg --min-release-age=0`.
- **`renovate.json`**: Renovate opens grouped PRs (astro, tailwind, wrangler) with the same 7-day cooldown. Install the [Renovate GitHub App](https://github.com/apps/renovate) on `eb35/therobhenry` once; it picks up config on the next scan.
- **Maintenance pass** (monthly or before infra work): `npm outdated`, `npm audit`, update patch/minor within semver, `npm run build`. In Agent mode: *“Run the dependency maintenance pass per AGENTS.md.”*
- **Major bumps** (`astro`, `@astrojs/*`, `wrangler`): read changelogs; update as a group.
- Known upstream lag: some audit findings (e.g. `ws` via `wrangler`) may need a newer wrangler than `min-release-age` allows yet — Renovate security PRs can bypass the cooldown.

## Site identity

- **`src/consts.ts`**: `SITE_TITLE` = `therobhenry.com`, personal description
- **Social**: `SOCIAL_LINKS` in `src/consts.ts`; icons via `SocialLinks.astro` in Header/Footer
- **Branding**: teal accent in `global.css`; `RH` favicon in `public/favicon.svg`

## Deploy workflow

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for Cloudflare Workers Builds (`npm run build` + `npx wrangler deploy`).

Images: `imageService: { build: 'compile', runtime: 'cloudflare-binding' }` in `astro.config.mjs`; `IMAGES` + `ASSETS` in `wrangler.jsonc`. Prerendered posts use baked `/_astro/*.webp` URLs.

Quick loop: `npm run dev` → edit → `npm run build` → push → Workers Builds deploys automatically.

## Ignored paths

- **Git**: `dist/`, `.astro/`, `node_modules/`, `.wrangler/`, env files
- **Cursor**: same + `package-lock.json`

## Conventions

- Prefer Astro components and content collections over new frameworks.
- Blog posts under `src/content/blog/`; static pages under `src/pages/`.
- Do not commit `.wrangler/`.
- Fresh blog slate — no migrated WordPress posts in repo.
