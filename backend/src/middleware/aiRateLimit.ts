import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

/** Runs after `authenticate`, so `req.userId` is available for per-user keying. */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // ipKeyGenerator normalizes IPv6 addresses to their /64 subnet, matching express-rate-limit's
  // own IP-based keying — required so an authenticated fallback to raw req.ip can't be bypassed.
  keyGenerator: (req) => req.userId ?? ipKeyGenerator(req.ip ?? 'unknown'),
  message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
})
