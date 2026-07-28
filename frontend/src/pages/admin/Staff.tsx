import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus, Sparkles, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { Badge } from '../../components/common/Badge'
import { UserPicker } from '../../components/common/UserPicker'
import { useAuth } from '../../hooks/useAuth'
import { staffApi, type StaffMember, type Department, type Designation, type LeaveRequest } from '../../services/staffApi'
import type { AdminUser } from '../../services/userApi'

type Tab = 'staff' | 'leave'

const STATUS_VARIANT: Record<StaffMember['status'], 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  TERMINATED: 'danger',
}

export default function AdminStaff() {
  const { user, isDemoMode } = useAuth()
  const schoolId = user?.schoolId ?? ''
  const [tab, setTab] = useState<Tab>('staff')

  const [staff, setStaff] = useState<StaffMember[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [departmentId, setDepartmentId] = useState('')
  const [designationId, setDesignationId] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [hireDate, setHireDate] = useState('')
  const [newDeptName, setNewDeptName] = useState('')
  const [newDesigName, setNewDesigName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null)

  const loadAll = () => {
    if (!schoolId) return
    setIsLoading(true)
    Promise.all([
      staffApi.listStaff(schoolId),
      staffApi.listDepartments(schoolId),
      staffApi.listDesignations(schoolId),
      staffApi.listLeaveRequests(schoolId, 'PENDING'),
    ])
      .then(([staffList, deptList, desigList, leaveList]) => {
        setStaff(staffList)
        setDepartments(deptList)
        setDesignations(desigList)
        setLeaveRequests(leaveList)
      })
      .catch(() => toast.error('Failed to load staff data.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (isDemoMode) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data hydration on mount / auth change
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, schoolId])

  const openCreateModal = () => {
    setSelectedUser(null)
    setDepartmentId('')
    setDesignationId('')
    setEmployeeCode('')
    setHireDate(new Date().toISOString().slice(0, 10))
    setIsModalOpen(true)
  }

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return
    try {
      const department = await staffApi.createDepartment(schoolId, newDeptName.trim())
      setDepartments((current) => [...current, department])
      setDepartmentId(department.id)
      setNewDeptName('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add department.')
    }
  }

  const handleAddDesignation = async () => {
    if (!newDesigName.trim()) return
    try {
      const designation = await staffApi.createDesignation(schoolId, newDesigName.trim())
      setDesignations((current) => [...current, designation])
      setDesignationId(designation.id)
      setNewDesigName('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add designation.')
    }
  }

  const handleSaveStaff = async () => {
    if (!selectedUser || !hireDate) {
      toast.error('Select a person and a hire date.')
      return
    }
    setIsSaving(true)
    try {
      const created = await staffApi.createStaff({
        userId: selectedUser.id,
        schoolId,
        departmentId: departmentId || undefined,
        designationId: designationId || undefined,
        employeeCode: employeeCode.trim() || undefined,
        hireDate,
      })
      setStaff((current) => [created, ...current])
      toast.success('Staff profile created.')
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create staff profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return
    try {
      await staffApi.deleteStaff(deleteTarget.id)
      setStaff((current) => current.filter((member) => member.id !== deleteTarget.id))
      toast.success('Staff profile removed.')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove staff profile.')
    }
  }

  const handleReview = async (request: LeaveRequest, status: 'APPROVED' | 'REJECTED') => {
    try {
      await staffApi.reviewLeaveRequest(request.id, status)
      setLeaveRequests((current) => current.filter((item) => item.id !== request.id))
      toast.success(`Leave request ${status.toLowerCase()}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to review leave request.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff & HR</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage staff profiles, departments, and leave requests.</p>
        </div>
        {!isDemoMode && tab === 'staff' && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Add Staff
          </Button>
        )}
      </div>

      {isDemoMode ? (
        <Card className="flex items-center gap-3 border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Demo Mode is sample-data only — staff management connects to the live database and is disabled here.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            {(['staff', 'leave'] as Tab[]).map((value) => (
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
                {value === 'staff' ? 'Staff' : `Pending Leave (${leaveRequests.length})`}
              </button>
            ))}
          </div>

          {tab === 'staff' && (
            <Card className="overflow-x-auto">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading staff…</p>
              ) : staff.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No staff profiles yet.</p>
              ) : (
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Department</th>
                      <th className="py-2 pr-4 font-medium">Designation</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-4 font-medium">Hired</th>
                      <th className="py-2 pr-0 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member) => (
                      <tr key={member.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900 dark:text-white">{member.user.firstName} {member.user.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.user.email}</p>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{member.department?.name ?? '—'}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{member.designation?.title ?? '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={STATUS_VARIANT[member.status]}>{member.status.replace('_', ' ')}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                          {new Date(member.hireDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-0 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(member)}
                            aria-label={`Remove ${member.user.firstName}`}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'leave' && (
            <Card className="overflow-x-auto">
              {leaveRequests.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No pending leave requests.</p>
              ) : (
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium">Staff</th>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 pr-4 font-medium">Dates</th>
                      <th className="py-2 pr-4 font-medium">Reason</th>
                      <th className="py-2 pr-0 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                          {request.staff ? `${request.staff.user.firstName} ${request.staff.user.lastName}` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{request.leaveType}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                          {new Date(request.startDate).toLocaleDateString()} – {new Date(request.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{request.reason ?? '—'}</td>
                        <td className="py-3 pr-0 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleReview(request, 'APPROVED')}
                              aria-label="Approve"
                              className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReview(request, 'REJECTED')}
                              aria-label="Reject"
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4" />
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
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title="Add Staff Profile" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Person</label>
            <UserPicker schoolId={schoolId} roles={['TEACHER', 'ADMINISTRATOR', 'AUTHORITY']} selected={selectedUser} onSelect={setSelectedUser} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <Input placeholder="New department name" value={newDeptName} onChange={(event) => setNewDeptName(event.target.value)} />
              <Button variant="outline" size="sm" onClick={handleAddDepartment}>Add</Button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
            <select
              value={designationId}
              onChange={(event) => setDesignationId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {designations.map((designation) => (
                <option key={designation.id} value={designation.id}>{designation.title}</option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <Input placeholder="New designation title" value={newDesigName} onChange={(event) => setNewDesigName(event.target.value)} />
              <Button variant="outline" size="sm" onClick={handleAddDesignation}>Add</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Employee Code" value={employeeCode} onChange={(event) => setEmployeeCode(event.target.value)} />
            <Input label="Hire Date" type="date" value={hireDate} onChange={(event) => setHireDate(event.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveStaff} isLoading={isSaving}>
            Add Staff
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Remove Staff Profile"
        message={`Remove the staff profile for "${deleteTarget?.user.firstName} ${deleteTarget?.user.lastName}"? This cannot be undone.`}
        onConfirm={handleDeleteStaff}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
