# Developer Onboarding

## Prerequisites

- Node.js 22+ (backend CI/deploy uses Node 22; local dev has been used with 24.x too).
- A PostgreSQL database to point `DATABASE_URL` at. The simplest path is a free
  [Neon](https://neon.tech) database — this project already uses Neon in production. A local
  Postgres works too.

## First-time setup

```bash
git clone <repo-url>
cd digital-school

cd backend
npm install
cp .env.example .env
# edit .env: set DATABASE_URL to your database, JWT_SECRET to any long random string
npx prisma migrate dev     # creates all tables
npx tsx prisma/seed.ts     # optional — seeds a demo school with real accounts
npm run dev                # http://localhost:5000

# new terminal
cd frontend
npm install
npm run dev                # http://localhost:5173 — proxies API calls to localhost:5000 by default
```

Open `http://localhost:5173`. Either:
- Log in with a seeded account (`backend/prisma/seed.ts` prints the shared password for every
  seeded account on `npx tsx prisma/seed.ts`), or
- Click **Try Demo** on the login page — this never touches the backend, so it works even
  without running `backend/` at all.

## Running the checks before pushing

```bash
# Backend
cd backend
npm run lint && npm run build && npm run test

# Frontend
cd frontend
npm run lint && npm run build && npm run test
npm run test:e2e   # spins up the frontend dev server automatically; Demo Mode only, no backend needed
```

CI (`.github/workflows/ci.yml`) runs the same lint/build/test steps for both projects on every
push and PR to `main` and fails the build on any error.

## Where to look first

- **Adding a new CRUD domain?** Copy the shape of an existing one — e.g. `library.routes.ts` /
  `library.controller.ts` / `library.service.ts` is a clean, complete example (categories,
  authors, a main entity with quantity tracking, and a transactional issue/return workflow).
- **Adding a new page?** Find the closest existing page under `frontend/src/pages/<role>/` and
  match its structure — demo-mode gating (`if (!isDemoMode)`), the `Card`/`Modal`/`Button`
  primitives from `components/common/`, and the `*Api.ts` service pattern are all established
  conventions, not per-page inventions.
- **Adding a new AI feature?** Reuse `aiService.sendMessage` (don't touch the provider
  abstraction) — add a persona builder in `ai/prompts.ts`, a context-assembly function in
  `aiFeatures.service.ts`, and a route in `ai.routes.ts`. On the frontend, reuse
  `components/ai/AIChatPanel.tsx` rather than building another chat UI.
- **Confused about an existing endpoint's contract?** `GET /docs` (once the backend is running)
  serves the full OpenAPI/Swagger UI.

## Common gotchas

- **User.id vs. role-profile id**: see [`ARCHITECTURE.md`](ARCHITECTURE.md#the-public-api-is-keyed-by-userid-convention).
  This is the most common source of a runtime (not compile-time) bug in this codebase.
- **Prisma model name casing**: a model named `AIConversation` maps to `prisma.aIConversation`
  (Prisma lowercases the *leading acronym run minus its last letter*), not `prisma.aiConversation`
  — TypeScript will tell you the correct name if you get it wrong, but it's a genuinely
  surprising rule the first time.
- **`react-hooks/set-state-in-effect` / `react-hooks/purity` ESLint rules**: this repo's
  `eslint-plugin-react-hooks` flags synchronous `setState` calls inside `useEffect` bodies. A
  `.then()`/`.catch()` callback inside the effect is fine (async, not synchronous-in-effect); a
  direct `setState()` call in the effect's own body needs either restructuring or a targeted
  `// eslint-disable-next-line react-hooks/set-state-in-effect -- <why>` comment.
- **Vercel deploy directory**: run `vercel deploy --prod` from the repository root, not from
  inside `backend/` or `frontend/` — see [`DEPLOYMENT.md`](DEPLOYMENT.md).
- **No staging database**: `prisma migrate dev` applies straight to the live database (see
  [`DATABASE.md`](DATABASE.md#migrations)). Prefer additive, backward-compatible migrations.
