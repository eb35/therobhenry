# Git and release workflow

Production deploys come from **`main`** (Cloudflare Workers Builds). GitHub **branch protection** requires pull requests and a green **`build`** CI check before merge. Direct `git push origin main` is rejected.

## Normal flow

1. Update local `main`: `git checkout main && git pull`
2. Create a branch: `git checkout -b short-description`
3. Edit, commit on the **branch** (not on `main`)
4. Push and open a PR:
   ```sh
   git push -u origin short-description
   gh pr create
   ```
5. Wait for the **`build`** check on the PR (`.github/workflows/ci.yml` — `npm ci` + `npm run build`)
6. Merge the PR on GitHub (or `gh pr merge`)
7. Workers Builds deploys `main` automatically
8. Sync locally: `git checkout main && git pull`

**Habit:** After `git pull` on `main`, create a branch before editing so you never stack commits on local `main`.

Renovate and other bots already use PRs into `main`.

## Committed on local `main` by mistake

Do not `git push origin main` — it will fail. Move the work to a branch:

```sh
git checkout -b my-change          # keeps your commit(s) on this branch
git checkout main
git reset --hard origin/main       # local main matches GitHub (no local-only commits)
git checkout my-change
git push -u origin my-change
gh pr create
# wait for build → merge → git checkout main && git pull
```

## Quick reference

| Goal | Command / action |
|------|------------------|
| Ship a change | Branch → PR → green `build` → merge |
| Deploy site | Merge to `main` (Workers Builds) |
| Push straight to `main` | Not allowed (use PR) |
| Fix local commits on `main` | Branch + reset `main` to `origin/main` → PR |

## Related docs

- **[DEPLOY.md](DEPLOY.md)** — Cloudflare Workers Builds, images, branch protection setup
- **[AGENTS.md](../AGENTS.md)** — Cursor/agent project context
