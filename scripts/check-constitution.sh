#!/usr/bin/env bash
# Machine checks for .sdd/constitution.md (gate L3). Fails CI on violation.
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0

violation() {
  echo "❌ $1"
  fail=1
}

# SEC-04: process.env only in server/src/infra/config/
if grep -rn "process\.env" server/src --include="*.ts" | grep -v "^server/src/infra/config/"; then
  violation "SEC-04: process.env outside server/src/infra/config/"
fi

# SEC-04: .env must be git-ignored
if ! grep -qE "^\.env$" .gitignore; then
  violation "SEC-04: .gitignore does not ignore .env"
fi

# SEC-03: raw req.* passed straight into a Mongoose query
if grep -rnE "(find|findOne|findOneAndUpdate|updateOne|updateMany|deleteOne|deleteMany|countDocuments|aggregate)\s*\(\s*req\." server/src --include="*.ts"; then
  violation "SEC-03: raw req.body/req.query passed into a Mongoose query"
fi

# ARCH-01: domain imports nothing from other layers (static, barrel, or dynamic)
if grep -rnE "from ['\"][^'\"]*(usecase|interface|infra)(/|['\"])" server/src/domain --include="*.ts" ||
   grep -rnE "import\s*\(\s*['\"][^'\"]*(usecase|interface|infra)" server/src/domain --include="*.ts"; then
  violation "ARCH-01: domain/ imports from an outer layer"
fi

# ARCH-01: usecase imports nothing from interface/infra
if grep -rnE "from ['\"][^'\"]*(interface|infra)(/|['\"])" server/src/usecase --include="*.ts" ||
   grep -rnE "import\s*\(\s*['\"][^'\"]*(interface|infra)" server/src/usecase --include="*.ts"; then
  violation "ARCH-01: usecase/ imports from interface/ or infra/"
fi

# LOG-01: logging + error middleware actually mounted (anchored — a commented-out line doesn't count)
if ! grep -qE "^\s*app\.use\(requestLogger\)" server/src/interface/http/server.ts ||
   ! grep -qE "^\s*app\.use\(errorHandler\)" server/src/interface/http/server.ts; then
  violation "LOG-01: requestLogger/errorHandler not mounted in server.ts"
fi

# STD-01: strict mode pinned in both workspaces (parse the JSON, don't grep strings)
for ws in server client; do
  if ! node -e "process.exit(require('./$ws/tsconfig.json').compilerOptions.strict === true ? 0 : 1)"; then
    violation "STD-01: $ws/tsconfig.json does not pin \"strict\": true"
  fi
done

# STD-01: no `any` in source or tests (also catches generics: Array<any>, Record<string, any>)
if grep -rnE "(:|,|<)\s*any\b|as any\b" server/src server/tests client/src --include="*.ts" --include="*.tsx"; then
  violation "STD-01: 'any' found in source (use unknown + narrowing)"
fi

if [ "$fail" -eq 0 ]; then
  echo "✅ constitution ok"
fi
exit "$fail"
