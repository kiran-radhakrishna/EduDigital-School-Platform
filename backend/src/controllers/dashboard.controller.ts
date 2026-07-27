import type { Request, Response } from 'express'
import { ForbiddenError } from '../utils/errors'
import { isParentOfStudent } from '../services/resolvers'
import * as academicService from '../services/academic.service'
import * as dashboardService from '../services/dashboard.service'

function isPrivileged(req: Request): boolean {
  return req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
}

async function assertCanViewStudent(req: Request, studentUserId: string): Promise<void> {
  const isSelf = req.userId === studentUserId
  const isParent = req.userRole === 'PARENT' && req.userId && (await isParentOfStudent(req.userId, studentUserId))
  if (!isSelf && !isParent && !isPrivileged(req)) {
    throw new ForbiddenError('You do not have permission to view this dashboard.')
  }
}

export async function getStudentDashboard(req: Request, res: Response): Promise<void> {
  await assertCanViewStudent(req, req.params.id)
  const dashboard = await dashboardService.getStudentDashboard(req.params.id)
  res.status(200).json({ dashboard })
}

function assertCanViewTeacher(req: Request, teacherUserId: string): void {
  const isSelf = req.userId === teacherUserId
  if (!isSelf && !isPrivileged(req)) {
    throw new ForbiddenError('You do not have permission to view this dashboard.')
  }
}

export async function getTeacherDashboard(req: Request, res: Response): Promise<void> {
  assertCanViewTeacher(req, req.params.id)
  const dashboard = await dashboardService.getTeacherDashboard(req.params.id)
  res.status(200).json({ dashboard })
}

export async function getAssignedStudents(req: Request, res: Response): Promise<void> {
  assertCanViewTeacher(req, req.params.id)
  const students = await academicService.getAssignedStudents(req.params.id)
  res.status(200).json({ students })
}

export async function getParentDashboard(req: Request, res: Response): Promise<void> {
  const isSelf = req.userId === req.params.id
  if (!isSelf && !isPrivileged(req)) {
    throw new ForbiddenError('You do not have permission to view this dashboard.')
  }

  const dashboard = await dashboardService.getParentDashboard(req.params.id)
  res.status(200).json({ dashboard })
}
