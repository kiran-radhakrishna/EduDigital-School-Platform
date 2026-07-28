import { Router } from 'express'
import * as transportController from '../controllers/transport.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const transportRouter = Router()

transportRouter.use(authenticate)

const manage = authorize('ADMINISTRATOR', 'AUTHORITY')

transportRouter.get('/buses', asyncHandler(transportController.listBuses))
transportRouter.post('/buses', manage, asyncHandler(transportController.createBus))
transportRouter.patch('/buses/:id', manage, asyncHandler(transportController.updateBus))
transportRouter.delete('/buses/:id', manage, asyncHandler(transportController.deleteBus))

transportRouter.get('/drivers', asyncHandler(transportController.listDrivers))
transportRouter.post('/drivers', manage, asyncHandler(transportController.createDriver))
transportRouter.patch('/drivers/:id', manage, asyncHandler(transportController.updateDriver))
transportRouter.delete('/drivers/:id', manage, asyncHandler(transportController.deleteDriver))

transportRouter.get('/routes', asyncHandler(transportController.listRoutes))
transportRouter.post('/routes', manage, asyncHandler(transportController.createRoute))
transportRouter.get('/routes/:id', asyncHandler(transportController.getRouteById))
transportRouter.patch('/routes/:id', manage, asyncHandler(transportController.updateRoute))
transportRouter.delete('/routes/:id', manage, asyncHandler(transportController.deleteRoute))
transportRouter.get('/routes/:id/students', manage, asyncHandler(transportController.listRouteStudents))
transportRouter.post('/routes/:id/stops', manage, asyncHandler(transportController.createStop))

transportRouter.patch('/stops/:id', manage, asyncHandler(transportController.updateStop))
transportRouter.delete('/stops/:id', manage, asyncHandler(transportController.deleteStop))

transportRouter.post('/assignments', manage, asyncHandler(transportController.assignStudent))
transportRouter.delete('/students/:id/assignment', manage, asyncHandler(transportController.removeStudentAssignment))
transportRouter.get('/students/:id', asyncHandler(transportController.getStudentTransport))
