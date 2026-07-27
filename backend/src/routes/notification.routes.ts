import { Router } from 'express'
import * as notificationController from '../controllers/notification.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const notificationRouter = Router()

notificationRouter.use(authenticate)

notificationRouter.get('/', asyncHandler(notificationController.list))
notificationRouter.get('/unread-count', asyncHandler(notificationController.unreadCount))
notificationRouter.post(
  '/',
  authorize('TEACHER', 'ADMINISTRATOR', 'AUTHORITY'),
  asyncHandler(notificationController.create),
)
notificationRouter.get('/preferences', asyncHandler(notificationController.getPreferences))
notificationRouter.put('/preferences', asyncHandler(notificationController.updatePreferences))
notificationRouter.patch('/:id/read', asyncHandler(notificationController.markAsRead))
notificationRouter.post('/read-all', asyncHandler(notificationController.markAllAsRead))
notificationRouter.delete('/:id', asyncHandler(notificationController.remove))
