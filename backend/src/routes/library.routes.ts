import { Router } from 'express'
import * as libraryController from '../controllers/library.controller'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { asyncHandler } from '../utils/asyncHandler'

export const libraryRouter = Router()

libraryRouter.use(authenticate)

const manage = authorize('ADMINISTRATOR', 'AUTHORITY')

libraryRouter.get('/categories', asyncHandler(libraryController.listCategories))
libraryRouter.post('/categories', manage, asyncHandler(libraryController.createCategory))

libraryRouter.get('/authors', asyncHandler(libraryController.listAuthors))
libraryRouter.post('/authors', manage, asyncHandler(libraryController.createAuthor))

libraryRouter.get('/books', asyncHandler(libraryController.listBooks))
libraryRouter.post('/books', manage, asyncHandler(libraryController.createBook))
libraryRouter.get('/books/:id', asyncHandler(libraryController.getBookById))
libraryRouter.patch('/books/:id', manage, asyncHandler(libraryController.updateBook))
libraryRouter.delete('/books/:id', manage, asyncHandler(libraryController.deleteBook))

libraryRouter.get('/issues', manage, asyncHandler(libraryController.listActiveIssues))
libraryRouter.post('/issues', manage, asyncHandler(libraryController.issueBook))
libraryRouter.post('/issues/:id/return', manage, asyncHandler(libraryController.returnBook))

libraryRouter.get('/users/:id/history', asyncHandler(libraryController.getBorrowingHistory))
libraryRouter.post('/fines/:id/pay', manage, asyncHandler(libraryController.payFine))
