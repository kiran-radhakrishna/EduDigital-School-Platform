import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CircleDollarSign, Clock, Plus, Sparkles, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { Badge } from '../../components/common/Badge'
import { StatCard } from '../../components/common/StatCard'
import { UserPicker } from '../../components/common/UserPicker'
import { useAuth } from '../../hooks/useAuth'
import { feeApi, type FeeStructure, type FeeInvoice } from '../../services/feeApi'
import { analyticsApi, type FinanceAnalytics } from '../../services/analyticsApi'
import type { AdminUser } from '../../services/userApi'

type Tab = 'structures' | 'invoices'

const STATUS_VARIANT: Record<FeeInvoice['status'], 'success' | 'warning' | 'danger' | 'info'> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  PENDING: 'info',
  OVERDUE: 'danger',
}

const EMPTY_STRUCTURE_FORM = { name: '', grade: '', amount: '', frequency: 'ANNUAL' as FeeStructure['frequency'] }

export default function AdminFees() {
  const { user, isDemoMode } = useAuth()
  const schoolId = user?.schoolId ?? ''
  const [tab, setTab] = useState<Tab>('structures')

  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [invoices, setInvoices] = useState<FeeInvoice[]>([])
  const [finance, setFinance] = useState<FinanceAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false)
  const [structureForm, setStructureForm] = useState(EMPTY_STRUCTURE_FORM)
  const [isSaving, setIsSaving] = useState(false)

  const [generateTarget, setGenerateTarget] = useState<FeeStructure | null>(null)
  const [generateDueDate, setGenerateDueDate] = useState('')

  const [invoiceStudent, setInvoiceStudent] = useState<AdminUser | null>(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [invoiceStructureId, setInvoiceStructureId] = useState('')
  const [invoiceDueDate, setInvoiceDueDate] = useState('')

  const [paymentTarget, setPaymentTarget] = useState<FeeInvoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const loadAll = () => {
    if (!schoolId) return
    setIsLoading(true)
    Promise.all([feeApi.listStructures(schoolId), feeApi.listInvoicesForSchool(schoolId), analyticsApi.getMyFinanceAnalytics()])
      .then(([structureList, invoiceList, financeData]) => {
        setStructures(structureList)
        setInvoices(invoiceList)
        setFinance(financeData)
      })
      .catch(() => toast.error('Failed to load fee data.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (isDemoMode) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data hydration on mount / auth change
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, schoolId])

  const handleSaveStructure = async () => {
    if (!structureForm.name.trim() || !structureForm.amount) {
      toast.error('Name and amount are required.')
      return
    }
    setIsSaving(true)
    try {
      const structure = await feeApi.createStructure({
        schoolId,
        name: structureForm.name.trim(),
        grade: structureForm.grade.trim() || undefined,
        amount: Number(structureForm.amount),
        frequency: structureForm.frequency,
      })
      setStructures((current) => [structure, ...current])
      toast.success('Fee structure created.')
      setIsStructureModalOpen(false)
      setStructureForm(EMPTY_STRUCTURE_FORM)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create fee structure.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateBulk = async () => {
    if (!generateTarget || !generateDueDate) {
      toast.error('Pick a due date.')
      return
    }
    setIsSaving(true)
    try {
      const created = await feeApi.generateInvoicesForStructure(generateTarget.id, generateDueDate)
      toast.success(`Generated ${created.length} invoice(s).`)
      setGenerateTarget(null)
      loadAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate invoices.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateSingle = async () => {
    if (!invoiceStudent || !invoiceStructureId || !invoiceDueDate) {
      toast.error('Select a student, fee structure, and due date.')
      return
    }
    setIsSaving(true)
    try {
      await feeApi.generateInvoice(invoiceStudent.id, invoiceStructureId, invoiceDueDate)
      toast.success('Invoice generated.')
      setIsInvoiceModalOpen(false)
      loadAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate invoice.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!paymentTarget || !paymentAmount) {
      toast.error('Enter a payment amount.')
      return
    }
    setIsSaving(true)
    try {
      await feeApi.recordPayment(paymentTarget.id, Number(paymentAmount))
      toast.success('Payment recorded.')
      setPaymentTarget(null)
      setPaymentAmount('')
      loadAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to record payment.')
    } finally {
      setIsSaving(false)
    }
  }

  const balanceDue = (invoice: FeeInvoice) =>
    invoice.amount + invoice.lateFine - invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create fee structures, generate invoices, and record payments.</p>
        </div>
        {!isDemoMode && (
          <div className="flex gap-2">
            {tab === 'structures' && (
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsStructureModalOpen(true)}>
                New Fee Structure
              </Button>
            )}
            {tab === 'invoices' && (
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsInvoiceModalOpen(true)}>
                Generate Invoice
              </Button>
            )}
          </div>
        )}
      </div>

      {isDemoMode ? (
        <Card className="flex items-center gap-3 border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Demo Mode is sample-data only — fee management connects to the live database and is disabled here.
          </p>
        </Card>
      ) : (
        <>
          {finance && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard icon={<CircleDollarSign size={20} />} title="Total Revenue" value={`$${finance.totalRevenue.toLocaleString()}`} />
              <StatCard icon={<Clock size={20} />} title="Pending Fees" value={`$${finance.pendingFees.toLocaleString()}`} />
              <StatCard icon={<Wallet size={20} />} title="Paid Fees" value={`$${finance.paidFees.toLocaleString()}`} />
            </div>
          )}

          {finance && (finance.monthlyCollections.length > 0 || finance.revenueByClass.length > 0) && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card title="Monthly Collections">
                <div className="space-y-2">
                  {finance.monthlyCollections.map((point) => (
                    <div key={point.month} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{point.month}</span>
                      <span className="font-medium text-gray-900 dark:text-white">${point.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {finance.monthlyCollections.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No collections recorded yet.</p>
                  )}
                </div>
              </Card>
              <Card title="Revenue by Class">
                <div className="space-y-2">
                  {finance.revenueByClass.map((point) => (
                    <div key={point.className} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{point.className}</span>
                      <span className="font-medium text-gray-900 dark:text-white">${point.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {finance.revenueByClass.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No revenue recorded yet.</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          <div className="flex gap-2">
            {(['structures', 'invoices'] as Tab[]).map((value) => (
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
                {value === 'structures' ? 'Fee Structures' : 'Invoices'}
              </button>
            ))}
          </div>

          {tab === 'structures' && (
            <Card className="overflow-x-auto">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading fee structures…</p>
              ) : structures.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No fee structures yet.</p>
              ) : (
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Grade</th>
                      <th className="py-2 pr-4 font-medium">Amount</th>
                      <th className="py-2 pr-4 font-medium">Frequency</th>
                      <th className="py-2 pr-0 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.map((structure) => (
                      <tr key={structure.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{structure.name}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{structure.grade ?? 'All grades'}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">${structure.amount.toFixed(2)}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{structure.frequency}</td>
                        <td className="py-3 pr-0 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setGenerateTarget(structure)
                              setGenerateDueDate('')
                            }}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                          >
                            Generate for Grade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'invoices' && (
            <Card className="overflow-x-auto">
              {invoices.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No invoices yet.</p>
              ) : (
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium">Student</th>
                      <th className="py-2 pr-4 font-medium">Fee</th>
                      <th className="py-2 pr-4 font-medium">Due</th>
                      <th className="py-2 pr-4 font-medium">Balance</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-0 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                          {invoice.student.user.firstName} {invoice.student.user.lastName}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{invoice.feeStructure.name}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">${balanceDue(invoice).toFixed(2)}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={STATUS_VARIANT[invoice.status]}>{invoice.status.replace('_', ' ')}</Badge>
                        </td>
                        <td className="py-3 pr-0 text-right">
                          {invoice.status !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentTarget(invoice)
                                setPaymentAmount(balanceDue(invoice).toFixed(2))
                              }}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                            >
                              Record Payment
                            </button>
                          )}
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

      <Modal isOpen={isStructureModalOpen} onClose={() => !isSaving && setIsStructureModalOpen(false)} title="New Fee Structure" size="sm">
        <div className="space-y-4">
          <Input
            label="Name"
            value={structureForm.name}
            onChange={(event) => setStructureForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="e.g. Annual Tuition"
          />
          <Input
            label="Grade (optional)"
            value={structureForm.grade}
            onChange={(event) => setStructureForm((current) => ({ ...current, grade: event.target.value }))}
            placeholder="Leave blank to apply to all grades"
          />
          <Input
            label="Amount"
            type="number"
            min={0}
            value={structureForm.amount}
            onChange={(event) => setStructureForm((current) => ({ ...current, amount: event.target.value }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
            <select
              value={structureForm.frequency}
              onChange={(event) => setStructureForm((current) => ({ ...current, frequency: event.target.value as FeeStructure['frequency'] }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUAL'] as const).map((value) => (
                <option key={value} value={value}>{value.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsStructureModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveStructure} isLoading={isSaving}>
            Create
          </Button>
        </div>
      </Modal>

      <Modal isOpen={generateTarget !== null} onClose={() => !isSaving && setGenerateTarget(null)} title={`Generate Invoices — ${generateTarget?.name}`} size="sm">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Creates one invoice for every student {generateTarget?.grade ? `in grade ${generateTarget.grade}` : 'in the school'}.
        </p>
        <Input label="Due Date" type="date" value={generateDueDate} onChange={(event) => setGenerateDueDate(event.target.value)} />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setGenerateTarget(null)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleGenerateBulk} isLoading={isSaving}>
            Generate
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isInvoiceModalOpen} onClose={() => !isSaving && setIsInvoiceModalOpen(false)} title="Generate Invoice" size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Student</label>
            <UserPicker schoolId={schoolId} roles={['STUDENT']} selected={invoiceStudent} onSelect={setInvoiceStudent} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Fee Structure</label>
            <select
              value={invoiceStructureId}
              onChange={(event) => setInvoiceStructureId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Select…</option>
              {structures.map((structure) => (
                <option key={structure.id} value={structure.id}>{structure.name} (${structure.amount})</option>
              ))}
            </select>
          </div>
          <Input label="Due Date" type="date" value={invoiceDueDate} onChange={(event) => setInvoiceDueDate(event.target.value)} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsInvoiceModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleGenerateSingle} isLoading={isSaving}>
            Generate
          </Button>
        </div>
      </Modal>

      <Modal isOpen={paymentTarget !== null} onClose={() => !isSaving && setPaymentTarget(null)} title="Record Payment" size="sm">
        <Input label="Amount" type="number" min={0} value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setPaymentTarget(null)} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleRecordPayment} isLoading={isSaving}>
            Record Payment
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
