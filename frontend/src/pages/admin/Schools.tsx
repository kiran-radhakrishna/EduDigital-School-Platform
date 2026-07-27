import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import { schoolApi, type School } from '../../services/schoolApi'

interface SchoolFormState {
  name: string
  city: string
  country: string
}

const EMPTY_FORM: SchoolFormState = { name: '', city: '', country: '' }

export default function AdminSchools() {
  const { isDemoMode } = useAuth()
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [form, setForm] = useState<SchoolFormState>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isDemoMode) return

    let cancelled = false
    schoolApi
      .list()
      .then((items) => {
        if (!cancelled) setSchools(items)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load schools.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isDemoMode])

  const openCreateModal = () => {
    setEditingSchool(null)
    setForm(EMPTY_FORM)
    setIsModalOpen(true)
  }

  const openEditModal = (school: School) => {
    setEditingSchool(school)
    setForm({ name: school.name, city: school.city ?? '', country: school.country ?? '' })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('School name is required.')
      return
    }

    setIsSaving(true)
    try {
      const input = {
        name: form.name.trim(),
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
      }

      if (editingSchool) {
        const updated = await schoolApi.update(editingSchool.id, input)
        setSchools((current) => current.map((school) => (school.id === updated.id ? updated : school)))
        toast.success('School updated.')
      } else {
        const created = await schoolApi.create(input)
        setSchools((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
        toast.success('School created.')
      }
      setIsModalOpen(false)
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
      await schoolApi.remove(deleteTarget.id)
      setSchools((current) => current.filter((school) => school.id !== deleteTarget.id))
      toast.success('School deleted.')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete school.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schools</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage the schools on this platform.</p>
        </div>
        {!isDemoMode && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Add School
          </Button>
        )}
      </div>

      {isDemoMode ? (
        <Card className="flex items-center gap-3 border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Demo Mode is sample-data only — school management connects to the live database and is disabled here.
          </p>
        </Card>
      ) : isLoading ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading schools…</p>
        </Card>
      ) : schools.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">No schools yet. Create the first one to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <Card key={school.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{school.name}</p>
                    {(school.city || school.country) && (
                      <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        {[school.city, school.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => openEditModal(school)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(school)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSchool ? 'Edit School' : 'Add School'} size="sm">
        <div className="space-y-4">
          <Input
            label="School Name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="e.g. Deggendorf International School"
          />
          <Input
            label="City"
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={closeModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSaving}>
            {editingSchool ? 'Save Changes' : 'Create School'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete School"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
