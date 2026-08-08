# MERN Template

Express 5 + Mongoose + React 19 (Vite) + TypeScript, npm workspaces (`server/`, `client/`).

## Commands

```bash
cp .env.example .env        # required — server fail-fasts without it
docker compose up -d        # Mongo
npm install
npm run dev                 # server :3000 + client :5173 (proxies /api)
npm run check               # constitution check + typecheck + tests
npm test                    # unit always; integration only when MONGO_URI is set
```

## Architecture — 4 layers, arrows point at domain

`interface → usecase → domain ← infra`

- `server/src/domain/` — entities, validation, repository interfaces (ports). Imports nothing from other layers. Never logs, never touches env/DB/HTTP.
- `server/src/usecase/` — business flows. Depends on domain only; receives repos as arguments.
- `server/src/interface/http/` — Express routes + middleware (request logging, error handling). Translates HTTP ↔ usecase calls; no business logic here.
- `server/src/infra/` — config, Mongo repositories. Implements domain ports.

## Hard rules (CI-enforced, see .sdd/constitution.md for the full list + agent policy)

- `process.env` is read ONLY in `server/src/infra/config/`. Everything else receives typed `Config`.
- `domain/` never imports from `usecase/`, `interface/`, or `infra/`; `usecase/` never from `interface/` or `infra/`.
- Never pass raw `req.body`/`req.query` into a Mongoose query — validate with zod or a domain factory first (NoSQL injection).
- No `any` in source; strict mode is pinned in both tsconfigs.
- Never print, log, or commit secret values; `.env` stays git-ignored.
- Config is validated with zod at boot; invalid env = `process.exit(1)`.
- Errors: throw `DomainError` for business failures → middleware maps to 400; everything else → 500.
- Unit tests (`tests/unit/`) must run with no DB and no network — CI runs them in a job with no Mongo.

## Process

- New feature: copy `.sdd/specs/_template.md` into `.sdd/specs/feat-{name}/SPEC.md` + `TASKS.md` before coding. See `feat-users/` for a worked example.
- Architecture decisions go in `.sdd/rfcs/ADR-NNN-*.md` — write-once, never edit history.
- Tests: `tests/unit/` (no DB, no network — in-memory repos), `tests/integration/` (real Mongo, skipped without `MONGO_URI`).
