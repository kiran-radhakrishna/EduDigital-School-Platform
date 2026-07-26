import { Router } from 'express'
import * as parentController from '../controllers/parent.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const parentRouter = Router()

parentRouter.use(authenticate)

parentRouter.get('/:id/children', asyncHandler(parentController.getChildren))
parentRouter.post('/:id/children', authorize('ADMINISTRATOR'), asyncHandler(parentController.addChild))
parentRouter.delete(
  '/:id/children/:studentUserId',
  authorize('ADMINISTRATOR'),
  asyncHandler(parentController.removeChild),
)
