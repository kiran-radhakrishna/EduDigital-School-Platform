import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller'
import { authenticate } from '../middleware/authenticate'
import { asyncHandler } from '../utils/asyncHandler'

export const dashboardRouter = Router()

dashboardRouter.use(authenticate)

dashboardRouter.get('/students/:id', asyncHandler(dashboardController.getStudentDashboard))
dashboardRouter.get('/teachers/:id', asyncHandler(dashboardController.getTeacherDashboard))
dashboardRouter.get('/teachers/:id/students', asyncHandler(dashboardController.getAssignedStudents))
dashboardRouter.get('/parents/:id', asyncHandler(dashboardController.getParentDashboard))
