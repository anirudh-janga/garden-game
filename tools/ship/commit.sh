#!/bin/bash
# commit.sh "<subject>" "<body>": type-check, build, commit as the repo owner, push the branch.
# The co-author trailer names whoever is doing the work, so it comes from the environment:
#   COAUTHOR="<name> <email>"  SESSION_URL="<url>"  tools/ship/commit.sh "Subject" "Body"
# (Use the attribution lines the session's own instructions give.)
set -e
cd "$(dirname "$0")/../.."
: "${COAUTHOR:?set COAUTHOR to the co-author line, e.g. \"Name <email>\"}"
npx tsc --noEmit
npm run build 2>&1 | grep -q "built in"
git config user.name "Anirudh"; git config user.email "7342625+anirudh-janga@users.noreply.github.com"
git add -A src BACKLOG.md tools public index.html vite.config.ts 2>/dev/null || true
{
  printf '%s\n\n%s\n\n' "$1" "$2"
  printf 'Co-Authored-By: %s\n' "$COAUTHOR"
  [ -n "$SESSION_URL" ] && printf 'Claude-Session: %s\n' "$SESSION_URL"
} | git commit -q -F -
b=$(git rev-parse --abbrev-ref HEAD)
for i in 1 2 3 4; do git push -q -u origin "$b" && break; sleep $((2**i)); done
git log --oneline -1
