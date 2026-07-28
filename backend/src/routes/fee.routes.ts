import { Router } from 'express'
import * as feeController from '../controllers/fee.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const feeRouter = Router()

feeRouter.use(authenticate)

const manage = authorize('ADMINISTRATOR', 'AUTHORITY')

feeRouter.get('/structures', asyncHandler(feeController.listFeeStructures))
feeRouter.post('/structures', manage, asyncHandler(feeController.createFeeStructure))

feeRouter.get('/invoices', manage, asyncHandler(feeController.listInvoicesForSchool))
feeRouter.post('/invoices', manage, asyncHandler(feeController.generateInvoice))
feeRouter.post('/invoices/generate-bulk', manage, asyncHandler(feeController.generateInvoicesForStructure))
feeRouter.get('/invoices/:id', asyncHandler(feeController.getInvoiceById))
feeRouter.post('/invoices/:id/installments', manage, asyncHandler(feeController.createInstallments))
feeRouter.patch('/invoices/:id/late-fine', manage, asyncHandler(feeController.applyLateFine))

feeRouter.get('/students/:id/invoices', asyncHandler(feeController.listInvoicesForStudent))

feeRouter.post('/payments', manage, asyncHandler(feeController.recordPayment))
feeRouter.post('/installments/:id/pay', manage, asyncHandler(feeController.payInstallment))
