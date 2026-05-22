# Agent context: astro-therobhenry

Personal site and blog for **Rob Henry** at **https://therobhenry.com**. Rebuilt from the Astro blog template; revived May 2026 with Astro 6 + Cloudflare.

## Stack

- **Astro** 6 (`astro.config.mjs`) — `site: https://therobhenry.com`
- **Content**: Markdown & MDX via Astro content collections (`src/content.config.ts`)
- **Styling**: Bear Blog–style CSS in `src/styles/global.css` (teal accent `#0d6e6e`); Tailwind v4 wired via Vite
- **Fonts**: Local Atkinson (`astro.config.mjs`, `src/assets/fonts/`)
- **Integrations**: `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`
- **Deploy**: Cloudflare via `@astrojs/cloudflare` + Wrangler (`wrangler.jsonc`)

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
docs/DEPLOY.md          # Cloudflare Pages deploy steps
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

**Node**: `>=22.12.0`

## Site identity

- **`src/consts.ts`**: `SITE_TITLE` = `therobhenry.com`, personal description
- **Social**: GitHub `https://github.com/therobhenry` in Header/Footer
- **Branding**: teal accent in `global.css`; `RH` favicon in `public/favicon.svg`

## Deploy workflow

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for Cloudflare Pages (Git CI) and Wrangler manual deploy.

Quick loop: `npm run dev` → edit → `npm run build` → push → Pages builds automatically.

## Ignored paths

- **Git**: `dist/`, `.astro/`, `node_modules/`, `.wrangler/`, env files
- **Cursor**: same + `package-lock.json`

## Conventions

- Prefer Astro components and content collections over new frameworks.
- Blog posts under `src/content/blog/`; static pages under `src/pages/`.
- Do not commit `.wrangler/`.
- Fresh blog slate — no migrated WordPress posts in repo.
