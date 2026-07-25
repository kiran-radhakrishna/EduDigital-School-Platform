import type { NextFunction, Request, Response } from 'express'
import type { UserRole as PrismaUserRole } from '@prisma/client'
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../utils/jwt'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string
      userRole?: PrismaUserRole
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME]

  if (typeof token !== 'string' || !token) {
    res.status(401).json({ error: 'Not authenticated.' })
    return
  }

  try {
    const payload = verifyAuthToken(token)
    req.userId = payload.userId
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' })
  }
}
