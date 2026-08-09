#!/usr/bin/env bash
# Runs server + client dev together; exits non-zero as soon as either dies
# (plain `& wait` would exit 0 with the server dead and only the client running).
cd "$(dirname "$0")/.."

npm run dev -w server & S=$!
npm run dev -w client & C=$!
trap 'kill "$S" "$C" 2>/dev/null' EXIT

# ponytail: poll instead of `wait -n` — macOS ships bash 3.2, which lacks it
while kill -0 "$S" 2>/dev/null && kill -0 "$C" 2>/dev/null; do
  sleep 1
done
echo "❌ a dev process died — stopping the other" >&2
exit 1
