# Constitution

Version 1.1.0 · Status: ACTIVE (amendable — see §Amendment)
Team: [5 members] · Supervisor: [GVHD] · Timeline: [start] → [defense day]

**Principle: a rule without a machine check is a suggestion.** Every rule below names
its check. Machine checks live in `scripts/check-constitution.sh` and `.github/workflows/ci.yml`;
`review` means a human gate in PR review — listed explicitly so reviewers know what CI does NOT cover.

---

## Layer 1 — Security & data

### SEC-01 · Passwords
Hash with bcrypt (cost ≥ 12) or argon2id. Plaintext never stored, logged, or echoed.
**Check:** dormant until the auth feature exists. The auth PR MUST add a test asserting the
stored value verifies against the input and does not equal it, plus the SEC-02 route-walk test.

### SEC-02 · Authentication on mutating endpoints
Every POST/PUT/PATCH/DELETE route requires auth middleware, except routes listed in an
explicit `PUBLIC_ROUTES` allowlist (auth flows only: login, register, refresh).
**Rule and check are DORMANT until the auth feature ships** — the template's demo routes
are public by design until then. The auth PR activates the rule and MUST add a test that
walks the Express router and asserts every mutating route has auth middleware or is in
`PUBLIC_ROUTES`.

### SEC-03 · Input validation (NoSQL injection)
All client input passes a zod schema or a domain factory before use. Never pass raw
`req.body` / `req.query` / `req.params` objects into a Mongoose query — operator injection
(`{"$gt": ""}`) is the MERN attack, not SQL concatenation.
**Check:** grep forbids `find/updateOne/deleteOne/aggregate(req.…)` patterns; rest is review.

### SEC-04 · Secrets
`.env` is never committed; `.env.example` stays current. In application source (`server/src`),
`process.env` is read only in `server/src/infra/config/`; test files may read env for wiring
(e.g. `MONGO_URI` skip guards). Agents never print, log, or commit secret values.
**Check:** grep (`.gitignore` must ignore `.env`; `process.env` confined) + gitleaks in CI.
Agent clause: review.

### DATA-01 · Deletes
Hard delete is the default. Soft delete only for entities whose feature needs restore/history,
and then via `mongoose-delete` plugin (automatic query scoping) — never a hand-rolled
`deletedAt` filter that every query must remember.
**Check:** review.

### LOG-01 · Observability
Every request is logged as one JSON line with duration (`requestLogger` middleware).
Stack traces and internal error details go to server logs only; clients get
`{error}` with a generic message on 500.
**Check:** grep asserts `requestLogger` and `errorHandler` are mounted in `server.ts`; rest is review.

---

## Layer 2 — Architecture

### ARCH-01 · Layer boundaries
`interface → usecase → domain ← infra`. Domain imports nothing from other layers and owns
the repository ports. Usecases receive repositories as arguments — no DI container.
**Check:** grep (static, barrel, and dynamic imports) in `check-constitution.sh`.

### ARCH-02 · Error handling
Business failures throw `DomainError` → middleware maps to 400 `{error}`. Everything else → 500
with a generic message. No stack traces to clients (see LOG-01).
**Check:** the mapping lives in one place (`interface/http/middleware.ts`); review confirms
new code throws `DomainError` instead of ad-hoc status codes.

### ARCH-03 · API contract
Any endpoint change updates the API contract (`docs/api/` OpenAPI or shared types) **in the
same PR**, reviewed like code. No pre-approval gate, no CI spec-matcher — that tooling doesn't
exist for Express and a dead gate is worse than an honest review step.
**Check:** review (PR checklist item).

---

## Layer 3 — Engineering standards

### STD-01 · TypeScript
Strict mode pinned in both workspaces. No `any` (use `unknown` + narrowing).
**Check:** grep pins `"strict": true` in both tsconfigs; grep forbids `: any` / `as any`;
`tsc --noEmit` runs in CI for both workspaces.

### STD-02 · Testing
- `tests/unit/` — domain + usecase, no DB, no network, in-memory repos.
- `tests/integration/` — infra against real Mongo (docker compose / CI service).
- One e2e happy-path script once the demo UI stabilizes — it doubles as defense rehearsal.
- No coverage percentage. A coverage bar makes teams write coverage-chasing tests;
  the gate is: every acceptance criterion in a SPEC has a test.

**Check:** CI runs unit tests in a job with NO Mongo service and no `MONGO_URI` — a "unit"
test that touches the DB fails there by construction. Integration runs in a separate job.
Definition of Done = `npm run check` green.

### STD-03 · Git
Branches: `spec/{name}` (spec discussion), `agent/{name}` (agent implementation), `fix/{issue}`.
Conventional Commits (`feat|fix|docs|spec|chore`). PRs: minimum 1 reviewer, no self-approval,
CI green before merge.
**Check:** GitHub branch protection on `main` (required checks + 1 approval — configure once
in repo settings; self-approval is impossible natively). Branch names: review.

---

## Process

### Review gates
| Gate | What | Who |
|------|------|-----|
| L1 | Tests + typecheck pass | CI |
| L2 | Code matches its SPEC acceptance criteria | reviewer |
| L3 | Constitution: SEC/ARCH/STD machine rules | CI (`check-constitution.sh`) |
| L4 | Review-only rules (SEC-03 rest, DATA-01, ARCH-02/03) + short demo | reviewer |

CI does not check L2 and L4 — claiming otherwise trains reviewers to skip them.

### Deployment
Local: `docker compose up -d` + `npm run dev`. One demo instance auto-deploys from `main`.
Freeze `main` 48h before the defense; emergencies go through `git revert`, not hotfixes.

### Defense readiness
- `npm run seed` rebuilds a demo database in one command, on any machine. Keep it working.
- Record a backup demo video before defense week.
- **No agent-written PR merges unless the merging human can explain every line.** GVHD grills
  individuals on "their" code; "the agent wrote it" is a failing answer.

### Amendment
This file changes by PR with 3/5 team approval, and **every new rule ships its machine check
in the same PR** (or is explicitly labeled `review`). Team lead arbitrates day-to-day disputes;
GVHD is the escalation tiebreaker.

---

## AI Agent Policy

**Allowed without asking:** read/write `server/src`, `client/src`, `tests`, `docs`, `.sdd/specs`;
run npm scripts, vitest, tsc; commit on `agent/*` branches.

**Human confirmation required:** deleting files; editing this file; pushing to `main`;
adding dependencies (`package.json`); schema changes (`server/src/infra/db/**`); anything touching `.env*`.

**Must:** never print or commit secret values; report edge cases not covered by the SPEC
instead of guessing; update the feature's `TASKS.md` as tasks complete.
