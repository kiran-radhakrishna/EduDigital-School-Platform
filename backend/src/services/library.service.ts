import { prisma } from '../config/prisma'
import { ConflictError, NotFoundError, AppError } from '../utils/errors'

// ─── Categories & Authors ───────────────────────────────────────────────────

export async function listCategories(schoolId: string) {
  return prisma.bookCategory.findMany({ where: { schoolId }, orderBy: { name: 'asc' } })
}

export async function createCategory(schoolId: string, name: string) {
  const existing = await prisma.bookCategory.findFirst({ where: { schoolId, name } })
  if (existing) throw new ConflictError('A category with this name already exists.')
  return prisma.bookCategory.create({ data: { schoolId, name: name.trim() } })
}

export async function listAuthors(schoolId: string) {
  return prisma.bookAuthor.findMany({ where: { schoolId }, orderBy: { name: 'asc' } })
}

export async function createAuthor(schoolId: string, name: string) {
  const existing = await prisma.bookAuthor.findFirst({ where: { schoolId, name } })
  if (existing) throw new ConflictError('An author with this name already exists.')
  return prisma.bookAuthor.create({ data: { schoolId, name: name.trim() } })
}

// ─── Books ───────────────────────────────────────────────────────────────

const bookInclude = { category: true, author: true } as const

export async function listBooks(schoolId: string, search?: string) {
  return prisma.libraryBook.findMany({
    where: {
      schoolId,
      ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
    },
    include: bookInclude,
    orderBy: { title: 'asc' },
  })
}

export async function getBookById(id: string) {
  const book = await prisma.libraryBook.findUnique({ where: { id }, include: bookInclude })
  if (!book) throw new NotFoundError('Book not found.')
  return book
}

export interface CreateBookInput {
  schoolId: string
  title: string
  isbn?: string
  categoryId?: string
  authorId?: string
  publishedYear?: number
  totalQuantity?: number
}

export async function createBook(input: CreateBookInput) {
  const totalQuantity = input.totalQuantity ?? 1
  return prisma.libraryBook.create({
    data: {
      schoolId: input.schoolId,
      title: input.title.trim(),
      isbn: input.isbn,
      categoryId: input.categoryId,
      authorId: input.authorId,
      publishedYear: input.publishedYear,
      totalQuantity,
      availableQuantity: totalQuantity,
    },
    include: bookInclude,
  })
}

export interface UpdateBookInput {
  title?: string
  isbn?: string
  categoryId?: string | null
  authorId?: string | null
  publishedYear?: number
  totalQuantity?: number
}

export async function updateBook(id: string, input: UpdateBookInput) {
  const existing = await getBookById(id)

  let availableQuantity = existing.availableQuantity
  if (input.totalQuantity !== undefined) {
    const issuedCount = existing.totalQuantity - existing.availableQuantity
    if (input.totalQuantity < issuedCount) {
      throw new AppError(`Cannot set total quantity below the ${issuedCount} copies currently issued.`)
    }
    availableQuantity = input.totalQuantity - issuedCount
  }

  return prisma.libraryBook.update({
    where: { id },
    data: { ...input, availableQuantity },
    include: bookInclude,
  })
}

export async function deleteBook(id: string) {
  const activeIssue = await prisma.bookIssue.findFirst({ where: { bookId: id, status: 'ISSUED' } })
  if (activeIssue) throw new ConflictError('Cannot delete a book with copies currently issued.')
  await prisma.libraryBook.delete({ where: { id } })
}

// ─── Issues & Returns ────────────────────────────────────────────────────

const issueInclude = {
  book: true,
  borrower: { select: { id: true, firstName: true, lastName: true, role: true } },
} as const

export interface IssueBookInput {
  bookId: string
  borrowerUserId: string
  issuedByUserId: string
  dueDate: string
}

export async function issueBook(input: IssueBookInput) {
  const book = await getBookById(input.bookId)
  if (book.availableQuantity < 1) {
    throw new ConflictError('No copies of this book are currently available.')
  }

  return prisma.$transaction(async (tx) => {
    await tx.libraryBook.update({
      where: { id: input.bookId },
      data: { availableQuantity: { decrement: 1 } },
    })

    return tx.bookIssue.create({
      data: {
        bookId: input.bookId,
        borrowerUserId: input.borrowerUserId,
        issuedByUserId: input.issuedByUserId,
        dueDate: new Date(input.dueDate),
      },
      include: issueInclude,
    })
  })
}

const FINE_PER_DAY_LATE = 0.5

export async function returnBook(issueId: string) {
  const issue = await prisma.bookIssue.findUnique({ where: { id: issueId } })
  if (!issue) throw new NotFoundError('Book issue not found.')
  if (issue.status === 'RETURNED') throw new ConflictError('This book has already been returned.')

  const returnDate = new Date()
  const daysLate = Math.max(0, Math.ceil((returnDate.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24)))

  return prisma.$transaction(async (tx) => {
    await tx.libraryBook.update({
      where: { id: issue.bookId },
      data: { availableQuantity: { increment: 1 } },
    })

    const updatedIssue = await tx.bookIssue.update({
      where: { id: issueId },
      data: { status: 'RETURNED', returnDate },
      include: issueInclude,
    })

    if (daysLate > 0) {
      await tx.bookFine.create({
        data: {
          bookIssueId: issueId,
          amount: Math.round(daysLate * FINE_PER_DAY_LATE * 100) / 100,
          reason: `Returned ${daysLate} day(s) late`,
        },
      })
    }

    return updatedIssue
  })
}

export async function listActiveIssues(schoolId: string) {
  return prisma.bookIssue.findMany({
    where: { status: 'ISSUED', book: { schoolId } },
    include: issueInclude,
    orderBy: { dueDate: 'asc' },
  })
}

export async function listBorrowingHistory(userId: string) {
  return prisma.bookIssue.findMany({
    where: { borrowerUserId: userId },
    include: { book: true, fine: true },
    orderBy: { issueDate: 'desc' },
  })
}

export async function payFine(fineId: string) {
  const fine = await prisma.bookFine.findUnique({ where: { id: fineId } })
  if (!fine) throw new NotFoundError('Fine not found.')
  return prisma.bookFine.update({ where: { id: fineId }, data: { isPaid: true, paidAt: new Date() } })
}
