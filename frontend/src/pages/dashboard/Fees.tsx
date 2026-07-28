import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'
import { feeApi, type FeeInvoice } from '../../services/feeApi'
import { parentApi, type ParentChild } from '../../services/parentApi'

const STATUS_VARIANT: Record<FeeInvoice['status'], 'success' | 'warning' | 'danger' | 'info'> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  PENDING: 'info',
  OVERDUE: 'danger',
}

const DEMO_INVOICES = [
  { id: 'demo-1', name: 'Annual Tuition', amount: 1200, dueDate: '2026-09-01', status: 'PAID' as const, balance: 0 },
  { id: 'demo-2', name: 'Lab Fee', amount: 150, dueDate: '2026-08-15', status: 'PENDING' as const, balance: 150 },
]

function balanceDue(invoice: FeeInvoice): number {
  return invoice.amount + invoice.lateFine - invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
}

function FeesTable({ invoices, heading }: { invoices: Array<{ id: string; name: string; amount: number; dueDate: string; status: FeeInvoice['status']; balance: number }>; heading: string }) {
  return (
    <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mb-4 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{heading}</h1>
      </div>
      {invoices.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No fee invoices yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-gray-800">
                <th className="py-2 pr-4 font-medium">Fee</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Due Date</th>
                <th className="py-2 pr-4 font-medium">Balance</th>
                <th className="py-2 pr-0 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{invoice.name}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">${invoice.amount.toFixed(2)}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">${invoice.balance.toFixed(2)}</td>
                  <td className="py-3 pr-0">
                    <Badge variant={STATUS_VARIANT[invoice.status]}>{invoice.status.replace('_', ' ')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function StudentFeesView({ studentUserId }: { studentUserId: string }) {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    feeApi
      .listInvoicesForStudent(studentUserId)
      .then((list) => {
        if (!cancelled) setInvoices(list)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load fees.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [studentUserId])

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading fees…</p>
      </Card>
    )
  }

  return (
    <FeesTable
      heading="My Fees"
      invoices={invoices.map((invoice) => ({
        id: invoice.id,
        name: invoice.feeStructure.name,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        status: invoice.status,
        balance: balanceDue(invoice),
      }))}
    />
  )
}

function ParentFeesView({ parentUserId }: { parentUserId: string }) {
  const [children, setChildren] = useState<ParentChild[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)

  useEffect(() => {
    let cancelled = false
    parentApi
      .getChildren(parentUserId)
      .then((list) => {
        if (cancelled) return
        setChildren(list)
        if (list.length > 0) setSelectedChildId(list[0].id)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load children.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChildren(false)
      })
    return () => {
      cancelled = true
    }
  }, [parentUserId])

  if (isLoadingChildren) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      </Card>
    )
  }

  if (children.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">No children linked to your account yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {children.length > 1 && (
        <Card className="border border-gray-200/70 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Viewing fees for</label>
          <select
            value={selectedChildId}
            onChange={(event) => setSelectedChildId(event.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </Card>
      )}
      {selectedChildId && <StudentFeesView studentUserId={selectedChildId} />}
    </div>
  )
}

export default function Fees() {
  const { user, isDemoMode } = useAuth()

  const demoView = useMemo(
    () => <FeesTable heading="My Fees" invoices={DEMO_INVOICES.map((invoice) => ({ ...invoice, balance: invoice.balance }))} />,
    [],
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {isDemoMode || !user
        ? demoView
        : user.role === 'parent'
          ? <ParentFeesView parentUserId={user.id} />
          : <StudentFeesView studentUserId={user.id} />}
    </motion.div>
  )
}
