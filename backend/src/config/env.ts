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
}
