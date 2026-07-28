import 'dotenv/config'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  port: Number(process.env.PORT ?? 5000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // AI infrastructure. Left optional (not requireEnv) so the app keeps running
  // with the mock provider until a real provider is deliberately configured.
  aiProvider: process.env.AI_PROVIDER ?? 'mock',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  aiMaxTokens: Number(process.env.MAX_TOKENS ?? 500),
  aiTemperature: Number(process.env.TEMPERATURE ?? 0.7),

  // Sessions. Access tokens are short-lived and paired with a rotating refresh token
  // (see services/session.service.ts) instead of one long-lived JWT.
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 60 * 60 * 2), // 2 hours
  refreshTokenTtlSeconds: Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30), // 30 days

  // Used to build password-reset / email-verification links. Falls back to corsOrigin
  // (the deployed frontend origin) so this never needs a separate env var in practice.
  frontendUrl: process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  // Surfaced on GET /version — Vercel sets this automatically at build time (blank when the
  // project isn't Git-connected, which this backend currently isn't deployed as).
  gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
}
