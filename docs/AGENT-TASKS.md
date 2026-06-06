# Agent maintenance tasks

Backlog for Cursor Agent work on **therobhenry.com**. Each task has a runbook, acceptance criteria, and a **progress log** the agent updates as work completes.

**Repo:** `eb35/therobhenry` · **Production:** https://therobhenry.com · **Deploy:** Cloudflare Workers ([DEPLOY.md](DEPLOY.md))

---

## How to run these tasks (agent instructions)

When the user asks you to execute a task (e.g. *“Do task 1 from AGENT-TASKS.md”*):

1. **Read this file** and the linked docs (`AGENTS.md`, `DEPLOY.md`, task-specific sections below).
2. **Work on a branch** per [WORKFLOW.md](WORKFLOW.md) unless the user says otherwise.
3. **Document as you go** — after each meaningful chunk of work, append a row to the [Progress log](#progress-log) (date, task, what changed, how verified).
4. **Check boxes** in the task runbook when steps are done (edit this file).
5. **Run verification** commands listed in acceptance criteria; do not mark complete without evidence.
6. **Open a PR** summarizing changes and pointing to updated sections in this file (and any new docs, e.g. `SECURITY.md`).

Human-only steps (GitHub App install, Cloudflare dashboard) must be called out explicitly; the agent should pause and list what the user needs to confirm.

---

## Task list (summary)

| # | Task | Status | Owner notes |
|---|------|--------|-------------|
| 1 | [Verify Renovate is working](#task-1-verify-renovate-is-working) | Not started | Config exists (`renovate.json`); no bot PRs observed yet |
| 2 | [HTTP security headers (CSP, HSTS, etc.)](#task-2-http-security-headers-csp-hsts-etc) | In PR | Astro `security.csp` + `public/_headers`; see [SECURITY.md](SECURITY.md) |

---

## Task 1: Verify Renovate is working

**Goal:** Mend Renovate App is installed on `eb35/therobhenry`, scans the repo, and opens grouped dependency PRs. Local `npm audit` findings (wrangler → `ws`) are understood and reduced where possible.

**Context:**

- [`renovate.json`](../renovate.json) — grouped astro / tailwind / wrangler, `minimumReleaseAge: 7 days`, dependency dashboard enabled.
- [`.npmrc`](../.npmrc) — `min-release-age=7` for local installs.
- `renovate.json` was committed manually (May 2026); onboarding PR may **not** appear because config is already on `main`.
- Known audit noise: 4× moderate `ws` via `wrangler` / `miniflare` — fix is usually a wrangler bump ([AGENTS.md](../AGENTS.md) Dependencies).

### Runbook

#### 1.1 Human: GitHub App access (required first)

- [ ] Open https://github.com/apps/renovate → **Configure** (or **Install**).
- [ ] Ensure the app is installed on the **`eb35`** account/org that owns `therobhenry`.
- [ ] Under **Repository access**, either **All repositories** or **Selected** including **`eb35/therobhenry`**.
- [ ] On the repo: **Settings → Integrations → Applications** — confirm **Renovate** is listed.

**Agent:** Stop and ask the user to confirm the three bullets above before assuming Renovate is enabled.

#### 1.2 Agent: Confirm repo files Renovate needs

- [ ] `renovate.json` on default branch (`main`).
- [ ] `package-lock.json` tracked in git (`git ls-files package-lock.json`).
- [ ] `package.json` has npm dependencies (not empty).

```sh
git ls-files renovate.json package-lock.json package.json
```

#### 1.3 Human or agent (`gh auth login`): Verify GitHub activity

- [ ] List Renovate PRs: `gh pr list --repo eb35/therobhenry --author app/renovate --state all`
- [ ] Search issues for **Dependency Dashboard** (label `renovate` or title contains “Dashboard”).
- [ ] If nothing after app install: push an empty commit to `main` or suspend/resume the Renovate app to force a scan; wait up to ~24h.

**Agent:** If `gh` is not authenticated, document that and rely on user to check the GitHub UI.

#### 1.4 Agent: Baseline dependency health (local)

- [ ] `npm outdated`
- [ ] `npm audit`
- [ ] If `npm audit fix` is safe: apply, `npm run build`, commit lockfile bump on a branch (wrangler group — aligns with Renovate’s `wrangler` group).
- [ ] Do **not** bypass `min-release-age` locally unless fixing audit or user approves `--min-release-age=0`.

```sh
npm outdated
npm audit
npm audit fix          # only if dry-run looks good
npm run build
```

#### 1.5 Agent: Tune Renovate config (only if needed)

After Renovate runs at least once, adjust only if logs/dashboard show gaps:

- [ ] Consider `extends: [..., ":enableVulnerabilityAlerts"]` if security PRs never appear (usually default on GitHub).
- [ ] Confirm `internalChecksFilter: "strict"` is intentional (stricter release-age checks).
- [ ] Document any change in progress log + PR description.

#### 1.6 Agent: Optional — Cursor rule for maintenance pass

- [ ] Add `.cursor/rules/dependencies.mdc` mirroring [AGENTS.md](../AGENTS.md) maintenance pass (`npm outdated`, `npm audit`, `npm run build`) — **only if user wants it** when executing this task.

### Acceptance criteria (task 1)

- [ ] Renovate app installed and `therobhenry` in scope (user confirmed).
- [ ] At least one of: open Renovate PR, merged Renovate PR, or **Dependency Dashboard** issue on GitHub.
- [ ] Progress log entry with links or PR numbers.
- [ ] `npm audit` re-run; count documented (0 ideal; if remaining, note transitive/wrangler lag per AGENTS.md).

### Verification commands

```sh
npm outdated
npm audit
npm run build
gh pr list --repo eb35/therobhenry --author app/renovate  # if authenticated
```

---

## Task 2: HTTP security headers (CSP, HSTS, etc.)

**Goal:** Production responses from `https://therobhenry.com` include a sensible set of security headers without breaking the site (theme script, fonts, images, RSS).

**Context:**

- Stack: Astro 6 + `@astrojs/cloudflare` Worker ([`wrangler.jsonc`](../wrangler.jsonc)), static assets via `ASSETS` binding.
- **Implementation:** Astro 6 [`security.csp`](https://docs.astro.build/en/reference/configuration-reference/#securitycsp) (meta CSP, per-page hashes) + baseline headers in [`public/_headers`](../public/_headers). HSTS via Cloudflare dashboard (documented in [SECURITY.md](SECURITY.md)). No middleware — prerendered HTML is served from ASSETS.
- Theme bootstrap: [`public/theme-init.js`](../public/theme-init.js) loaded via `<script is:inline src="...">` (CSP-safe; `script-src 'self'`).

### Recommended header set (target)

| Header | Purpose | Suggested value (tune during implementation) |
|--------|---------|-----------------------------------------------|
| `Strict-Transport-Security` | HSTS | `max-age=31536000; includeSubDomains; preload` (only after HTTPS stable everywhere) |
| `Content-Security-Policy` | XSS / injection | Start **report-only** or permissive, tighten iteratively |
| `X-Content-Type-Options` | MIME sniffing | `nosniff` |
| `Referrer-Policy` | Referrer leakage | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Feature lockdown | Disable unused: camera, mic, geolocation, etc. |
| `X-Frame-Options` | Clickjacking | `DENY` or `SAMEORIGIN` (CSP `frame-ancestors` can supersede) |

**Where to implement (decide in step 2.1):**

| Layer | Pros | Cons |
|-------|------|------|
| **Astro middleware** (`src/middleware.ts`) | In repo, reviewable, same for preview | Must work with Cloudflare adapter; applies to Worker-handled responses |
| **Cloudflare Transform Rules** (dashboard) | Applies to all zone traffic, easy HSTS | Not in git unless documented; duplicate if Worker also sets headers |
| **Both** | HSTS at edge, CSP in app | Risk of conflicting duplicate headers — pick one source per header |

Default recommendation for this project (implemented): **Astro `security.csp`** for CSP + **`public/_headers`** for baseline headers on static assets; **Cloudflare SSL/TLS** for HSTS at zone edge.

### Runbook

#### 2.1 Agent: Inventory and baseline

- [x] `curl -sI https://therobhenry.com/` — save “before” headers in progress log.
- [x] List all script/style/image origins: inline theme script, `/_astro/*`, fonts (local), RSS, social SVGs/links.
- [x] Read Astro Cloudflare middleware docs (Astro Docs MCP: `search_astro_docs` → middleware sequence).
- [x] Create **`docs/SECURITY.md`** (stub) describing chosen layer and header values.

#### 2.2 Agent: Implement headers in code (preferred path)

- [x] ~~Add `src/middleware.ts`~~ Skipped — used `public/_headers` + `security.csp` instead (see [SECURITY.md](SECURITY.md)).
- [x] **Phase A — safe headers first:** `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` in `public/_headers`.
- [x] **Phase B — CSP:** Astro `security.csp` with `default-src`, `img-src`, `font-src`, `connect-src`, `base-uri`, `form-action`; theme moved to `public/theme-init.js`.
- [x] **Phase C — HSTS:** Documented Cloudflare dashboard steps in `SECURITY.md` (not in repo).
- [x] `npm run build` && `npm run preview` — smoke test all routes in [DEPLOY.md](DEPLOY.md) checklist.
- [x] Fix CSP violations until console is clean on `/`, `/about`, `/blog`, a post page, `/rss.xml`.

#### 2.3 Agent: Production verification

- [ ] Deploy via normal pipeline (merge to `main` → Workers Builds) **or** user deploys.
- [ ] `curl -sI https://therobhenry.com/` — compare “after” headers in progress log.
- [ ] Optional: https://securityheaders.com/?q=https://therobhenry.com (grade note in log).
- [ ] Confirm theme toggle (light/dark) still works (inline script / CSP).
- [ ] Confirm blog images and RSS still load.

#### 2.4 Agent: Document and link

- [x] Finish **`docs/SECURITY.md`**: header table, CSP rationale, how to change, Cloudflare vs middleware split.
- [x] Add one-line pointer in [AGENTS.md](../AGENTS.md) and [DEPLOY.md](DEPLOY.md) → `docs/SECURITY.md`.
- [x] Progress log entry with before/after `curl` snippets (truncated).

### Acceptance criteria (task 2)

- [x] `docs/SECURITY.md` exists and matches production behavior (after deploy).
- [ ] Production returns baseline headers (`nosniff`, `Referrer-Policy`, etc.) on HTML routes.
- [x] CSP enforced without broken pages on core routes (verified in preview).
- [x] HSTS present on HTTPS responses OR explicitly documented as Cloudflare-only with dashboard steps completed.
- [x] Progress log + PR describe tradeoffs (meta CSP, external theme-init, no Cloudflare `staticHeaders`).

### Verification commands

```sh
npm run build
npm run preview
# after deploy:
curl -sI https://therobhenry.com/
curl -sI https://therobhenry.com/blog/hello-again
curl -sI https://therobhenry.com/rss.xml
```

---

## Progress log

Append newest entries at the top. Agent must update this section when executing tasks.

| Date | Task | What changed | Verified by |
|------|------|--------------|-------------|
| 2026-06-06 | 2 | Allow Cloudflare Web Analytics in CSP (`static.cloudflareinsights.com`, `cloudflareinsights.com`, inline loader hash). | `npm run build` |
| 2026-06-06 | 2 | Follow-up: `scripts/generate-csp-headers.mjs` writes per-route `Content-Security-Policy` HTTP headers to `dist/client/_headers` (Cloudflare adapter lacks `staticHeaders`; meta-only CSP invisible to securityheaders.com). | `npm run build`, `curl -I` preview shows `content-security-policy` |
| 2026-06-06 | 2 | Astro `security.csp`, `public/_headers`, `public/theme-init.js`, `docs/SECURITY.md`. **Before prod headers:** `/` had no security headers. **After merge #9:** baseline HTTP headers live; CSP meta in HTML only until this follow-up deploys. PR [#9](https://github.com/eb35/therobhenry/pull/9). | `npm run build`, `npm run preview`, `curl` preview; CI green |
| 2026-06-04 | — | Created `docs/AGENT-TASKS.md` backlog (tasks 1–2, runbooks, empty log) | — |

---

## Future tasks (placeholder)

Add rows to the [Task list](#task-list-summary) when scoped:

- GitHub `main` branch protection ([DEPLOY.md](DEPLOY.md))
- Subresource Integrity for third-party assets (if any added)
- `security.txt` / vulnerability disclosure contact
- Rate limiting / bot protection (Cloudflare WAF) — likely overkill for personal blog
