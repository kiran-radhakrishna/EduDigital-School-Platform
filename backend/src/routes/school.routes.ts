import { Router } from 'express'
import * as schoolController from '../controllers/school.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const schoolRouter = Router()

schoolRouter.use(authenticate)

schoolRouter.get('/', asyncHandler(schoolController.list))
schoolRouter.post('/', authorize('ADMINISTRATOR'), asyncHandler(schoolController.create))
schoolRouter.get('/:id', asyncHandler(schoolController.getById))
schoolRouter.patch('/:id', authorize('ADMINISTRATOR'), asyncHandler(schoolController.update))
schoolRouter.delete('/:id', authorize('ADMINISTRATOR'), asyncHandler(schoolController.remove))

schoolRouter.get('/:id/academic-years', asyncHandler(schoolController.listAcademicYears))
schoolRouter.post(
  '/:id/academic-years',
  authorize('ADMINISTRATOR'),
  asyncHandler(schoolController.createAcademicYear),
)
