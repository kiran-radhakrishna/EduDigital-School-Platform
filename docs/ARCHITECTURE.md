# Architecture

## Backend

Express + TypeScript + Prisma, deployed to Vercel as a single serverless function
(`backend/api/index.ts` wraps `createApp()`; `backend/vercel.json` rewrites every path to it).

**Layering**, one triplet per domain under `src/routes/`, `src/controllers/`, `src/services/`:

```
routes/*.ts        Router + middleware wiring (authenticate, authorize, rate limits) only
controllers/*.ts    Zod validation (parseOrThrow) → calls one service function → shapes the response
services/*.ts        All Prisma access. No Express types leak in here.
```

Cross-cutting middleware (`src/middleware/`) runs in `app.ts` in this order: `helmet` (security
headers) → `cors` → `express.json` → `cookieParser` → `requestContext` (request IDs + request
logging) → `generalRateLimit` → `csrfProtection` → routers → error handler.

Errors are plain classes (`AppError` and subclasses `NotFoundError`, `ForbiddenError`,
`ConflictError`, `AuthError` in `utils/errors.ts`) carrying a `statusCode`; `asyncHandler` catches
rejected promises and forwards them to the single error-handling middleware in `app.ts`, which
returns `{ error: message }` and **never** leaks a stack trace to the client — 5xx errors are
logged server-side (with the request id) via `utils/logger.ts` instead.

### The "public API is keyed by User.id" convention

Every role (Student, Teacher, Parent, Authority, Administrator) has its own Prisma row with its
own internal id, related 1:1 to a `User` row. The API only ever accepts/returns `User.id` —
never the internal `Student.id` etc. `services/resolvers.ts` provides `resolveStudentId`,
`resolveTeacherId`, `resolveParentId` to translate at the service boundary, plus
`isParentOfStudent` / `isTeacherAssignedToClass` for ownership checks reused across controllers.
**Violating this (accepting an internal id where a `User.id` is expected) is the single most
common bug class in this codebase** — it type-checks fine and fails at runtime as a Prisma FK
violation. Always resolve at the top of the service function, not deeper in the call chain.

### Sessions

Short-lived JWT access token (`ACCESS_TOKEN_TTL_SECONDS`, default 2h) in an httpOnly cookie,
paired with an opaque, hashed, rotating refresh token (`RefreshToken` table,
`REFRESH_TOKEN_TTL_SECONDS`, default 30 days) scoped to `/auth` only. `POST /auth/refresh`
validates + revokes the presented refresh token and issues a new pair (rotation — reuse of an
already-rotated token fails). `session.service.ts` owns issuance/rotation/revocation;
`auth.controller.ts` is the only caller. Logout and password reset both revoke sessions.

### CSRF

Cookies are `SameSite=None; Secure` in production (frontend and backend are different Vercel
origins), which removes SameSite's built-in CSRF protection. `middleware/csrf.ts` implements a
double-submit check: a non-httpOnly `edudigital_csrf` cookie is set alongside login/register/
refresh, and every state-changing request from a cookie-authenticated session must echo it back
as an `X-CSRF-Token` header (the frontend's `apiClient.ts` request interceptor does this
automatically). Only enforced when an auth cookie is present — nothing to forge otherwise, and
login/register (which establish that cookie) are exempt by construction.

### AI provider abstraction

```
AIProvider (interface, src/ai/types.ts)
  ↓
OpenAIProvider / MockProvider (src/ai/providers/*.ts)
  ↓
providerFactory.ts   — name → instance, selected by env.aiProvider ('mock' default, 'openai')
  ↓
ai.service.ts         — sendMessage(): persists AIConversation/AIMessage/AIUsage, calls the provider
  ↓
aiFeatures.service.ts — per-feature context assembly (real attendance/grades/wellbeing data) +
                         persona prompts (src/ai/prompts.ts), then delegates to ai.service.sendMessage
  ↓
controllers, routes (/ai/*)
```

Adding a new backend (Claude, Gemini, Ollama, Azure OpenAI) means implementing `AIProvider` and
registering it in `providerFactory.ts` — no other file changes. **`AI_PROVIDER` defaults to
`mock`**, so the app never calls an external AI service unless explicitly configured with an API
key. This is also why Demo Mode is safe by construction (see below): even if it somehow reached
a real AI endpoint, the default provider does no network I/O.

### Monitoring

- `GET /health` — liveness only (process is up).
- `GET /health/ready` — readiness (runs `SELECT 1` against the database).
- `GET /version` — build version, git commit SHA (`VERCEL_GIT_COMMIT_SHA`), environment.
- Every response carries an `X-Request-Id` header; `utils/logger.ts` emits structured
  (JSON-lines) `info`/`warn`/`error` logs correlated by that id, including one line per request
  (method, path, status, duration) from `middleware/requestContext.ts`.

## Frontend

React 19 + TypeScript + Vite + TailwindCSS. Route-level code splitting throughout (`React.lazy`
in `App.tsx` for essentially every page) — only the landing/auth pages are eager, so first paint
never waits on the rest of the app.

- `services/*Api.ts` — one thin file per backend domain, typed axios wrappers around `apiClient`.
- `services/apiClient.ts` — the shared axios instance: attaches the CSRF header to state-changing
  requests, and silently retries once via `POST /auth/refresh` on a 401 before giving up.
- `context/` + `hooks/` — `AuthContext`/`useAuth` (session, demo mode), `WellbeingContext`,
  `ParentContext` (child selector state), `EventsContext`, plus theme/language.
- `components/common/` — shared primitives (Button, Card, Modal, ConfirmDialog, Badge, Input,
  StatCard, UserPicker, Avatar, ProgressBar) reused across every domain page.
- `components/ai/AIChatPanel.tsx` — the one shared chat UI (message list, typing indicator,
  suggested-prompt chips, input bar) reused by every AI feature (Tutor, Homework Assistant,
  Career Advisor, Teacher/Parent/Admin AI) rather than copy-pasted six times.

### Demo Mode

`isDemoMode` (from `useAuth()`) is true exactly when the logged-in user's id matches one of the
hardcoded personas in `data/demoUsers.ts` — set only via the "Try Demo" button on the login page,
which never calls the backend. Every page that fetches real data gates the call behind
`if (!isDemoMode)`; the demo branch renders local, static, clearly-labeled data instead. This is
enforced by convention, not by a shared wrapper — when adding a new real-data page, follow the
existing pattern in a neighboring file rather than inventing a new one.

## Data flow example: AI Tutor

1. Frontend: `AITutor.tsx` renders `<AIChatPanel onSend={...}>`. In demo mode, `onSend` resolves
   locally (`getDemoAIResponse`) with zero network calls. Otherwise it calls `aiApi.tutorChat`.
2. Backend: `POST /ai/tutor/chat` → `authorize('STUDENT')` → `aiFeaturesController.tutorChat` →
   `aiFeaturesService.tutorChat` (builds a persona prompt from the student's real name/grade) →
   `aiService.sendMessage` (persists the conversation + messages, calls the configured
   `AIProvider`, persists usage) → response bubbles back up.
3. The `AIConversation.feature = 'tutor'` tag lets `GET /ai/conversations?feature=tutor` list only
   this feature's threads, so continuing a previous conversation works per-feature.
