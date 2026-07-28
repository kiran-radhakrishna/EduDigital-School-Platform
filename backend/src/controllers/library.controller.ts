import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import { isParentOfStudent } from '../services/resolvers'
import * as libraryService from '../services/library.service'

function isPrivileged(req: Request): boolean {
  return req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
}

const schoolIdQuerySchema = z.object({ schoolId: z.string().min(1), search: z.string().optional() })

export async function listCategories(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const categories = await libraryService.listCategories(schoolId)
  res.status(200).json({ categories })
}

const createCategorySchema = z.object({ schoolId: z.string().min(1), name: z.string().min(1) })

export async function createCategory(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createCategorySchema, req.body)
  const category = await libraryService.createCategory(input.schoolId, input.name)
  res.status(201).json({ category })
}

export async function listAuthors(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const authors = await libraryService.listAuthors(schoolId)
  res.status(200).json({ authors })
}

const createAuthorSchema = z.object({ schoolId: z.string().min(1), name: z.string().min(1) })

export async function createAuthor(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createAuthorSchema, req.body)
  const author = await libraryService.createAuthor(input.schoolId, input.name)
  res.status(201).json({ author })
}

export async function listBooks(req: Request, res: Response): Promise<void> {
  const { schoolId, search } = parseOrThrow(schoolIdQuerySchema, req.query)
  const books = await libraryService.listBooks(schoolId, search)
  res.status(200).json({ books })
}

export async function getBookById(req: Request, res: Response): Promise<void> {
  const book = await libraryService.getBookById(req.params.id)
  res.status(200).json({ book })
}

const createBookSchema = z.object({
  schoolId: z.string().min(1),
  title: z.string().min(1),
  isbn: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  publishedYear: z.number().int().optional(),
  totalQuantity: z.number().int().min(1).optional(),
})

export async function createBook(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createBookSchema, req.body)
  const book = await libraryService.createBook(input)
  res.status(201).json({ book })
}

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  isbn: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  authorId: z.string().nullable().optional(),
  publishedYear: z.number().int().optional(),
  totalQuantity: z.number().int().min(0).optional(),
})

export async function updateBook(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updateBookSchema, req.body)
  const book = await libraryService.updateBook(req.params.id, input)
  res.status(200).json({ book })
}

export async function deleteBook(req: Request, res: Response): Promise<void> {
  await libraryService.deleteBook(req.params.id)
  res.status(204).send()
}

const issueBookSchema = z.object({
  bookId: z.string().min(1),
  borrowerUserId: z.string().min(1),
  dueDate: z.string().min(1),
})

export async function issueBook(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new ForbiddenError()
  const input = parseOrThrow(issueBookSchema, req.body)
  const issue = await libraryService.issueBook({ ...input, issuedByUserId: req.userId })
  res.status(201).json({ issue })
}

export async function returnBook(req: Request, res: Response): Promise<void> {
  const issue = await libraryService.returnBook(req.params.id)
  res.status(200).json({ issue })
}

export async function listActiveIssues(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const issues = await libraryService.listActiveIssues(schoolId)
  res.status(200).json({ issues })
}

export async function getBorrowingHistory(req: Request, res: Response): Promise<void> {
  const targetUserId = req.params.id
  const isSelf = req.userId === targetUserId
  const isParent = req.userRole === 'PARENT' && req.userId && (await isParentOfStudent(req.userId, targetUserId))
  if (!isSelf && !isParent && !isPrivileged(req)) {
    throw new ForbiddenError('You do not have permission to view this borrowing history.')
  }

  const history = await libraryService.listBorrowingHistory(targetUserId)
  res.status(200).json({ history })
}

export async function payFine(req: Request, res: Response): Promise<void> {
  const fine = await libraryService.payFine(req.params.id)
  res.status(200).json({ fine })
}
