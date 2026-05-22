# Agent context: astro-therobhenry

Personal site based on the Astro **blog** starter template. Early stage — mostly default template content and structure.

## Stack

- **Astro** 6 (`astro.config.mjs`)
- **Content**: Markdown & MDX via Astro content collections (`src/content.config.ts`)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` (`src/styles/global.css`)
- **Fonts**: Local Atkinson (configured in `astro.config.mjs`, files under `src/assets/fonts/`)
- **Integrations**: `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`
- **Deploy**: Cloudflare Workers/Pages via `@astrojs/cloudflare` + Wrangler (`wrangler.jsonc`)

## Project layout

```text
public/                 # Static assets (favicon, etc.)
src/
  components/           # Header, Footer, BaseHead, FormattedDate, …
  content/blog/         # Blog posts (.md, .mdx) — sample starter posts
  layouts/              # BlogPost.astro
  pages/                # Routes (index, about, blog/, rss.xml.js)
  styles/global.css
  consts.ts             # SITE_TITLE, SITE_DESCRIPTION
astro.config.mjs
wrangler.jsonc
```

## Routes

| Path | Source |
|------|--------|
| `/` | `src/pages/index.astro` |
| `/about` | `src/pages/about.astro` |
| `/blog` | `src/pages/blog/index.astro` |
| `/blog/*` | `src/pages/blog/[...slug].astro` (content collection) |
| `/rss.xml` | `src/pages/rss.xml.js` |

## Content collections

- Collection: `blog` in `src/content.config.ts`
- Posts: `src/content/blog/**/*.{md,mdx}`
- Schema: `title`, `description`, `pubDate`, optional `updatedDate`, optional `heroImage`

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server (default `localhost:4321`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run generate-types` | `wrangler types` for Cloudflare bindings |

**Node**: `>=22.12.0` (see `package.json` `engines`).

## Configuration notes

- **`astro.config.mjs`**: `site` is still `https://example.com` — update before production SEO/sitemap/RSS.
- **`src/consts.ts`**: `SITE_TITLE` / `SITE_DESCRIPTION` still Astro blog defaults.
- **`wrangler.jsonc`**: Worker name `astro-therobhenry`; assets served from `./dist`; observability enabled.

## Ignored paths

- **Git** (`.gitignore`): `dist/`, `.astro/`, `node_modules/`, `.wrangler/`, env files, etc.
- **Cursor** (`.cursorignore`): same build/cache dirs plus `package-lock.json` for indexing.

## Conventions (for now)

- Prefer editing existing Astro components and content collection posts over adding new frameworks.
- Blog posts live under `src/content/blog/`; pages under `src/pages/`.
- Do not commit `.wrangler/` or local Wrangler SQLite state.
