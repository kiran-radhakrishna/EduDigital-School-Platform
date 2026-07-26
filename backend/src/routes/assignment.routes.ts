import { Router } from 'express'
import * as assignmentController from '../controllers/assignment.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const assignmentRouter = Router()

assignmentRouter.use(authenticate)

assignmentRouter.post(
  '/',
  authorize('TEACHER', 'ADMINISTRATOR', 'AUTHORITY'),
  asyncHandler(assignmentController.create),
)
assignmentRouter.get('/', asyncHandler(assignmentController.listForClass))
assignmentRouter.get('/:id', asyncHandler(assignmentController.getById))
assignmentRouter.post('/:id/submit', authorize('STUDENT'), asyncHandler(assignmentController.submit))
assignmentRouter.post(
  '/:id/grade',
  authorize('TEACHER', 'ADMINISTRATOR', 'AUTHORITY'),
  asyncHandler(assignmentController.grade),
)
assignmentRouter.get('/students/:id', asyncHandler(assignmentController.listForStudent))
