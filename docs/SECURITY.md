# Security headers

Production site: **https://therobhenry.com** · Stack: Astro 6 + Cloudflare Workers

This document describes how HTTP security headers and Content Security Policy (CSP) are configured for therobhenry.com.

---

## Overview

**CSP** uses Astro 6's built-in [`security.csp`](https://docs.astro.build/en/reference/configuration-reference/#securitycsp) feature. Astro auto-generates SHA-256 hashes for bundled scripts and styles and injects a **per-page** policy. We do **not** hand-roll CSP in middleware — Astro's implementation tracks script/style changes at build time.

**Other headers** (nosniff, Referrer-Policy, etc.) are set via Cloudflare's [`_headers`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#headers) file in [`public/_headers`](../public/_headers), copied to `dist/` at build and applied to static asset responses.

**HSTS** is configured at the Cloudflare zone edge (dashboard), not in repo code.

### Why not Astro middleware?

This site is **fully prerendered**. HTML is served from the Cloudflare **ASSETS** binding. Middleware runs at build time for prerendered pages but does not attach HTTP headers to static files served directly from ASSETS. For baseline headers on static HTML, `_headers` is the correct layer.

Revisit middleware when adding SSR or on-demand routes.

### Why meta CSP instead of HTTP header?

`@astrojs/cloudflare` does **not** yet support `staticHeaders: true` (unlike Node, Netlify, Vercel). CSP is delivered via `<meta http-equiv="content-security-policy">` in each HTML page. This supports `script-src`, `style-src`, `default-src`, `img-src`, etc.

Directives that **only work as HTTP headers** (`frame-ancestors`, `report-uri`, `sandbox`) are not enforced via meta. Clickjacking protection uses `X-Frame-Options: DENY` in `_headers` instead.

---

## Header inventory

| Header | Value | Delivery |
|--------|-------|----------|
| `Content-Security-Policy` | Per-page (Astro-generated hashes) | `<meta>` in HTML |
| `X-Content-Type-Options` | `nosniff` | [`public/_headers`](../public/_headers) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | `public/_headers` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | `public/_headers` |
| `X-Frame-Options` | `DENY` | `public/_headers` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` (suggested) | Cloudflare dashboard |

**Do not** add a static `Content-Security-Policy` to `_headers` — hashes differ per page.

---

## CSP configuration

Defined in [`astro.config.mjs`](../astro.config.mjs):

```js
security: {
  csp: {
    directives: [
      "default-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ],
  },
},
```

Astro automatically adds `script-src` and `style-src` with `'self'` plus per-page SHA-256 hashes for bundled scripts and scoped styles. Do not declare those unless overriding via `scriptDirective.resources` / `styleDirective.resources`.

| Directive | Rationale |
|-----------|-----------|
| `default-src 'self'` | Fallback: only same-origin resources |
| `img-src 'self' data:` | Local images, `/_astro/*`, favicons; `data:` for inline SVG if needed |
| `font-src 'self'` | Local Atkinson fonts via `astro:fonts` |
| `connect-src 'self'` | No third-party analytics yet |
| `base-uri 'self'` | Prevent `<base>` tag injection |
| `form-action 'self'` | Forms (if added) must submit to same origin |

To allow third-party scripts or embeds later, extend `directives` or use per-page [`Astro.csp`](https://docs.astro.build/en/reference/api-reference/#csp) APIs (`insertDirective`, `insertScriptResource`, etc.).

---

## Theme bootstrap (CSP-safe)

Dark/light theme is applied before first paint to avoid flash. The bootstrap script lives in [`public/theme-init.js`](../public/theme-init.js) and is loaded from [`BaseHead.astro`](../src/components/BaseHead.astro):

```html
<script is:inline src="/theme-init.js"></script>
```

Same-origin scripts are allowed by `script-src 'self'`. The `is:inline` directive tells Astro to leave the public asset unbundled (required for `/public` paths); the script body is external, so no hash is needed. If you change `theme-init.js`, no config update is required. Theme toggle and mobile nav use bundled `<script>` blocks in Astro components; Astro hashes those at build time.

## HSTS (Cloudflare dashboard — human step)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **therobhenry.com**
2. **SSL/TLS** → **Edge Certificates**
3. Enable **HTTP Strict Transport Security (HSTS)**
4. Recommended settings (after confirming HTTPS works everywhere):
   - Max age: **12 months** (31536000 seconds)
   - Include subdomains: **on**
   - Preload: **on** (optional; only if committed to HTTPS long-term)

HSTS at the edge applies zone-wide, including static assets — preferred over duplicating in `_headers`.

---

## Verification

CSP is **not enforced in `npm run dev`**. Always test with build + preview.

### Local

```sh
npm run build
npm run preview
```

Checklist:

- [ ] View source on `/`, `/about`, `/blog`, `/blog/hello-again` — `<meta http-equiv="content-security-policy">` present
- [ ] DevTools Console: zero CSP violations on all HTML routes
- [ ] Theme toggle (light ↔ dark) works
- [ ] Mobile menu open/close works
- [ ] Blog hero images and fonts load
- [ ] `/rss.xml` returns valid XML (no HTML CSP expected)

Inspect CSP meta:

```sh
grep -o 'http-equiv="content-security-policy"[^>]*' dist/client/index.html
```

Confirm `_headers` copied to dist:

```sh
cat dist/client/_headers
```

### Production (after deploy)

```sh
curl -sI https://therobhenry.com/
curl -sI https://therobhenry.com/blog/hello-again/
curl -sI https://therobhenry.com/rss.xml
```

Expect baseline headers from `_headers` on HTML/XML responses. View source on HTML pages for meta CSP.

Optional: [securityheaders.com](https://securityheaders.com/?q=https://therobhenry.com) — meta CSP may score differently than header-delivered CSP.

---

## Known limitations

| Limitation | Mitigation |
|------------|------------|
| No CSP in dev mode | Use `npm run build && npm run preview` |
| Cloudflare lacks `staticHeaders` | Meta CSP for now; switch to HTTP header when upstream adds support |
| `frame-ancestors` not in meta | `X-Frame-Options: DENY` in `_headers` |
| Shiki syntax highlighting incompatible with Astro CSP | Use [`<Prism />`](https://docs.astro.build/en/guides/syntax-highlighting/#prism-) if code blocks are added |
| Astro view transitions (`<ClientRouter />`) not supported | Not used on this site |

---

## Changing headers

| Change | Where |
|--------|-------|
| CSP directives | [`astro.config.mjs`](../astro.config.mjs) → `security.csp` |
| Per-page CSP | `Astro.csp?.insertDirective()` etc. in `.astro` frontmatter |
| Baseline HTTP headers | [`public/_headers`](../public/_headers) |
| HSTS | Cloudflare dashboard |
| Theme bootstrap script | [`public/theme-init.js`](../public/theme-init.js) |

After any script/style change in components, rebuild — CSP hashes change per page.

---

## Progress log

Implementation tracked in [AGENT-TASKS.md](AGENT-TASKS.md) Task 2.
