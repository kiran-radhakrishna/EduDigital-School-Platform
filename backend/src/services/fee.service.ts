import { randomBytes } from 'crypto'
import { prisma } from '../config/prisma'
import { NotFoundError, ConflictError } from '../utils/errors'

export async function listFeeStructures(schoolId: string) {
  return prisma.feeStructure.findMany({ where: { schoolId }, orderBy: { createdAt: 'desc' } })
}

export interface CreateFeeStructureInput {
  schoolId: string
  name: string
  grade?: string
  amount: number
  frequency?: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
  academicYearId?: string
}

export async function createFeeStructure(input: CreateFeeStructureInput) {
  return prisma.feeStructure.create({
    data: {
      schoolId: input.schoolId,
      name: input.name.trim(),
      grade: input.grade,
      amount: input.amount,
      frequency: input.frequency ?? 'ANNUAL',
      academicYearId: input.academicYearId,
    },
  })
}

const invoiceInclude = {
  feeStructure: true,
  payments: { orderBy: { paymentDate: 'desc' as const } },
  installments: { orderBy: { installmentNumber: 'asc' as const } },
  student: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
} as const

function computeStatus(totalDue: number, totalPaid: number, dueDate: Date): 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' {
  if (totalPaid >= totalDue) return 'PAID'
  if (totalPaid > 0) return 'PARTIALLY_PAID'
  return dueDate.getTime() < Date.now() ? 'OVERDUE' : 'PENDING'
}

async function syncInvoiceStatus(invoiceId: string) {
  const invoice = await prisma.feeInvoice.findUnique({ where: { id: invoiceId }, include: invoiceInclude })
  if (!invoice) return null

  const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
  const status = computeStatus(invoice.amount + invoice.lateFine, totalPaid, invoice.dueDate)
  if (status === invoice.status) return invoice

  return prisma.feeInvoice.update({ where: { id: invoiceId }, data: { status }, include: invoiceInclude })
}

export interface GenerateInvoiceInput {
  studentId: string
  feeStructureId: string
  dueDate: string
}

export async function generateInvoice(input: GenerateInvoiceInput) {
  const structure = await prisma.feeStructure.findUnique({ where: { id: input.feeStructureId } })
  if (!structure) throw new NotFoundError('Fee structure not found.')

  return prisma.feeInvoice.create({
    data: {
      studentId: input.studentId,
      feeStructureId: input.feeStructureId,
      amount: structure.amount,
      dueDate: new Date(input.dueDate),
    },
    include: invoiceInclude,
  })
}

/** Generates one invoice per student matching the structure's grade (or every student in the school if the structure has no grade). */
export async function generateInvoicesForStructure(feeStructureId: string, dueDate: string) {
  const structure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } })
  if (!structure) throw new NotFoundError('Fee structure not found.')

  const students = await prisma.student.findMany({
    where: { schoolId: structure.schoolId, ...(structure.grade ? { grade: structure.grade } : {}) },
    select: { id: true },
  })

  const created = await prisma.$transaction(
    students.map((student) =>
      prisma.feeInvoice.create({
        data: {
          studentId: student.id,
          feeStructureId,
          amount: structure.amount,
          dueDate: new Date(dueDate),
        },
      }),
    ),
  )

  return created
}

export async function listInvoicesForStudent(studentId: string) {
  const invoices = await prisma.feeInvoice.findMany({
    where: { studentId },
    include: invoiceInclude,
    orderBy: { dueDate: 'desc' },
  })
  return Promise.all(invoices.map((invoice) => syncInvoiceStatus(invoice.id)))
}

export async function listInvoicesForSchool(schoolId: string, status?: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE') {
  return prisma.feeInvoice.findMany({
    where: { student: { schoolId }, status },
    include: invoiceInclude,
    orderBy: { dueDate: 'asc' },
  })
}

export async function getInvoiceById(id: string) {
  const invoice = await syncInvoiceStatus(id)
  if (!invoice) throw new NotFoundError('Invoice not found.')
  return invoice
}

export interface RecordPaymentInput {
  invoiceId: string
  amount: number
  method?: string
  receivedByUserId?: string
}

function generateReceiptNumber(): string {
  return `RCPT-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`
}

export async function recordPayment(input: RecordPaymentInput) {
  const invoice = await prisma.feeInvoice.findUnique({ where: { id: input.invoiceId } })
  if (!invoice) throw new NotFoundError('Invoice not found.')
  if (invoice.status === 'PAID') throw new ConflictError('This invoice is already fully paid.')

  await prisma.feePayment.create({
    data: {
      invoiceId: input.invoiceId,
      amount: input.amount,
      method: input.method ?? 'CASH',
      receiptNumber: generateReceiptNumber(),
      receivedByUserId: input.receivedByUserId,
    },
  })

  return syncInvoiceStatus(input.invoiceId)
}

export interface CreateInstallmentsInput {
  invoiceId: string
  installments: Array<{ amount: number; dueDate: string }>
}

export async function createInstallments(input: CreateInstallmentsInput) {
  await prisma.feeInstallment.deleteMany({ where: { invoiceId: input.invoiceId } })
  await prisma.feeInstallment.createMany({
    data: input.installments.map((installment, index) => ({
      invoiceId: input.invoiceId,
      installmentNumber: index + 1,
      amount: installment.amount,
      dueDate: new Date(installment.dueDate),
    })),
  })
  return getInvoiceById(input.invoiceId)
}

export async function payInstallment(id: string, receivedByUserId?: string) {
  const installment = await prisma.feeInstallment.findUnique({ where: { id } })
  if (!installment) throw new NotFoundError('Installment not found.')
  if (installment.status === 'PAID') throw new ConflictError('This installment has already been paid.')

  await prisma.feeInstallment.update({ where: { id }, data: { status: 'PAID', paidAt: new Date() } })
  await recordPayment({ invoiceId: installment.invoiceId, amount: installment.amount, receivedByUserId })
  return getInvoiceById(installment.invoiceId)
}

export async function applyLateFine(invoiceId: string, lateFine: number) {
  await getInvoiceById(invoiceId)
  await prisma.feeInvoice.update({ where: { id: invoiceId }, data: { lateFine } })
  return syncInvoiceStatus(invoiceId)
}
