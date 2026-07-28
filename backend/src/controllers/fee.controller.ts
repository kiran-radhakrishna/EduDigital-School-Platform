import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import { isParentOfStudent, resolveStudentId } from '../services/resolvers'
import * as feeService from '../services/fee.service'

function isPrivileged(req: Request): boolean {
  return req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
}

async function assertCanViewStudentFees(req: Request, studentUserId: string): Promise<void> {
  const isSelf = req.userId === studentUserId
  const isParent = req.userRole === 'PARENT' && req.userId && (await isParentOfStudent(req.userId, studentUserId))
  if (!isSelf && !isParent && !isPrivileged(req)) {
    throw new ForbiddenError('You do not have permission to view these fees.')
  }
}

export async function listFeeStructures(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const structures = await feeService.listFeeStructures(schoolId)
  res.status(200).json({ structures })
}

const createFeeStructureSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1),
  grade: z.string().optional(),
  amount: z.number().positive(),
  frequency: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUAL']).optional(),
  academicYearId: z.string().optional(),
})

export async function createFeeStructure(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createFeeStructureSchema, req.body)
  const structure = await feeService.createFeeStructure(input)
  res.status(201).json({ structure })
}

const generateInvoiceSchema = z.object({
  studentUserId: z.string().min(1),
  feeStructureId: z.string().min(1),
  dueDate: z.string().min(1),
})

export async function generateInvoice(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(generateInvoiceSchema, req.body)
  const studentId = await resolveStudentId(input.studentUserId)
  const invoice = await feeService.generateInvoice({
    studentId,
    feeStructureId: input.feeStructureId,
    dueDate: input.dueDate,
  })
  res.status(201).json({ invoice })
}

const generateBulkSchema = z.object({ feeStructureId: z.string().min(1), dueDate: z.string().min(1) })

export async function generateInvoicesForStructure(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(generateBulkSchema, req.body)
  const invoices = await feeService.generateInvoicesForStructure(input.feeStructureId, input.dueDate)
  res.status(201).json({ invoices })
}

export async function listInvoicesForStudent(req: Request, res: Response): Promise<void> {
  await assertCanViewStudentFees(req, req.params.id)
  const studentId = await resolveStudentId(req.params.id)
  const invoices = await feeService.listInvoicesForStudent(studentId)
  res.status(200).json({ invoices })
}

export async function listInvoicesForSchool(req: Request, res: Response): Promise<void> {
  const { schoolId, status } = parseOrThrow(
    z.object({
      schoolId: z.string().min(1),
      status: z.enum(['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']).optional(),
    }),
    req.query,
  )
  const invoices = await feeService.listInvoicesForSchool(schoolId, status)
  res.status(200).json({ invoices })
}

export async function getInvoiceById(req: Request, res: Response): Promise<void> {
  const invoice = await feeService.getInvoiceById(req.params.id)
  await assertCanViewStudentFees(req, invoice.student.user.id)
  res.status(200).json({ invoice })
}

const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  method: z.string().optional(),
})

export async function recordPayment(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(recordPaymentSchema, req.body)
  const invoice = await feeService.recordPayment({ ...input, receivedByUserId: req.userId })
  res.status(201).json({ invoice })
}

const createInstallmentsSchema = z.object({
  installments: z.array(z.object({ amount: z.number().positive(), dueDate: z.string().min(1) })).min(1),
})

export async function createInstallments(req: Request, res: Response): Promise<void> {
  const { installments } = parseOrThrow(createInstallmentsSchema, req.body)
  const invoice = await feeService.createInstallments({ invoiceId: req.params.id, installments })
  res.status(200).json({ invoice })
}

export async function payInstallment(req: Request, res: Response): Promise<void> {
  const invoice = await feeService.payInstallment(req.params.id, req.userId)
  res.status(200).json({ invoice })
}

const applyLateFineSchema = z.object({ lateFine: z.number().min(0) })

export async function applyLateFine(req: Request, res: Response): Promise<void> {
  const { lateFine } = parseOrThrow(applyLateFineSchema, req.body)
  const invoice = await feeService.applyLateFine(req.params.id, lateFine)
  res.status(200).json({ invoice })
}
