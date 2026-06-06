# Security headers

Production site: **https://therobhenry.com** · Stack: Astro 6 + Cloudflare Workers

This document describes how HTTP security headers and Content Security Policy (CSP) are configured for therobhenry.com.

---

## Overview

**CSP** uses Astro 6's built-in [`security.csp`](https://docs.astro.build/en/reference/configuration-reference/#securitycsp) feature. Astro auto-generates SHA-256 hashes for bundled scripts and styles. A post-build script ([`scripts/generate-csp-headers.mjs`](../scripts/generate-csp-headers.mjs)) copies each page's policy into [`dist/client/_headers`](../dist/client/_headers) as an HTTP `Content-Security-Policy` header (required for securityheaders.com and `curl -I`). Astro also emits a matching `<meta http-equiv="content-security-policy">` in HTML as a fallback.

**Other headers** (nosniff, Referrer-Policy, etc.) are set via Cloudflare's [`_headers`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#headers) file in [`public/_headers`](../public/_headers). Baseline rules are copied at build time; CSP rules are appended per route by the post-build script.

**HSTS** is configured at the Cloudflare zone edge (dashboard), not in repo code.

### Why not Astro middleware?

This site is **fully prerendered**. HTML is served from the Cloudflare **ASSETS** binding. Middleware runs at build time for prerendered pages but does not attach HTTP headers to static files served directly from ASSETS. For baseline headers on static HTML, `_headers` is the correct layer.

Revisit middleware when adding SSR or on-demand routes.

### Why HTTP CSP via post-build script?

`@astrojs/cloudflare` does **not** yet support `staticHeaders: true` (unlike Node, Netlify, Vercel). Without that adapter feature, Astro only emits CSP as a `<meta>` tag — browsers enforce it, but **`curl -I` and securityheaders.com only inspect HTTP response headers**.

[`scripts/generate-csp-headers.mjs`](../scripts/generate-csp-headers.mjs) runs after `astro build`, reads each page's CSP meta tag, and writes per-route `Content-Security-Policy` entries into `dist/client/_headers`. Cloudflare ASSETS applies those headers on static HTML responses.

When upstream adds Cloudflare `staticHeaders`, we can remove this script and let the adapter handle it natively (meta tags would be omitted automatically).

---

## Header inventory

| Header | Value | Delivery |
|--------|-------|----------|
| `Content-Security-Policy` | Per-page (Astro-generated hashes) | HTTP via `dist/client/_headers` (post-build) + `<meta>` fallback in HTML |
| `X-Content-Type-Options` | `nosniff` | [`public/_headers`](../public/_headers) → `dist/client/_headers` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | `public/_headers` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | `public/_headers` |
| `X-Frame-Options` | `DENY` | `public/_headers` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` (suggested) | Cloudflare dashboard |

Per-page CSP is generated at build time — **do not** hand-edit CSP lines in `public/_headers`.

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
      "connect-src 'self' https://cloudflareinsights.com",
      "base-uri 'self'",
      "form-action 'self'",
    ],
    scriptDirective: {
      resources: ["'self'", "https://static.cloudflareinsights.com"],
      hashes: [
          "sha256-4zVaEKYnR18t8lqSvrDLj/1hLH54EA4pHoB3mSd2Bz8=",
          "sha256-mjyWuIypijg1Ajeng2q5VJbB81N1/AWlqiYEh4xL/8A=",
        ],
    },
  },
},
```

Astro automatically adds per-page SHA-256 hashes for bundled scripts and scoped styles to `script-src` / `style-src`. `scriptDirective.resources` overrides the default `script-src` sources, so `'self'` must be listed explicitly.

| Directive | Rationale |
|-----------|-----------|
| `default-src 'self'` | Fallback: only same-origin resources |
| `img-src 'self' data:` | Local images, `/_astro/*`, favicons; `data:` for inline SVG if needed |
| `font-src 'self'` | Local Atkinson fonts via `astro:fonts` |
| `connect-src 'self' https://cloudflareinsights.com` | Beacon POSTs for Cloudflare Web Analytics |
| `base-uri 'self'` | Prevent `<base>` tag injection |
| `form-action 'self'` | Forms (if added) must submit to same origin |
| `script-src` (via `scriptDirective`) | `'self'`, `https://static.cloudflareinsights.com`, Astro hashes, plus manual hashes for Cloudflare's injected inline loaders (may be more than one) |

### Cloudflare Web Analytics

[Cloudflare Web Analytics](https://developers.cloudflare.com/analytics/web-analytics/) injects scripts at the edge (`static.cloudflareinsights.com` + a small inline loader). These are **not** in the Astro repo, so they must be allowlisted manually in `scriptDirective` and `connect-src`.

Cloudflare may inject **multiple** inline loader variants; keep every hash the browser reports in `scriptDirective.hashes` (currently two). If the console reports a new inline-script hash after a Cloudflare change, copy it from the error and redeploy.

`net::ERR_BLOCKED_BY_CLIENT` on `beacon.min.js` is usually an **ad blocker or privacy extension**, not CSP — test in a private window with extensions disabled to confirm analytics works.

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

Expect baseline headers and **`content-security-policy`** from `_headers` on HTML responses. View source to confirm meta CSP matches (fallback).

Optional: [securityheaders.com](https://securityheaders.com/?q=https://therobhenry.com) — meta CSP may score differently than header-delivered CSP.

---

## Known limitations

| Limitation | Mitigation |
|------------|------------|
| No CSP in dev mode | Use `npm run build && npm run preview` |
| Cloudflare lacks `staticHeaders` | Post-build script writes CSP to `_headers`; remove when adapter adds native support |
| `frame-ancestors` not in meta | `X-Frame-Options: DENY` in `_headers` |
| Shiki syntax highlighting incompatible with Astro CSP | Use [`<Prism />`](https://docs.astro.build/en/guides/syntax-highlighting/#prism-) if code blocks are added |
| Astro view transitions (`<ClientRouter />`) not supported | Not used on this site |

---

## Changing headers

| Change | Where |
|--------|-------|
| CSP directives | [`astro.config.mjs`](../astro.config.mjs) → `security.csp` |
| CSP HTTP headers per route | Auto-generated by [`scripts/generate-csp-headers.mjs`](../scripts/generate-csp-headers.mjs) at build |
| Per-page CSP | `Astro.csp?.insertDirective()` etc. in `.astro` frontmatter |
| Baseline HTTP headers | [`public/_headers`](../public/_headers) |
| HSTS | Cloudflare dashboard |
| Theme bootstrap script | [`public/theme-init.js`](../public/theme-init.js) |

After any script/style change in components, rebuild — CSP hashes change per page.

---

## Progress log

Implementation tracked in [AGENT-TASKS.md](AGENT-TASKS.md) Task 2.
