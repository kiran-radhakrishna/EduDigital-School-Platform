import type { NextFunction, Request, Response } from 'express'
import type { UserRole as PrismaUserRole } from '@prisma/client'

/** Must run after `authenticate`, which populates `req.userRole`. */
export function authorize(...allowedRoles: PrismaUserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: 'Not authenticated.' })
      return
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({ error: 'You do not have permission to perform this action.' })
      return
    }

    next()
  }
}
