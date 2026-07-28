# Environment Variables

## Backend (`backend/.env`, see `backend/.env.example`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | — | Postgres connection string (Neon). App fails to start without it. |
| `JWT_SECRET` | **Yes** | — | Signs access tokens. App fails to start without it. Rotate = all sessions invalidated. |
| `PORT` | No | `5000` | Local dev only — ignored on Vercel. |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Must be the exact deployed frontend origin in production (single origin, not a wildcard — required for cookie-based auth with `credentials: true`). |
| `NODE_ENV` | No | `development` | Set to `production` on Vercel. Controls cookie `Secure`/`SameSite` flags. |
| `AI_PROVIDER` | No | `mock` | `mock` (no external calls, safe default) or `openai`. New providers register in `backend/src/ai/providerFactory.ts`. |
| `OPENAI_API_KEY` | No | — | Only read when `AI_PROVIDER=openai`. Leaving `AI_PROVIDER=mock` means this is never needed. |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Passed through to the OpenAI Chat Completions API. |
| `MAX_TOKENS` | No | `500` | Per-request generation cap, all providers. |
| `TEMPERATURE` | No | `0.7` | Per-request sampling temperature, all providers. |
| `ACCESS_TOKEN_TTL_SECONDS` | No | `7200` (2h) | JWT access token lifetime. |
| `REFRESH_TOKEN_TTL_SECONDS` | No | `2592000` (30d) | Refresh token lifetime; rotated on every use. |
| `FRONTEND_URL` | No | value of `CORS_ORIGIN` | Used to build password-reset/email-verification links. Only set separately if it must differ from `CORS_ORIGIN`. |
| `VERCEL_GIT_COMMIT_SHA` | No (auto) | `unknown` | Set automatically by Vercel; surfaced at `GET /version`. Don't set manually. |

**No email provider is configured out of the box.** Password reset and email verification links
are logged server-side (`utils/email.ts`'s `ConsoleEmailSender`) rather than emailed. To send
real emails, implement `EmailSender` (SMTP/Resend/SES/...) and select it in `utils/email.ts` —
no caller needs to change.

## Frontend (`frontend/.env`, see `frontend/.env.example`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:5000` | Backend origin. Must point at the deployed backend in production (set as a Vercel project env var, not committed). |

## Vercel project settings (not env vars, but part of "environment")

- **backend** project: root directory `backend/`, build command uses `npm run build` (via
  `vercel.json`'s catch-all rewrite to `api/index.ts`), `postinstall` runs `prisma generate`.
- **frontend** project: root directory `frontend/`, standard Vite build.
- Both are deployed with `vercel deploy --prod` run from the **repository root** (not from inside
  `backend/`/`frontend/` — the linked project's root directory setting already points there;
  running from inside the subdirectory fails with a "path does not exist" error).
