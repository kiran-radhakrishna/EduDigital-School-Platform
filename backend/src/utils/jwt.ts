import jwt from 'jsonwebtoken'
import type { UserRole as PrismaUserRole } from '@prisma/client'
import { env } from '../config/env'

export interface AuthTokenPayload {
  userId: string
  role: PrismaUserRole
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessTokenTtlSeconds })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload
}

// Short-lived access token, held in an httpOnly cookie and paired with a rotating
// refresh token (see services/session.service.ts) rather than one long-lived JWT.
export const AUTH_COOKIE_NAME = 'edudigital_token'
export const AUTH_COOKIE_MAX_AGE_MS = env.accessTokenTtlSeconds * 1000

export const REFRESH_COOKIE_NAME = 'edudigital_refresh'
export const REFRESH_COOKIE_MAX_AGE_MS = env.refreshTokenTtlSeconds * 1000

// Non-httpOnly so the frontend can read it and echo it back as a header (double-submit CSRF check).
export const CSRF_COOKIE_NAME = 'edudigital_csrf'
