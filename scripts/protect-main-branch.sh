#!/usr/bin/env bash
# Apply branch protection on main for eb35/therobhenry.
# Prerequisite: CI workflow has run at least once so "CI / build" exists.
set -euo pipefail

REPO="${GITHUB_REPOSITORY:-eb35/therobhenry}"
OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
CHECK="CI / build"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Not logged in. Run: gh auth login"
  exit 1
fi

echo "Checking that status check '${CHECK}' exists on ${REPO}..."
if ! gh api "repos/${OWNER}/${NAME}/commits/main/check-runs" --jq '.check_runs[].name' 2>/dev/null | grep -qx "${CHECK}"; then
  echo "Warning: '${CHECK}' not found on latest main commit."
  echo "Push .github/workflows/ci.yml and wait for a green CI run, then re-run this script."
  if [[ "${PROTECT_FORCE:-}" == "1" ]]; then
    echo "PROTECT_FORCE=1 set; continuing."
  elif [[ -t 0 ]]; then
    read -r -p "Continue anyway? [y/N] " ans
    [[ "${ans:-}" =~ ^[Yy]$ ]] || exit 1
  else
    echo "Re-run with PROTECT_FORCE=1 after CI is green, or run interactively."
    exit 1
  fi
fi

echo "Applying branch protection to main..."
gh api "repos/${OWNER}/${NAME}/branches/main/protection" -X PUT --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["${CHECK}"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creatures": false,
  "required_conversation_resolution": false
}
EOF

echo "Done. Verify: https://github.com/${REPO}/settings/branches"
