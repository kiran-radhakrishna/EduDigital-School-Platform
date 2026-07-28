import { prisma } from '../config/prisma'
import { ConflictError, NotFoundError } from '../utils/errors'
import { safeUserSelect } from './resolvers'

export async function listDepartments(schoolId: string) {
  return prisma.department.findMany({ where: { schoolId }, orderBy: { name: 'asc' } })
}

export async function createDepartment(schoolId: string, name: string) {
  const existing = await prisma.department.findFirst({ where: { schoolId, name } })
  if (existing) throw new ConflictError('A department with this name already exists.')
  return prisma.department.create({ data: { schoolId, name: name.trim() } })
}

export async function listDesignations(schoolId: string) {
  return prisma.designation.findMany({ where: { schoolId }, orderBy: { title: 'asc' } })
}

export async function createDesignation(schoolId: string, title: string) {
  const existing = await prisma.designation.findFirst({ where: { schoolId, title } })
  if (existing) throw new ConflictError('A designation with this title already exists.')
  return prisma.designation.create({ data: { schoolId, title: title.trim() } })
}

const staffInclude = {
  user: { select: safeUserSelect },
  department: true,
  designation: true,
} as const

export async function listStaff(schoolId: string, departmentId?: string) {
  return prisma.staff.findMany({
    where: { schoolId, departmentId },
    include: staffInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getStaffById(id: string) {
  const staff = await prisma.staff.findUnique({ where: { id }, include: staffInclude })
  if (!staff) throw new NotFoundError('Staff record not found.')
  return staff
}

export async function getStaffByUserId(userId: string) {
  return prisma.staff.findUnique({ where: { userId }, include: staffInclude })
}

export interface CreateStaffInput {
  userId: string
  schoolId: string
  departmentId?: string
  designationId?: string
  employeeCode?: string
  hireDate: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export async function createStaff(input: CreateStaffInput) {
  const existing = await prisma.staff.findUnique({ where: { userId: input.userId } })
  if (existing) throw new ConflictError('This user already has a staff profile.')

  return prisma.staff.create({
    data: {
      userId: input.userId,
      schoolId: input.schoolId,
      departmentId: input.departmentId,
      designationId: input.designationId,
      employeeCode: input.employeeCode,
      hireDate: new Date(input.hireDate),
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
    },
    include: staffInclude,
  })
}

export interface UpdateStaffInput {
  departmentId?: string | null
  designationId?: string | null
  employeeCode?: string
  status?: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED'
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export async function updateStaff(id: string, input: UpdateStaffInput) {
  await getStaffById(id)
  return prisma.staff.update({ where: { id }, data: input, include: staffInclude })
}

export async function deleteStaff(id: string) {
  await getStaffById(id)
  await prisma.staff.delete({ where: { id } })
}

// ─── Leave management ────────────────────────────────────────────────────

export interface CreateLeaveRequestInput {
  staffId: string
  leaveType: string
  startDate: string
  endDate: string
  reason?: string
}

export async function createLeaveRequest(input: CreateLeaveRequestInput) {
  await getStaffById(input.staffId)
  return prisma.leaveRequest.create({
    data: {
      staffId: input.staffId,
      leaveType: input.leaveType,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      reason: input.reason,
    },
  })
}

export async function listLeaveRequests(schoolId: string, status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  return prisma.leaveRequest.findMany({
    where: { staff: { schoolId }, status },
    include: { staff: { include: staffInclude } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function listLeaveRequestsForStaff(staffId: string) {
  return prisma.leaveRequest.findMany({ where: { staffId }, orderBy: { createdAt: 'desc' } })
}

function daysBetween(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
}

export async function reviewLeaveRequest(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedByUserId: string,
) {
  const request = await prisma.leaveRequest.findUnique({ where: { id } })
  if (!request) throw new NotFoundError('Leave request not found.')
  if (request.status !== 'PENDING') throw new ConflictError('This leave request has already been reviewed.')

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status, reviewedByUserId, reviewedAt: new Date() },
  })

  if (status === 'APPROVED') {
    const year = request.startDate.getFullYear()
    const usedDays = daysBetween(request.startDate, request.endDate)
    await prisma.leaveBalance.upsert({
      where: { staffId_leaveType_year: { staffId: request.staffId, leaveType: request.leaveType, year } },
      update: { usedDays: { increment: usedDays } },
      create: { staffId: request.staffId, leaveType: request.leaveType, year, totalDays: 0, usedDays },
    })
  }

  return updated
}

export async function getLeaveBalances(staffId: string, year: number) {
  return prisma.leaveBalance.findMany({ where: { staffId, year } })
}

export interface SetLeaveBalanceInput {
  staffId: string
  leaveType: string
  year: number
  totalDays: number
}

export async function setLeaveBalance(input: SetLeaveBalanceInput) {
  return prisma.leaveBalance.upsert({
    where: { staffId_leaveType_year: { staffId: input.staffId, leaveType: input.leaveType, year: input.year } },
    update: { totalDays: input.totalDays },
    create: { staffId: input.staffId, leaveType: input.leaveType, year: input.year, totalDays: input.totalDays },
  })
}
