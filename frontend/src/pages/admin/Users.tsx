import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Avatar } from '../../components/common/Avatar'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { schoolApi, type School } from '../../services/schoolApi'
import {
  userApi,
  type AdminRole,
  type AdminUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '../../services/userApi'

const ROLE_TABS: Array<{ label: string; value: AdminRole | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Students', value: 'STUDENT' },
  { label: 'Teachers', value: 'TEACHER' },
  { label: 'Parents', value: 'PARENT' },
  { label: 'Authorities', value: 'AUTHORITY' },
  { label: 'Administrators', value: 'ADMINISTRATOR' },
]

const ROLE_BADGE_VARIANT: Record<AdminUser['role'], 'primary' | 'info' | 'secondary' | 'success'> = {
  student: 'primary',
  teacher: 'info',
  parent: 'secondary',
  admin: 'success',
}

const PAGE_SIZE = 10

interface UserFormState {
  firstName: string
  lastName: string
  email: string
  password: string
  role: AdminRole
  schoolId: string
  grade: string
  rollNumber: string
  dateOfBirth: string
  subject: string
  phone: string
  title: string
}

const EMPTY_FORM: UserFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'STUDENT',
  schoolId: '',
  grade: '',
  rollNumber: '',
  dateOfBirth: '',
  subject: '',
  phone: '',
  title: '',
}

function roleLabel(role: AdminRole): string {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

export default function AdminUsers() {
  const { isDemoMode } = useAuth()
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'ALL'>('ALL')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [schoolFilter, setSchoolFilter] = useState('')
  const [page, setPage] = useState(1)

  const [schools, setSchools] = useState<School[]>([])
  const [result, setResult] = useState<{ items: AdminUser[]; total: number }>({ items: [], total: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isDemoMode) return
    const handle = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(handle)
  }, [searchInput, isDemoMode])

  useEffect(() => {
    if (isDemoMode) return
    void schoolApi.list().then(setSchools).catch(() => {})
  }, [isDemoMode])

  const currentListParams = () => ({
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    schoolId: schoolFilter || undefined,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  })

  /** Re-fetches with the current filters. Only call this from event handlers (post-mutation refresh) — the effect below owns the initial/filter-change fetch. */
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await userApi.list(currentListParams())
      setResult({ items: data.items, total: data.total })
    } catch {
      toast.error('Failed to load users.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isDemoMode) return

    let cancelled = false
    userApi
      .list(currentListParams())
      .then((data) => {
        if (!cancelled) setResult({ items: data.items, total: data.total })
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load users.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, schoolFilter, search, page, isDemoMode])

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE))

  const schoolNameById = useMemo(() => new Map(schools.map((school) => [school.id, school.name])), [schools])

  const openCreateModal = () => {
    setEditingUser(null)
    setForm({ ...EMPTY_FORM, role: roleFilter === 'ALL' ? 'STUDENT' : roleFilter })
    setIsModalOpen(true)
  }

  const openEditModal = (user: AdminUser) => {
    const backendRole = (
      user.role === 'admin' ? 'ADMINISTRATOR' : user.role.toUpperCase()
    ) as AdminRole
    setEditingUser(user)
    setForm({
      ...EMPTY_FORM,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: backendRole,
      schoolId: user.schoolId ?? '',
      grade: user.class ?? '',
      subject: user.subject ?? '',
      phone: user.phone ?? '',
      title: user.role === 'admin' ? '' : '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
  }

  const validateForm = (): string | null => {
    if (!editingUser) {
      if (!form.firstName.trim() || !form.lastName.trim()) return 'First and last name are required.'
      if (!form.email.trim()) return 'Email is required.'
      if (form.password.length < 6) return 'Password must be at least 6 characters.'
      if (form.role === 'STUDENT' && (!form.grade.trim() || !form.rollNumber.trim() || !form.dateOfBirth)) {
        return 'Grade, roll number, and date of birth are required for students.'
      }
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsSaving(true)
    try {
      if (editingUser) {
        const input: UpdateUserInput = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          schoolId: form.schoolId || null,
          ...(editingUser.role === 'student'
            ? { grade: form.grade.trim(), dateOfBirth: form.dateOfBirth || undefined }
            : {}),
          ...(editingUser.role === 'teacher' ? { subject: form.subject.trim() } : {}),
          ...(editingUser.role === 'parent' ? { phone: form.phone.trim() } : {}),
        }
        await userApi.update(editingUser.id, input)
        toast.success('User updated.')
      } else {
        const input: CreateUserInput = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          schoolId: form.schoolId || undefined,
          ...(form.role === 'STUDENT'
            ? { grade: form.grade.trim(), rollNumber: Number(form.rollNumber), dateOfBirth: form.dateOfBirth }
            : {}),
          ...(form.role === 'TEACHER' ? { subject: form.subject.trim() || undefined } : {}),
          ...(form.role === 'PARENT' ? { phone: form.phone.trim() || undefined } : {}),
          ...(form.role === 'AUTHORITY' || form.role === 'ADMINISTRATOR'
            ? { title: form.title.trim() || undefined }
            : {}),
        }
        await userApi.create(input)
        toast.success('User created.')
      }
      setIsModalOpen(false)
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await userApi.remove(deleteTarget.id)
      toast.success('User deleted.')
      setDeleteTarget(null)
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage students, teachers, parents, and staff accounts.
          </p>
        </div>
        {!isDemoMode && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Add User
          </Button>
        )}
      </div>

      {isDemoMode ? (
        <Card className="flex items-center gap-3 border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Demo Mode is sample-data only — user management connects to the live database and is disabled here.
          </p>
        </Card>
      ) : (
        <>
          <Card className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setRoleFilter(tab.value)
                    setPage(1)
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    roleFilter === tab.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  leftIcon={<Search className="h-4 w-4" />}
                  placeholder="Search by name or email…"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              <select
                value={schoolFilter}
                onChange={(event) => {
                  setSchoolFilter(event.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="">All Schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <Card className="overflow-x-auto">
            {isLoading ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading users…</p>
            ) : result.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</p>
            ) : (
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Role</th>
                    <th className="py-2 pr-4 font-medium">School</th>
                    <th className="py-2 pr-4 font-medium">Details</th>
                    <th className="py-2 pr-4 font-medium">Joined</th>
                    <th className="py-2 pr-0 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{user.role}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                        {user.schoolName ?? schoolNameById.get(user.schoolId ?? '') ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                        {user.class ?? user.subject ?? user.phone ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-0 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            aria-label={`Edit ${user.name}`}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            aria-label={`Delete ${user.name}`}
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

          {result.total > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <p>
                Page {page} of {totalPages} · {result.total} users
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Edit User' : 'Add User'} size="md">
        <div className="space-y-4">
          {!editingUser && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AdminRole }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {(['STUDENT', 'TEACHER', 'PARENT', 'AUTHORITY', 'ADMINISTRATOR'] as AdminRole[]).map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
            />
          </div>

          {!editingUser && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                helperText="Minimum 6 characters."
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">School</label>
            <select
              value={form.schoolId}
              onChange={(event) => setForm((current) => ({ ...current, schoolId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Unassigned</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {(editingUser ? editingUser.role === 'student' : form.role === 'STUDENT') && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Grade"
                value={form.grade}
                onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))}
                placeholder="e.g. 10-A"
              />
              {!editingUser && (
                <Input
                  label="Roll Number"
                  type="number"
                  value={form.rollNumber}
                  onChange={(event) => setForm((current) => ({ ...current, rollNumber: event.target.value }))}
                />
              )}
              <Input
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
              />
            </div>
          )}

          {(editingUser ? editingUser.role === 'teacher' : form.role === 'TEACHER') && (
            <Input
              label="Subject"
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            />
          )}

          {(editingUser ? editingUser.role === 'parent' : form.role === 'PARENT') && (
            <Input
              label="Phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
          )}

          {!editingUser && (form.role === 'AUTHORITY' || form.role === 'ADMINISTRATOR') && (
            <Input
              label="Title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Principal"
            />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={closeModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSaving}>
            {editingUser ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
