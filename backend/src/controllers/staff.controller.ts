import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError, NotFoundError } from '../utils/errors'
import * as staffService from '../services/staff.service'

function isPrivileged(req: Request): boolean {
  return req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
}

export async function listDepartments(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const departments = await staffService.listDepartments(schoolId)
  res.status(200).json({ departments })
}

export async function createDepartment(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(z.object({ schoolId: z.string().min(1), name: z.string().min(1) }), req.body)
  const department = await staffService.createDepartment(input.schoolId, input.name)
  res.status(201).json({ department })
}

export async function listDesignations(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(z.object({ schoolId: z.string().min(1) }), req.query)
  const designations = await staffService.listDesignations(schoolId)
  res.status(200).json({ designations })
}

export async function createDesignation(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(z.object({ schoolId: z.string().min(1), title: z.string().min(1) }), req.body)
  const designation = await staffService.createDesignation(input.schoolId, input.title)
  res.status(201).json({ designation })
}

export async function listStaff(req: Request, res: Response): Promise<void> {
  const { schoolId, departmentId } = parseOrThrow(
    z.object({ schoolId: z.string().min(1), departmentId: z.string().optional() }),
    req.query,
  )
  const staff = await staffService.listStaff(schoolId, departmentId)
  res.status(200).json({ staff })
}

async function assertCanViewStaff(req: Request, staff: { userId: string }): Promise<void> {
  if (isPrivileged(req)) return
  if (req.userId === staff.userId) return
  throw new ForbiddenError('You do not have permission to view this staff profile.')
}

export async function getStaffById(req: Request, res: Response): Promise<void> {
  const staff = await staffService.getStaffById(req.params.id)
  await assertCanViewStaff(req, staff)
  res.status(200).json({ staff })
}

export async function getMyStaffProfile(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new ForbiddenError()
  const staff = await staffService.getStaffByUserId(req.userId)
  if (!staff) throw new NotFoundError('No staff profile found for this account.')
  res.status(200).json({ staff })
}

const createStaffSchema = z.object({
  userId: z.string().min(1),
  schoolId: z.string().min(1),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  employeeCode: z.string().optional(),
  hireDate: z.string().min(1),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
})

export async function createStaff(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createStaffSchema, req.body)
  const staff = await staffService.createStaff(input)
  res.status(201).json({ staff })
}

const updateStaffSchema = z.object({
  departmentId: z.string().nullable().optional(),
  designationId: z.string().nullable().optional(),
  employeeCode: z.string().optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
})

export async function updateStaff(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(updateStaffSchema, req.body)
  const staff = await staffService.updateStaff(req.params.id, input)
  res.status(200).json({ staff })
}

export async function deleteStaff(req: Request, res: Response): Promise<void> {
  await staffService.deleteStaff(req.params.id)
  res.status(204).send()
}

const createLeaveRequestSchema = z.object({
  staffId: z.string().min(1),
  leaveType: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().optional(),
})

export async function createLeaveRequest(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createLeaveRequestSchema, req.body)
  const staff = await staffService.getStaffById(input.staffId)
  await assertCanViewStaff(req, staff)
  const request = await staffService.createLeaveRequest(input)
  res.status(201).json({ request })
}

export async function listLeaveRequests(req: Request, res: Response): Promise<void> {
  const { schoolId, status } = parseOrThrow(
    z.object({
      schoolId: z.string().min(1),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    }),
    req.query,
  )
  const requests = await staffService.listLeaveRequests(schoolId, status)
  res.status(200).json({ requests })
}

export async function listMyLeaveRequests(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new ForbiddenError()
  const staff = await staffService.getStaffByUserId(req.userId)
  if (!staff) throw new NotFoundError('No staff profile found for this account.')
  const requests = await staffService.listLeaveRequestsForStaff(staff.id)
  res.status(200).json({ requests })
}

const reviewLeaveRequestSchema = z.object({ status: z.enum(['APPROVED', 'REJECTED']) })

export async function reviewLeaveRequest(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new ForbiddenError()
  const { status } = parseOrThrow(reviewLeaveRequestSchema, req.body)
  const request = await staffService.reviewLeaveRequest(req.params.id, status, req.userId)
  res.status(200).json({ request })
}

export async function getLeaveBalances(req: Request, res: Response): Promise<void> {
  const { year } = parseOrThrow(z.object({ year: z.coerce.number().int() }), req.query)
  const staff = await staffService.getStaffById(req.params.staffId)
  await assertCanViewStaff(req, staff)
  const balances = await staffService.getLeaveBalances(req.params.staffId, year)
  res.status(200).json({ balances })
}

const setLeaveBalanceSchema = z.object({
  staffId: z.string().min(1),
  leaveType: z.string().min(1),
  year: z.number().int(),
  totalDays: z.number().int().min(0),
})

export async function setLeaveBalance(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(setLeaveBalanceSchema, req.body)
  const balance = await staffService.setLeaveBalance(input)
  res.status(200).json({ balance })
}
