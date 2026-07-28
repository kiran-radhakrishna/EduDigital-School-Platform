import { apiClient } from './apiClient'

export interface FeeStructure {
  id: string
  schoolId: string
  name: string
  grade?: string | null
  amount: number
  frequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
}

export interface FeePayment {
  id: string
  invoiceId: string
  amount: number
  method: string
  receiptNumber: string
  paymentDate: string
}

export interface FeeInstallment {
  id: string
  invoiceId: string
  installmentNumber: number
  amount: number
  dueDate: string
  status: 'PENDING' | 'PAID'
  paidAt?: string | null
}

export interface FeeInvoice {
  id: string
  studentId: string
  student: { id: string; user: { id: string; firstName: string; lastName: string } }
  feeStructureId: string
  feeStructure: FeeStructure
  amount: number
  lateFine: number
  dueDate: string
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'
  issuedAt: string
  payments: FeePayment[]
  installments: FeeInstallment[]
}

export interface CreateFeeStructureInput {
  schoolId: string
  name: string
  grade?: string
  amount: number
  frequency?: FeeStructure['frequency']
}

export const feeApi = {
  async listStructures(schoolId: string): Promise<FeeStructure[]> {
    const { data } = await apiClient.get<{ structures: FeeStructure[] }>('/fees/structures', { params: { schoolId } })
    return data.structures
  },
  async createStructure(input: CreateFeeStructureInput): Promise<FeeStructure> {
    const { data } = await apiClient.post<{ structure: FeeStructure }>('/fees/structures', input)
    return data.structure
  },
  async listInvoicesForSchool(schoolId: string, status?: FeeInvoice['status']): Promise<FeeInvoice[]> {
    const { data } = await apiClient.get<{ invoices: FeeInvoice[] }>('/fees/invoices', { params: { schoolId, status } })
    return data.invoices
  },
  async generateInvoice(studentUserId: string, feeStructureId: string, dueDate: string): Promise<FeeInvoice> {
    const { data } = await apiClient.post<{ invoice: FeeInvoice }>('/fees/invoices', { studentUserId, feeStructureId, dueDate })
    return data.invoice
  },
  async generateInvoicesForStructure(feeStructureId: string, dueDate: string): Promise<FeeInvoice[]> {
    const { data } = await apiClient.post<{ invoices: FeeInvoice[] }>('/fees/invoices/generate-bulk', {
      feeStructureId,
      dueDate,
    })
    return data.invoices
  },
  async listInvoicesForStudent(studentUserId: string): Promise<FeeInvoice[]> {
    const { data } = await apiClient.get<{ invoices: FeeInvoice[] }>(`/fees/students/${studentUserId}/invoices`)
    return data.invoices
  },
  async recordPayment(invoiceId: string, amount: number, method?: string): Promise<FeeInvoice> {
    const { data } = await apiClient.post<{ invoice: FeeInvoice }>('/fees/payments', { invoiceId, amount, method })
    return data.invoice
  },
  async applyLateFine(invoiceId: string, lateFine: number): Promise<FeeInvoice> {
    const { data } = await apiClient.patch<{ invoice: FeeInvoice }>(`/fees/invoices/${invoiceId}/late-fine`, { lateFine })
    return data.invoice
  },
}
