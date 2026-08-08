#!/usr/bin/env bash
# Runs eslint for server and client in parallel, prints colored per-workspace results.

npm run lint -w server & S=$!
npm run lint -w client & C=$!
wait "$S"; a=$?
wait "$C"; b=$?

green='\033[1;32m'; red='\033[1;31m'; reset='\033[0m'
report() {
  if [ "$2" -eq 0 ]; then
    printf "${green}✓ %s lint passed${reset}\n" "$1"
  else
    printf "${red}✗ %s lint failed${reset}\n" "$1"
  fi
}

echo
report server "$a"
report client "$b"
exit $((a | b))
