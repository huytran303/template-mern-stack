# SPEC: feat-users

## Problem
The template needs one end-to-end worked example: register and list users.

## Behavior
- `POST /api/v1/users` `{email, name}` → 201 + user. Email normalized (trim, lowercase), max 254 chars.
- `GET /api/v1/users?limit=` → 200, newest first, at most `limit` (default 20, max 100).
- Invalid email / name / limit → 400 `{error}`; duplicate email → 409 `{error}`.
- Unexpected failure → 500 `{error: "internal server error"}`.

## Acceptance criteria
- [x] Register with valid data creates user with normalized email
- [x] Invalid email rejected with DomainError
- [x] Duplicate email rejected
- [x] Mongo repository round-trips a user (integration)

## Out of scope
Auth, cursor pagination (list is limit-capped only), update/delete.

## Changelog
- v1.1.0 (2026-08-09) — list capped with validated `limit`; duplicate email → 409; email length cap
- v1.0.1 (2026-08-09) — paths updated to `/api/v1` (drifted when commit 11ba482 moved the routes)
- v1.0.0 (2026-08-08) — initial, ships with template
