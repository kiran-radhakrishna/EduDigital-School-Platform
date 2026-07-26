import { Router } from 'express'
import * as userController from '../controllers/user.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const userRouter = Router()

userRouter.use(authenticate)

userRouter.get('/', authorize('ADMINISTRATOR', 'AUTHORITY'), asyncHandler(userController.list))
userRouter.post('/', authorize('ADMINISTRATOR'), asyncHandler(userController.create))
userRouter.get('/:id', asyncHandler(userController.getById))
userRouter.patch('/:id', asyncHandler(userController.update))
userRouter.delete('/:id', authorize('ADMINISTRATOR'), asyncHandler(userController.remove))
