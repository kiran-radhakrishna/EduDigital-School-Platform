import { Router } from 'express'
import * as analyticsController from '../controllers/analytics.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const analyticsRouter = Router()

analyticsRouter.use(authenticate)

analyticsRouter.get(
  '/school',
  authorize('ADMINISTRATOR', 'AUTHORITY'),
  asyncHandler(analyticsController.getMySchoolAnalytics),
)

analyticsRouter.get(
  '/finance',
  authorize('ADMINISTRATOR', 'AUTHORITY'),
  asyncHandler(analyticsController.getMyFinanceAnalytics),
)
