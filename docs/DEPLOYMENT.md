# Deployment Guide

Both apps deploy to Vercel as separate projects from one monorepo; the database is Neon
PostgreSQL (external, not managed by Vercel).

## One-time setup (already done for this project — reference only)

1. Create two Vercel projects linked to this repo: `backend` (root directory `backend/`) and
   `frontend` (root directory `frontend/`).
2. Backend env vars (Vercel dashboard → backend project → Settings → Environment Variables):
   `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (the frontend's production URL) at minimum — see
   [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md) for the full list.
3. Frontend env var: `VITE_API_URL` set to the backend's production URL.
4. Neon Postgres: a single database, connected via `DATABASE_URL`. No separate staging database
   exists — `prisma migrate dev` run locally applies directly to it (see the migration workflow
   below; this is a real constraint on how changes are tested, noted in
   [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md)).

## Routine deployment

```bash
# From the repository root (not from inside backend/ or frontend/):

# Backend
cd backend
npm run build && npm run lint && npm run test   # must all pass first
cd ..
npx vercel deploy --prod

# Frontend
cd frontend
npm run lint && npm run build && npm run test
cd ..
npx vercel deploy --prod
```

`vercel deploy --prod` run from the repo root resolves the correct project via each project's
configured root directory — running it from inside `backend/` or `frontend/` fails.

## Database migrations

Migrations are applied directly against the live Neon database (there is no separate migration
step in the Vercel build — Prisma Client is generated at build time via `postinstall`, but
schema changes must be applied before deploying code that depends on them):

```bash
cd backend
npx prisma migrate dev --name descriptive_name   # creates + applies in one step
# or, to review the SQL before applying:
npx prisma migrate dev --name descriptive_name --create-only
# edit prisma/migrations/<timestamp>_descriptive_name/migration.sql, then:
npx prisma migrate dev
```

Because there's no staging database, **always deploy the migration before deploying code that
requires it**, and prefer additive/backward-compatible schema changes (new nullable columns, new
tables) over changes that would break the currently-deployed backend mid-rollout.

## Verifying a deployment

```bash
curl https://<backend-url>/health          # {"status":"ok"}
curl https://<backend-url>/health/ready    # {"status":"ready","database":"connected"}
curl https://<backend-url>/version         # version, commit, environment
```

Then exercise a real flow: log in with a seeded account, confirm the response sets
`edudigital_token`/`edudigital_refresh`/`edudigital_csrf` cookies, and hit one authenticated,
one AI, and one state-changing (CSRF-protected) endpoint. See
[`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) for the full verification checklist.

## Rollback

Vercel keeps every deployment; promote a previous one from the dashboard or via
`vercel rollback <deployment-url>`. Database migrations are **not** automatically reversible —
there is no down-migration tooling in place, so a schema rollback requires a hand-written
compensating migration (see "Known gaps" in `PRODUCTION_CHECKLIST.md`).
