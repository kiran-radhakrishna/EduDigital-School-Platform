# EduDigital — School Digitalization Platform

A production school-management platform: authentication, academic operations (attendance,
assignments, grades, timetable), school administration (library, inventory, staff/HR, fees,
transport), notifications, wellbeing tracking, analytics, and role-aware AI features (tutor,
homework assistant, study planner, career advisor, and staff/parent/admin AI assistants).

- **Frontend**: React 19 + TypeScript + Vite, TailwindCSS, deployed to Vercel.
- **Backend**: Express + TypeScript + Prisma, deployed to Vercel as a serverless function.
- **Database**: PostgreSQL (Neon, serverless).
- **AI**: pluggable provider abstraction (OpenAI today; Claude/Gemini/Ollama/Azure OpenAI are
  drop-in additions — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#ai-provider-abstraction)).

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how it's built, [`docs/ONBOARDING.md`](docs/ONBOARDING.md)
to get running locally, [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) to deploy, and
[`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md) for every configuration value.

## Quick start

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET at minimum
npx prisma migrate dev
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Log in with a seeded account (see `backend/prisma/seed.ts`), or use the **Try Demo** button on
the login page — Demo Mode runs entirely client-side and never touches the backend or database.

## Scripts

| | Frontend | Backend |
|---|---|---|
| Dev server | `npm run dev` | `npm run dev` |
| Lint | `npm run lint` | `npm run lint` |
| Build | `npm run build` | `npm run build` |
| Unit/component tests | `npm run test` | `npm run test` |
| E2E tests | `npm run test:e2e` | — |
| API docs | — | `GET /docs` (Swagger UI) once the backend is running |

## Repository layout

```
backend/
  src/
    routes/, controllers/, services/   — one triplet per domain (Express → validation → Prisma)
    ai/                                — provider abstraction (types, providers, factory, prompts)
    middleware/                        — auth, rate limiting, CSRF, request context
    utils/                             — jwt, tokens, password hashing, logger, error classes
  prisma/schema.prisma                 — full DB schema
  e2e is not here — see frontend/e2e/  (Demo Mode drives the UI, so it lives with the UI)
frontend/
  src/
    pages/, components/                — by role (student/, teacher/, parent/, admin/) + common/
    services/                          — one *Api.ts per backend domain, thin axios wrappers
    context/, hooks/                   — auth, wellbeing, parent, events, language, theme
  e2e/                                 — Playwright specs (Demo Mode only, no backend required)
docs/                                  — architecture, deployment, environment vars, DB schema,
                                          onboarding, production checklist
```

## Production readiness

See [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md) for what's implemented
(security, monitoring, testing, CI/CD) and what remains as known technical debt.
