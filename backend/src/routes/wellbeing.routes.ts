import { Router } from 'express'
import * as wellbeingController from '../controllers/wellbeing.controller'
import { authenticate } from '../middleware/authenticate'
import { asyncHandler } from '../utils/asyncHandler'

export const wellbeingRouter = Router()

wellbeingRouter.use(authenticate)

wellbeingRouter.post('/check-ins', asyncHandler(wellbeingController.createCheckIn))
wellbeingRouter.get('/me', asyncHandler(wellbeingController.getStatus))
wellbeingRouter.get('/me/history', asyncHandler(wellbeingController.getHistory))
wellbeingRouter.post('/skip', asyncHandler(wellbeingController.skipToday))
