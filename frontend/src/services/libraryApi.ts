import { apiClient } from './apiClient'

export interface BookCategory {
  id: string
  schoolId: string
  name: string
}

export interface BookAuthor {
  id: string
  schoolId: string
  name: string
}

export interface LibraryBook {
  id: string
  schoolId: string
  title: string
  isbn?: string | null
  categoryId?: string | null
  category?: BookCategory | null
  authorId?: string | null
  author?: BookAuthor | null
  publishedYear?: number | null
  totalQuantity: number
  availableQuantity: number
}

export interface BookIssue {
  id: string
  bookId: string
  book: LibraryBook
  borrowerUserId: string
  borrower: { id: string; firstName: string; lastName: string; role: string }
  issuedByUserId: string
  issueDate: string
  dueDate: string
  returnDate?: string | null
  status: 'ISSUED' | 'RETURNED'
  fine?: BookFine | null
}

export interface BookFine {
  id: string
  bookIssueId: string
  amount: number
  reason: string
  isPaid: boolean
  paidAt?: string | null
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

export interface UpdateBookInput {
  title?: string
  isbn?: string
  categoryId?: string | null
  authorId?: string | null
  publishedYear?: number
  totalQuantity?: number
}

export const libraryApi = {
  async listCategories(schoolId: string): Promise<BookCategory[]> {
    const { data } = await apiClient.get<{ categories: BookCategory[] }>('/library/categories', { params: { schoolId } })
    return data.categories
  },
  async createCategory(schoolId: string, name: string): Promise<BookCategory> {
    const { data } = await apiClient.post<{ category: BookCategory }>('/library/categories', { schoolId, name })
    return data.category
  },
  async listAuthors(schoolId: string): Promise<BookAuthor[]> {
    const { data } = await apiClient.get<{ authors: BookAuthor[] }>('/library/authors', { params: { schoolId } })
    return data.authors
  },
  async createAuthor(schoolId: string, name: string): Promise<BookAuthor> {
    const { data } = await apiClient.post<{ author: BookAuthor }>('/library/authors', { schoolId, name })
    return data.author
  },
  async listBooks(schoolId: string, search?: string): Promise<LibraryBook[]> {
    const { data } = await apiClient.get<{ books: LibraryBook[] }>('/library/books', { params: { schoolId, search } })
    return data.books
  },
  async createBook(input: CreateBookInput): Promise<LibraryBook> {
    const { data } = await apiClient.post<{ book: LibraryBook }>('/library/books', input)
    return data.book
  },
  async updateBook(id: string, input: UpdateBookInput): Promise<LibraryBook> {
    const { data } = await apiClient.patch<{ book: LibraryBook }>(`/library/books/${id}`, input)
    return data.book
  },
  async deleteBook(id: string): Promise<void> {
    await apiClient.delete(`/library/books/${id}`)
  },
  async issueBook(bookId: string, borrowerUserId: string, dueDate: string): Promise<BookIssue> {
    const { data } = await apiClient.post<{ issue: BookIssue }>('/library/issues', { bookId, borrowerUserId, dueDate })
    return data.issue
  },
  async returnBook(issueId: string): Promise<BookIssue> {
    const { data } = await apiClient.post<{ issue: BookIssue }>(`/library/issues/${issueId}/return`)
    return data.issue
  },
  async listActiveIssues(schoolId: string): Promise<BookIssue[]> {
    const { data } = await apiClient.get<{ issues: BookIssue[] }>('/library/issues', { params: { schoolId } })
    return data.issues
  },
  async getBorrowingHistory(userId: string): Promise<BookIssue[]> {
    const { data } = await apiClient.get<{ history: BookIssue[] }>(`/library/users/${userId}/history`)
    return data.history
  },
  async payFine(fineId: string): Promise<BookFine> {
    const { data } = await apiClient.post<{ fine: BookFine }>(`/library/fines/${fineId}/pay`)
    return data.fine
  },
}
