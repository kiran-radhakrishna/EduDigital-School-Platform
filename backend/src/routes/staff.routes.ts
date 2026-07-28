import { Router } from 'express'
import * as staffController from '../controllers/staff.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const staffRouter = Router()

staffRouter.use(authenticate)

const manage = authorize('ADMINISTRATOR', 'AUTHORITY')

staffRouter.get('/departments', asyncHandler(staffController.listDepartments))
staffRouter.post('/departments', manage, asyncHandler(staffController.createDepartment))

staffRouter.get('/designations', asyncHandler(staffController.listDesignations))
staffRouter.post('/designations', manage, asyncHandler(staffController.createDesignation))

staffRouter.get('/', manage, asyncHandler(staffController.listStaff))
staffRouter.post('/', manage, asyncHandler(staffController.createStaff))
staffRouter.get('/me', asyncHandler(staffController.getMyStaffProfile))
staffRouter.get('/leave-requests', manage, asyncHandler(staffController.listLeaveRequests))
staffRouter.get('/leave-requests/me', asyncHandler(staffController.listMyLeaveRequests))
staffRouter.post('/leave-requests', asyncHandler(staffController.createLeaveRequest))
staffRouter.patch('/leave-requests/:id', manage, asyncHandler(staffController.reviewLeaveRequest))
staffRouter.post('/leave-balances', manage, asyncHandler(staffController.setLeaveBalance))
staffRouter.get('/:staffId/leave-balances', asyncHandler(staffController.getLeaveBalances))
staffRouter.get('/:id', asyncHandler(staffController.getStaffById))
staffRouter.patch('/:id', manage, asyncHandler(staffController.updateStaff))
staffRouter.delete('/:id', manage, asyncHandler(staffController.deleteStaff))
