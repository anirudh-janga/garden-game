#!/bin/bash
# deploy.sh : after the PR is merged, bring master up to date, deploy to main, wait until live.
set -e
cd "$(dirname "$0")/../.."
git checkout -q master
git pull -q origin master
npm run build 2>&1 | grep -q "built in"
git push -q origin master:main
h=$(ls dist/assets/index-*.js | xargs basename)
for i in $(seq 1 30); do [ "$(curl -s https://anirudh-janga.github.io/garden-game/ | grep -o 'index-[^"]*\.js')" = "$h" ] && { echo "live $h"; exit 0; }; sleep 15; done
echo "not live yet ($h)"; exit 1
