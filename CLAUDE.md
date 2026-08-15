# MERN Template

Express 5 + Mongoose + React 19 (Vite) + TypeScript, npm workspaces (`server/`, `client/`).

## Rules live in `.rules/` — read them before writing code

All project rules are in **one folder**. Nothing outside `.rules/` holds rule content.

| Read this | Before |
|---|---|
| `.rules/architecture.md` | deciding *where* code goes |
| `.rules/backend.md` | any `server/` work (security, layers, response contract, TS/testing/git standards, AI agent policy) |
| `.rules/frontend.md` | any `client/` work (components, fetch/React Query, styling, theme & locale) |

Index + amendment process: `.rules/README.md`.

**Before creating or editing a file in a folder, read that folder's own `README.md`** — it
states what belongs there. Every folder under `client/src/`, `server/src/`, and
`server/tests/` has one. If the code you're about to write doesn't match the description,
it belongs somewhere else: find the right folder (`.rules/architecture.md` for the server,
the decision tree in `.rules/frontend.md` for the client) instead of widening the
description to fit. A new folder ships its `README.md` in the same PR.

## Commands

```bash
cp .env.example .env        # required — server fail-fasts without it
docker compose up -d        # Mongo
npm install
npm run dev                 # server :3000 + client :5173 (proxies /api)
                            # routes under /api/v1; OpenAPI docs at :3000/docs
npm run check               # constitution check + lint + typecheck + tests
npm run lint                # eslint, server + client in parallel
npm test                    # unit always; integration when MONGO_URI is set (auto-loaded from .env)
```

## Architecture — 4 layers, arrows point at domain

`interface → usecase → domain ← infra`

Full what/why/when per layer: `.rules/architecture.md`.

## Process

- If anything about a task is ambiguous (requirements, scope, which rule applies), ask the user directly — never guess.
- New feature: copy `.sdd/specs/_template.md` into `.sdd/specs/feat-{name}/SPEC.md` + `TASKS.md` before coding. See `feat-users/` for a worked example.
- Architecture decisions go in `.sdd/rfcs/ADR-NNN-*.md` — write-once, never edit history.
