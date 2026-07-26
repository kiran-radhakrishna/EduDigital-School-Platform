import { Router } from 'express'
import * as timetableController from '../controllers/timetable.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const timetableRouter = Router()

timetableRouter.use(authenticate)

timetableRouter.post(
  '/',
  authorize('TEACHER', 'ADMINISTRATOR', 'AUTHORITY'),
  asyncHandler(timetableController.createSlot),
)
timetableRouter.get('/', asyncHandler(timetableController.getForClass))
timetableRouter.get('/students/:id', asyncHandler(timetableController.getForStudent))
timetableRouter.get('/teachers/:id', asyncHandler(timetableController.getForTeacher))
