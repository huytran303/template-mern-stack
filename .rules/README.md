# Rules

Single source of truth for this project's rules. Agents and contributors read from here —
nothing outside this folder holds rule content, only pointers to it.

| File | What it covers | Read it when |
|---|---|---|
| [architecture.md](architecture.md) | The 4 layers, what/why/when per folder, rules of thumb | Deciding *where* code goes |
| [backend.md](backend.md) | The constitution: security, layer boundaries, response contract, TypeScript/testing/git standards, review gates, AI agent policy | Any `server/` work |
| [frontend.md](frontend.md) | React stack, folder structure, component/fetch/styling rules, theme & locale safety, pre-implementation checklist | Any `client/` work |

Pointers elsewhere (no content, safe to ignore once you're here):
`CLAUDE.md` (root summary + which file to read when), `README.md` (→ `architecture.md`).

A new agent tool needs no per-tool config file — point it at this folder.

Per-folder `README.md` (one in every folder under `client/src/`, `server/src/`,
`server/tests/`) holds no rules — it answers a single question: *does this code belong
here?* Read the target folder's README before writing a file into it; if what you're
writing doesn't match, the code is in the wrong folder — relocate it rather than widen the
README. New folder → its README ships in the same PR.

Amending: `backend.md` changes by PR with team approval, and every new mechanical rule ships
its check in `scripts/check-constitution.sh` in the same PR (see backend.md §Amendment).
