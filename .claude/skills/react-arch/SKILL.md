---
name: react-arch
description: Architecture rules for this project's React frontend — plain fetch, native React state, Tailwind v4 + cn(), npm workspaces. No router or state library is installed; add one only when the growth trigger below actually fires.
user-invocable: true
triggers:
  - working on React components or pages in client/src
  - adding a fetch call to the backend
  - applying color or conditional-class styling in client/src
  - deciding whether to add a router or a state library
---

You are the frontend architecture guardian for this project. Load and enforce these rules before any implementation begins.

## Stack

- **React 19** + TypeScript, built with **Vite** (`client/`, one of two npm workspaces alongside `server/`).
- No router — the app is a single page (`App.tsx`).
- No state library — local component state (`useState`/`useReducer`) is enough at this size.
- No HTTP client library — native `fetch`, called against `/api/v1/...` (Vite dev-proxies `/api` to the server).
- **Tailwind v4**, CSS-first (`@tailwindcss/vite` plugin, no `tailwind.config.*`). Color tokens are declared in `client/src/index.css` inside `@theme` as `--color-<name>-app`, which generates the `<name>-app` utilities (`bg-danger-app`, `text-danger-app`, …).
- `cn()` at `client/src/utils/cn.ts` — `twMerge(clsx(inputs))` — for any conditional class.
- `@/` path alias configured (`client/tsconfig.json` `paths`, `client/vite.config.ts` `resolve.alias`) → `client/src/*`.

Do not add react-router, Redux/Zustand/Valtio, or axios speculatively. Each has a concrete trigger below; add it — and update this skill — when the trigger actually fires, not before.

## Folder Structure

Current:

```
client/src/
  main.tsx     # entry point, mounts App
  App.tsx      # the entire UI today (the app's one page — no pages/ folder yet, no router)
  index.css    # Tailwind import + @theme color tokens (only place hex/named colors are allowed)
  utils/
    cn.ts      # twMerge(clsx(inputs)) — use for every conditional className
  components/
    ui/
      button/AppButton.tsx
      card/AppCard.tsx
      input/AppInput.tsx
      empty-state/AppEmptyState.tsx
    # custom/ and layout/ — not created yet, see decision table below
```

Full folder decision table (some rows have no folder yet — create on first use):

| Folder | What goes here |
|---|---|
| `src/components/ui/<group>/App<Name>.tsx` | Atomic, generic UI primitives. No business logic. Grouped by functional category (`ui/button/AppButton.tsx`, `ui/input/AppInput.tsx`, …). |
| `src/components/custom/` | Cross-page custom components. Non-atomic, domain-aware. |
| `src/components/layout/` | Structural layout wrappers (Navbar, BottomNav, AuthLayout). |
| `src/pages/<name>/` | Sub-components used by exactly one page (once a router exists). |
| `hooks/use<Name>.ts` | Stateful logic needed in 2+ components. |
| `services/<domain>.ts` | A fetch call needed in 2+ places, or a single file doing 2+ endpoints' worth of fetching. |

Decision tree for a new component:

1. Used by exactly 1 page → stays inline in that page/caller (or `src/pages/<name>/PascalCase.tsx` once a router + multi-page structure exists).
2. Used by 2+ callers + atomic/primitive → `src/components/ui/<group>/App<Name>.tsx`.
3. Used by 2+ callers + non-atomic/domain-aware → `src/components/custom/`.
4. Layout/navigation shell → `src/components/layout/`.

## Component Rules

1. One component per file, `PascalCase.tsx`, named export only (no default exports).
2. UI primitives under `components/ui/` are prefixed `App` (`AppButton`, `AppInput`, `AppCard`, `AppEmptyState`, …); `components/custom/` and `components/layout/` components are not prefixed.
3. Props interface in the same file, directly above the component (`interface` for object shapes; `type` for unions/primitives/utility types). Types are co-located with the file that owns them — no `src/types/` folder.
4. Before adding a new component, check `src/components/ui/`, `src/components/custom/`, and `src/components/layout/` for one to extend instead.
5. Single-use UI stays inline in its caller — don't pre-split into `components/` for a single use site.
6. No barrel files (no `index.ts` re-exports) — import directly from the file path: `import { AppButton } from "@/components/ui/button/AppButton"`.

## Fetch / Service Rules

1. Use native `fetch`. No axios — nothing here needs interceptors, auth refresh, or request cancellation beyond `AbortController`.
2. One call site (today, `App.tsx`) → call `fetch` inline. Don't build a wrapper layer nobody needs yet.
3. Second call site for the same domain → extract to `services/<domain>.ts`: one exported async function per endpoint, typed request/response.
4. Server envelope (`server/src/interface/http/response.ts`) — type against it, don't invent an ad hoc shape:
   - success: `{ statusCode, message, data, timestamp }`
   - error: `{ statusCode, error, message, details?, timestamp, path }`
5. Always check `res.ok` before reading the body. Error bodies aren't guaranteed to be JSON (proxy errors, HTML 404s) — use `res.json().catch(() => null)` on the error path.
6. Abort a request that a newer action makes stale, with `AbortController` — `useEffect` cleanup for unmount, or `.abort()` right before firing the request that supersedes it. See the existing pattern in `App.tsx`.

## Error & Loading Rules

1. Every async call gets explicit error/loading state — no silent failures.
2. Plain `try`/`catch` or `.catch()`. No error-handling library is installed; don't add one (`neverthrow`, etc.) for this template's needs.
3. Surface errors inline in the component, as `App.tsx` already does. Don't add a toast library until an actual cross-cutting notification need shows up.

## Styling Rules

1. Tailwind utility classes on elements — this is the default way to style. Only fall back to inline `style` when Tailwind genuinely can't express the value (see `App.tsx`'s `max-w-[480px]` vs. an arbitrary non-color value that has no utility).
2. No hardcoded hex/named colors anywhere in `.ts`/`.tsx` — ESLint-enforced (`eslint.config.mjs`), and this also catches Tailwind arbitrary-value colors like `text-[#dc143c]`. Add the token to the `@theme` block in `client/src/index.css` as `--color-<name>-app`, then use the generated utility (`bg-<name>-app`, `text-<name>-app`, `border-<name>-app`, …). Tailwind's own palette classes (`bg-gray-800`, `text-white`, …) are not hardcoded colors and are fine.
3. No template literal in `className` — ESLint-enforced. Default class is the base string; a condition only *adds* an override class for the exception, never toggles two opposite classes — always through `cn()`:
   ```tsx
   className={cn("rounded bg-gray-800 px-3 py-1 text-white", { "opacity-50": pending })}
   ```
4. `cn()` lives at `client/src/utils/cn.ts` (`twMerge(clsx(inputs))`) — import it, never re-implement it. `tailwind-merge` matters here: it resolves conflicting Tailwind utilities between the base and the override (e.g. a base `px-2` and an override `px-4`) in favor of the later one, which plain string concatenation can't do.
5. No CSS-in-JS, no CSS Modules — Tailwind utilities cover styling needs at this size. Global tokens and the Tailwind `@import` live in `index.css`; nothing else goes there.

## Import Conventions

- `@/` alias for anything under `client/src/` (`@/components/...`, `@/utils/cn`, …). Relative imports (`./`, `../`) only for files in the same folder.
- No barrel files — always import the exact file, never a folder `index.ts` re-export.
- Group imports: React → third-party → `@/` alias.

## Routing & State — Not Yet In This Project

- Router: add `react-router` (small, standard) when a second page is actually needed. Don't reach for anything heavier without a concrete reason.
- State: `useState`/`useReducer`/`Context` cover this template. Add a state library only once prop-drilling is a real, demonstrated pain in this codebase — not preemptively.

## Pre-Implementation Checklist

- [ ] Checked `src/components/ui/`, `src/components/custom/`, `src/components/layout/` for a reusable component before writing a new one
- [ ] Placed via the decision tree (single-page-use inline, `ui/` for 2+ atomic, `custom/` for 2+ domain-aware, `layout/` for shell)
- [ ] `App` prefix on `ui/` primitives only; no barrel files; named export
- [ ] Single-use UI stays inline, not pre-split into its own file
- [ ] Fetch calls check `res.ok` and handle non-JSON error bodies
- [ ] Loading and error states handled explicitly
- [ ] No hardcoded colors — token declared in `index.css`'s `@theme` as `--color-<name>-app`, consumed via the generated Tailwind utility
- [ ] No template literals in `className` — `cn()` used for any conditional class
- [ ] No new dependency (router, state lib, HTTP client) added without a current, real need
