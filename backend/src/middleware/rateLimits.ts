import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

/** Guards login/register/password-reset against brute force and credential stuffing. */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? 'unknown'),
  message: { error: 'Too many attempts. Please wait a few minutes before trying again.' },
})

/** Baseline protection for every other route — generous enough not to affect normal usage. */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId ?? ipKeyGenerator(req.ip ?? 'unknown'),
  message: { error: 'Too many requests. Please slow down.' },
})
