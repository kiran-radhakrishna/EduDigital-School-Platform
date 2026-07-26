import { Router } from 'express'
import * as academicController from '../controllers/academic.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const academicRouter = Router()

academicRouter.use(authenticate)

academicRouter.get('/subjects', asyncHandler(academicController.listSubjects))
academicRouter.post('/subjects', authorize('ADMINISTRATOR'), asyncHandler(academicController.createSubject))

academicRouter.get('/classes', asyncHandler(academicController.listClasses))
academicRouter.post('/classes', authorize('ADMINISTRATOR'), asyncHandler(academicController.createClass))
academicRouter.get('/classes/:id', asyncHandler(academicController.getClassById))
academicRouter.post(
  '/classes/:id/assign-teacher',
  authorize('ADMINISTRATOR'),
  asyncHandler(academicController.assignTeacher),
)
academicRouter.post(
  '/classes/:id/enroll',
  authorize('ADMINISTRATOR'),
  asyncHandler(academicController.enrollStudent),
)

academicRouter.get('/teachers/:id/assignments', asyncHandler(academicController.getTeacherAssignments))
academicRouter.get('/students/:id/enrollment', asyncHandler(academicController.getStudentEnrollment))
