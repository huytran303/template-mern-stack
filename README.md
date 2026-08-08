# MERN Template

Express 5 + Mongoose + React 19 (Vite) + TypeScript. Clean architecture, typed fail-fast
config, request logging middleware, CI-enforced layer rules.

## Quickstart

```bash
cp .env.example .env
docker compose up -d     # Mongo
npm install
npm run dev              # API :3000, client :5173
```

## Verify

```bash
npm run check            # constitution + typecheck + tests
```

## Layout

```
server/src/domain/      entities, validation, ports — imports nothing
server/src/usecase/     business flows
server/src/interface/   Express routes + middleware (logging, errors)
server/src/infra/       zod config (fail-fast), Mongo repositories
server/tests/           unit (no DB) / integration (real Mongo)
client/                 React + Vite, proxies /api
.sdd/                   constitution, specs, ADRs — see CLAUDE.md
```
