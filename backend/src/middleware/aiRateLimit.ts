import rateLimit from 'express-rate-limit'

/** Runs after `authenticate`, so `req.userId` is available for per-user keying. */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId ?? req.ip ?? 'unknown',
  message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
})
