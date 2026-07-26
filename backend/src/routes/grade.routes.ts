import { Router } from 'express'
import * as gradeController from '../controllers/grade.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const gradeRouter = Router()

gradeRouter.use(authenticate)

gradeRouter.post('/', authorize('TEACHER', 'ADMINISTRATOR', 'AUTHORITY'), asyncHandler(gradeController.record))
gradeRouter.get('/', asyncHandler(gradeController.listForClass))
gradeRouter.get('/students/:id', asyncHandler(gradeController.listForStudent))
gradeRouter.get('/students/:id/progress-report', asyncHandler(gradeController.getProgressReport))
