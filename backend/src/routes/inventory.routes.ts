import { Router } from 'express'
import * as inventoryController from '../controllers/inventory.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const inventoryRouter = Router()

inventoryRouter.use(authenticate)

const manage = authorize('ADMINISTRATOR', 'AUTHORITY')

inventoryRouter.get('/categories', asyncHandler(inventoryController.listCategories))
inventoryRouter.post('/categories', manage, asyncHandler(inventoryController.createCategory))

inventoryRouter.get('/assets', asyncHandler(inventoryController.listAssets))
inventoryRouter.post('/assets', manage, asyncHandler(inventoryController.createAsset))
inventoryRouter.get('/assets/low-stock', manage, asyncHandler(inventoryController.listLowStock))
inventoryRouter.get('/assets/:id', asyncHandler(inventoryController.getAssetById))
inventoryRouter.patch('/assets/:id', manage, asyncHandler(inventoryController.updateAsset))
inventoryRouter.delete('/assets/:id', manage, asyncHandler(inventoryController.deleteAsset))
inventoryRouter.get('/assets/:id/history', manage, asyncHandler(inventoryController.getAssetHistory))

inventoryRouter.get('/assignments', manage, asyncHandler(inventoryController.listAssignments))
inventoryRouter.post('/assignments', manage, asyncHandler(inventoryController.assignAsset))
inventoryRouter.post('/assignments/:id/return', manage, asyncHandler(inventoryController.returnAsset))

inventoryRouter.post('/maintenance', manage, asyncHandler(inventoryController.createMaintenance))
inventoryRouter.patch('/maintenance/:id', manage, asyncHandler(inventoryController.updateMaintenanceStatus))
