import type { Request } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'

export type AuditAction =
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.register'
  | 'auth.logout'
  | 'auth.refresh'
  | 'auth.password_reset.requested'
  | 'auth.password_reset.completed'
  | 'auth.email_verification.requested'
  | 'auth.email_verification.completed'

export interface LogAuditInput {
  userId?: string | null
  action: AuditAction
  metadata?: Record<string, unknown>
  req?: Request
}

function clientIp(req?: Request): string | undefined {
  if (!req) return undefined
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim()
  return req.ip
}

/** Fire-and-forget audit trail for auth/session/account-security events. Never throws into the caller's flow. */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? undefined,
        ipAddress: clientIp(input.req),
      },
    })
  } catch {
    // Auditing must never break the calling request.
  }
}

export interface ListAuditLogInput {
  userId?: string
  action?: string
  limit?: number
}

export async function listAuditLog(input: ListAuditLogInput) {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200)
  return prisma.auditLog.findMany({
    where: { userId: input.userId, action: input.action },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
