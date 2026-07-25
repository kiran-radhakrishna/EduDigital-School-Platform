import jwt from 'jsonwebtoken'
import type { UserRole as PrismaUserRole } from '@prisma/client'
import { env } from '../config/env'

export interface AuthTokenPayload {
  userId: string
  role: PrismaUserRole
}

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL_SECONDS })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload
}

export const AUTH_COOKIE_NAME = 'edudigital_token'
export const AUTH_COOKIE_MAX_AGE_MS = TOKEN_TTL_SECONDS * 1000
