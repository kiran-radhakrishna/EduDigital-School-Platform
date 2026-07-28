import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles, Trash2, Undo2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { Badge } from '../../components/common/Badge'
import { UserPicker } from '../../components/common/UserPicker'
import { useAuth } from '../../hooks/useAuth'
import { libraryApi, type LibraryBook, type BookIssue, type BookCategory, type BookAuthor } from '../../services/libraryApi'
import type { AdminUser } from '../../services/userApi'

type Tab = 'books' | 'issues'

const EMPTY_BOOK_FORM = { title: '', isbn: '', categoryId: '', authorId: '', publishedYear: '', totalQuantity: '1' }

export default function AdminLibrary() {
  const { user, isDemoMode } = useAuth()
  const schoolId = user?.schoolId ?? ''
  const [tab, setTab] = useState<Tab>('books')

  const [books, setBooks] = useState<LibraryBook[]>([])
  const [issues, setIssues] = useState<BookIssue[]>([])
  const [categories, setCategories] = useState<BookCategory[]>([])
  const [authors, setAuthors] = useState<BookAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [bookForm, setBookForm] = useState(EMPTY_BOOK_FORM)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newAuthorName, setNewAuthorName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LibraryBook | null>(null)

  const [issueTarget, setIssueTarget] = useState<LibraryBook | null>(null)
  const [borrower, setBorrower] = useState<AdminUser | null>(null)
  const [dueDate, setDueDate] = useState('')

  const loadAll = () => {
    if (!schoolId) return
    setIsLoading(true)
    Promise.all([
      libraryApi.listBooks(schoolId),
      libraryApi.listActiveIssues(schoolId),
      libraryApi.listCategories(schoolId),
      libraryApi.listAuthors(schoolId),
    ])
      .then(([bookList, issueList, categoryList, authorList]) => {
        setBooks(bookList)
        setIssues(issueList)
        setCategories(categoryList)
        setAuthors(authorList)
      })
      .catch(() => toast.error('Failed to load library data.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (isDemoMode) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data hydration on mount / auth change
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, schoolId])

  const openCreateBook = () => {
    setBookForm(EMPTY_BOOK_FORM)
    setIsBookModalOpen(true)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      const category = await libraryApi.createCategory(schoolId, newCategoryName.trim())
      setCategories((current) => [...current, category])
      setBookForm((current) => ({ ...current, categoryId: category.id }))
      setNewCategoryName('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add category.')
    }
  }

  const handleAddAuthor = async () => {
    if (!newAuthorName.trim()) return
    try {
      const author = await libraryApi.createAuthor(schoolId, newAuthorName.trim())
      setAuthors((current) => [...current, author])
      setBookForm((current) => ({ ...current, authorId: author.id }))
      setNewAuthorName('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add author.')
    }
  }

  const handleSaveBook = async () => {
    if (!bookForm.title.trim()) {
      toast.error('Book title is required.')
      return
    }
    setIsSaving(true)
    try {
      const book = await libraryApi.createBook({
        schoolId,
        title: bookForm.title.trim(),
        isbn: bookForm.isbn.trim() || undefined,
        categoryId: bookForm.categoryId || undefined,
        authorId: bookForm.authorId || undefined,
        publishedYear: bookForm.publishedYear ? Number(bookForm.publishedYear) : undefined,
        totalQuantity: Number(bookForm.totalQuantity) || 1,
      })
      setBooks((current) => [...current, book].sort((a, b) => a.title.localeCompare(b.title)))
      toast.success('Book added.')
      setIsBookModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add book.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBook = async () => {
    if (!deleteTarget) return
    try {
      await libraryApi.deleteBook(deleteTarget.id)
      setBooks((current) => current.filter((book) => book.id !== deleteTarget.id))
      toast.success('Book deleted.')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete book.')
    }
  }

  const openIssueModal = (book: LibraryBook) => {
    setIssueTarget(book)
    setBorrower(null)
    const twoWeeksFromNow = new Date()
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)
    setDueDate(twoWeeksFromNow.toISOString().slice(0, 10))
  }

  const handleIssueBook = async () => {
    if (!issueTarget || !borrower || !dueDate) {
      toast.error('Select a borrower and due date.')
      return
    }
    setIsSaving(true)
    try {
      await libraryApi.issueBook(issueTarget.id, borrower.id, dueDate)
      toast.success(`Issued to ${borrower.name}.`)
      setIssueTarget(null)
      loadAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to issue book.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReturnBook = async (issue: BookIssue) => {
    try {
      await libraryApi.returnBook(issue.id)
      toast.success('Book returned.')
      loadAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to return book.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage books, categories, authors, and issue/return tracking.</p>
        </div>
        {!isDemoMode && tab === 'books' && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateBook}>
            Add Book
          </Button>
        )}
      </div>

      {isDemoMode ? (
        <Card className="flex items-center gap-3 border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Demo Mode is sample-data only — library management connects to the live database and is disabled here.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            {(['books', 'issues'] as Tab[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {value === 'books' ? 'Books' : `Active Issues (${issues.length})`}
              </button>
            ))}
          </div>

          {tab === 'books' && (
            <Card className="overflow-x-auto">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading books…</p>
              ) : books.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No books yet. Add the first one.</p>
              ) : (
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium">Title</th>
                      <th className="py-2 pr-4 font-medium">Category</th>
                      <th className="py-2 pr-4 font-medium">Author</th>
                      <th className="py-2 pr-4 font-medium">Available</th>
                      <th className="py-2 pr-0 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
                          {book.isbn && <p className="text-xs text-gray-400">ISBN {book.isbn}</p>}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{book.category?.name ?? '—'}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{book.author?.name ?? '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={book.availableQuantity > 0 ? 'success' : 'danger'}>
                            {book.availableQuantity} / {book.totalQuantity}
                          </Badge>
                        </td>
                        <td className="py-3 pr-0 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              disabled={book.availableQuantity < 1}
                              onClick={() => openIssueModal(book)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                            >
                              Issue
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(book)}
                              aria-label={`Delete ${book.title}`}
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'issues' && (
            <Card className="overflow-x-auto">
              {issues.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No active issues.</p>
              ) : (
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium">Book</th>
                      <th className="py-2 pr-4 font-medium">Borrower</th>
                      <th className="py-2 pr-4 font-medium">Due Date</th>
                      <th className="py-2 pr-0 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => {
                      const isOverdue = new Date(issue.dueDate).getTime() < new Date().getTime()
                      return (
                        <tr key={issue.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                          <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{issue.book.title}</td>
                          <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                            {issue.borrower.firstName} {issue.borrower.lastName}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={isOverdue ? 'danger' : 'secondary'}>
                              {new Date(issue.dueDate).toLocaleDateString()}
                            </Badge>
                          </td>
                          <td className="py-3 pr-0 text-right">
                            <button
                              type="button"
                              onClick={() => handleReturnBook(issue)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                            >
                              <Undo2 className="h-3.5 w-3.5" /> Return
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </Card>
          )}
        </>
      )}

      <Modal isOpen={isBookModalOpen} onClose={() => !isSaving && setIsBookModalOpen(false)} title="Add Book" size="md">
        <div className="space-y-4">
          <Input
            label="Title"
            value={bookForm.title}
            onChange={(event) => setBookForm((current) => ({ ...current, title: event.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="ISBN"
              value={bookForm.isbn}
              onChange={(event) => setBookForm((current) => ({ ...current, isbn: event.target.value }))}
            />
            <Input
              label="Published Year"
              type="number"
              value={bookForm.publishedYear}
              onChange={(event) => setBookForm((current) => ({ ...current, publishedYear: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <div className="flex gap-2">
              <select
                value={bookForm.categoryId}
                onChange={(event) => setBookForm((current) => ({ ...current, categoryId: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">None</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
              />
              <Button variant="outline" size="sm" onClick={handleAddCategory}>Add</Button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
            <select
              value={bookForm.authorId}
              onChange={(event) => setBookForm((current) => ({ ...current, authorId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="New author name"
                value={newAuthorName}
                onChange={(event) => setNewAuthorName(event.target.value)}
              />
              <Button variant="outline" size="sm" onClick={handleAddAuthor}>Add</Button>
            </div>
          </div>

          <Input
            label="Total Copies"
            type="number"
            min={1}
            value={bookForm.totalQuantity}
            onChange={(event) => setBookForm((current) => ({ ...current, totalQuantity: event.target.value }))}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsBookModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveBook} isLoading={isSaving}>
            Add Book
          </Button>
        </div>
      </Modal>

      <Modal isOpen={issueTarget !== null} onClose={() => !isSaving && setIssueTarget(null)} title={`Issue "${issueTarget?.title}"`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Borrower</label>
            <UserPicker schoolId={schoolId} roles={['STUDENT', 'TEACHER']} selected={borrower} onSelect={setBorrower} />
          </div>
          <Input label="Due Date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIssueTarget(null)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleIssueBook} isLoading={isSaving}>
            Issue Book
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Book"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDeleteBook}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
