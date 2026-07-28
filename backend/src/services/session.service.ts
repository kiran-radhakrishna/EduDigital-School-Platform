import type { UserRole as PrismaUserRole } from '@prisma/client'
import { prisma } from '../config/prisma'
import { env } from '../config/env'
import { generateOpaqueToken, hashToken } from '../utils/tokens'
import { signAuthToken } from '../utils/jwt'
import { AuthError } from '../utils/errors'

export interface IssuedSession {
  accessToken: string
  refreshToken: string
}

export async function issueSession(userId: string, role: PrismaUserRole): Promise<IssuedSession> {
  const accessToken = signAuthToken({ userId, role })
  const refreshToken = generateOpaqueToken()

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.refreshTokenTtlSeconds * 1000),
    },
  })

  return { accessToken, refreshToken }
}

/** Validates and rotates a refresh token: the old one is revoked and a new pair is issued. */
export async function rotateSession(rawRefreshToken: string): Promise<IssuedSession> {
  const tokenHash = hashToken(rawRefreshToken)
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } })

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AuthError('Invalid or expired session. Please log in again.')
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } })

  return issueSession(stored.userId, stored.user.role)
}

export async function revokeRefreshToken(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken)
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

/** Revokes every active session for a user — used after a password change/reset. */
export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })
}
