import type { NextFunction, Request, Response } from 'express'
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME } from '../utils/jwt'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const CSRF_HEADER = 'x-csrf-token'

/**
 * Double-submit cookie check. Cross-origin cookie auth (SameSite=None in production, required
 * since the frontend and backend are on different origins) gets no CSRF protection from
 * SameSite alone, so state-changing requests must also echo back the readable CSRF cookie as a
 * header — something a third-party site's forged request can't do, since it can't read our cookies.
 *
 * Only enforced once a session cookie is present: a request with no auth cookie has nothing to
 * forge, and this must not block login/register, which are what establish that cookie.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const hasSession = typeof req.cookies?.[AUTH_COOKIE_NAME] === 'string'
  if (!hasSession) {
    next()
    return
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME]
  const headerToken = req.headers[CSRF_HEADER]

  if (typeof cookieToken === 'string' && cookieToken.length > 0 && cookieToken === headerToken) {
    next()
    return
  }

  res.status(403).json({ error: 'Invalid or missing CSRF token.' })
}
