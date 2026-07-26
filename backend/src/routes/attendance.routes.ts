import { Router } from 'express'
import * as attendanceController from '../controllers/attendance.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const attendanceRouter = Router()

attendanceRouter.use(authenticate)

attendanceRouter.post(
  '/',
  authorize('TEACHER', 'ADMINISTRATOR', 'AUTHORITY'),
  asyncHandler(attendanceController.record),
)
attendanceRouter.get(
  '/',
  authorize('TEACHER', 'ADMINISTRATOR', 'AUTHORITY'),
  asyncHandler(attendanceController.getForClass),
)
attendanceRouter.get('/students/:id', asyncHandler(attendanceController.getForStudent))
attendanceRouter.get('/students/:id/summary', asyncHandler(attendanceController.getSummaryForStudent))
