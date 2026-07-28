import type { Request, Response } from 'express'
import { ForbiddenError } from '../utils/errors'
import * as analyticsService from '../services/analytics.service'

export async function getMySchoolAnalytics(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new ForbiddenError()

  const schoolId = await analyticsService.getSchoolIdForUser(req.userId)
  const analytics = await analyticsService.getSchoolAnalytics(schoolId)
  res.status(200).json({ analytics })
}

export async function getMyFinanceAnalytics(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new ForbiddenError()

  const schoolId = await analyticsService.getSchoolIdForUser(req.userId)
  const analytics = await analyticsService.getFinanceAnalytics(schoolId)
  res.status(200).json({ analytics })
}
