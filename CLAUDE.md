# MERN Template

Express 5 + Mongoose + React 19 (Vite) + TypeScript, npm workspaces (`server/`, `client/`).

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

- `server/src/domain/` — entities, validation, repository interfaces (ports). Imports nothing from other layers. Never logs, never touches env/DB/HTTP.
- `server/src/usecase/` — business flows. Depends on domain only; receives repos as arguments.
- `server/src/interface/http/` — Express routes + middleware (request logging, error handling). Translates HTTP ↔ usecase calls; no business logic here.
- `server/src/infra/` — config, Mongo repositories. Implements domain ports.

## Hard rules (see .sdd/constitution.md for the full list + agent policy; mechanical rules are CI-checked, the rest are review gates — the constitution marks which is which)

- `process.env` is read ONLY in `server/src/infra/config/`. Everything else receives typed `Config`.
- `domain/` never imports from `usecase/`, `interface/`, or `infra/`; `usecase/` never from `interface/` or `infra/`.
- Never pass raw `req.body`/`req.query` into a Mongoose query — validate with zod or a domain factory first (NoSQL injection).
- No `any` in source; strict mode is pinned in both tsconfigs.
- Never print, log, or commit secret values; `.env` stays git-ignored.
- Config is validated with zod at boot; invalid env = `process.exit(1)`.
- Response contract: every response goes through `interface/http/response.ts` — `ok(res, data, status?)` for success (`{ statusCode, message, data, timestamp }`), `fail(res, req, status, error, message, details?)` for errors (`{ statusCode, error, message, details?, timestamp, path }`). Never call `res.json()` directly in a route.
- Errors: throw `DomainError(message, kind, details?)` for business failures → middleware maps kind to status (`validation` → 400, `conflict` → 409, `not_found` → 404); everything else → 500 with a generic message.
- Unit tests (`tests/unit/`) must run with no DB and no network — CI runs them in a job with no Mongo.
- Client: never hardcode colors (hex or named) in TS/TSX — define tokens in `client/src/index.css` and reference them with `var(--…)`. ESLint bans hex literals in `client/src/`.
- Client conditional styling: CSS-override pattern — the default state is the base class/style; conditions only ADD an override class for the exception state (never toggle two opposite classes on `cond` / `!cond`). No template literals in `className` (ESLint-banned) — use a `cn(base, { override: condition })` helper. Tailwind v4 projects: no `tailwind.config`, tokens live in the global CSS as `--color-[name]-app` → use `text-[name]-app`; arbitrary values like `text-[#hex]` are banned.
- Client clickable elements get `cursor: pointer` automatically from a global rule in `client/src/index.css` (`button`, `a[href]`, `[role="button"]`) — don't add `cursor-pointer` per component. A custom non-native clickable element (e.g. a `div` with `onClick`) must get `role="button"` to pick up the same rule.
- Client theme (dark mode via `.dark` class on `<html>`, see `client/src/index.css`): any new color that sits on a themed surface (text, borders, muted/secondary content) must be a `--color-<name>-app` token with both a light default in `@theme` and a `:root.dark` override — a bare Tailwind palette class (`text-white`, `bg-gray-800`, `border-gray-300`, …) only belongs on something deliberately identical in both themes (e.g. white button text on a fixed-color primary background), never on page/card surfaces.
- Client locale (`client/src/i18n.ts`, `STRINGS[locale]`): any layout holding a translated string must survive the longest of the `en`/`vi` renderings — no `whitespace-nowrap` on translatable text, no fixed pixel width wrapping a translatable label, and `flex-wrap` on any row of buttons/pills/labels that includes one (see the header and demo rows in `App.tsx`).

## Process

- If anything about a task is ambiguous (requirements, scope, which rule applies), ask the user directly — never guess.
- New feature: copy `.sdd/specs/_template.md` into `.sdd/specs/feat-{name}/SPEC.md` + `TASKS.md` before coding. See `feat-users/` for a worked example.
- Architecture decisions go in `.sdd/rfcs/ADR-NNN-*.md` — write-once, never edit history.
- Tests: `tests/unit/` (no DB, no network — in-memory repos), `tests/integration/` (real Mongo, skipped without `MONGO_URI`).
