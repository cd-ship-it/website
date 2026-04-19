#!/usr/bin/env bash
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
step()  { echo -e "\n${GREEN}▶ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠  $1${NC}"; }
error() { echo -e "${RED}✖  $1${NC}"; exit 1; }

# ── 1. Build for production ───────────────────────────────────────────────────
step "Building for production (base=/v2)..."
sed -i '' 's/^PLATFORM=development/PLATFORM=production/' .env
PLATFORM=production npm run build || { sed -i '' 's/^PLATFORM=production/PLATFORM=development/' .env; error "Build failed."; }

# ── 2. Deploy dist/ to server via rsync ───────────────────────────────────────
step "Deploying to crosspointchurchsv.org/v2 via rsync..."
bash "$(dirname "$0")/rsync.sh" || error "rsync failed."

# ── 3. Commit & push source to GitHub ────────────────────────────────────────
step "Pushing source to GitHub (${REPO_BRANCH:-$(git symbolic-ref --short HEAD)})..."

git add -A

if git diff --cached --quiet; then
  warn "No source changes to commit — skipping commit."
else
  MSG="deploy: $(date '+%Y-%m-%d %H:%M')"
  git commit -m "$MSG"
  echo "  Committed: $MSG"
fi

git push origin HEAD

# ── 4. Restore local .env to development ─────────────────────────────────────
step "Restoring PLATFORM=development in .env..."
sed -i '' 's/^PLATFORM=production/PLATFORM=development/' .env
echo "  .env restored."

echo -e "\n${GREEN}✓ Done. Site is live at https://crosspointchurchsv.org/v2${NC}\n"
