import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import { isParentOfStudent, isTeacherAssignedToClass } from '../services/resolvers'
import * as attendanceService from '../services/attendance.service'

const STATUS_VALUES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const

async function assertCanManageClass(req: Request, classId: string): Promise<void> {
  if (req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY') return
  if (req.userRole === 'TEACHER' && req.userId && (await isTeacherAssignedToClass(req.userId, classId))) return
  throw new ForbiddenError('You are not assigned to this class.')
}

const recordSchema = z.object({
  classId: z.string().min(1),
  date: z.string().min(1),
  entries: z
    .array(
      z.object({
        studentUserId: z.string().min(1),
        status: z.enum(STATUS_VALUES),
        reason: z.string().optional(),
      }),
    )
    .min(1),
})

export async function record(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(recordSchema, req.body)
  await assertCanManageClass(req, input.classId)

  const records = await attendanceService.recordAttendance(
    input.classId,
    input.date,
    input.entries,
    req.userRole === 'TEACHER' ? req.userId : undefined,
  )
  res.status(200).json({ records })
}

const classQuerySchema = z.object({ classId: z.string().min(1), date: z.string().min(1) })

export async function getForClass(req: Request, res: Response): Promise<void> {
  const { classId, date } = parseOrThrow(classQuerySchema, req.query)
  await assertCanManageClass(req, classId)

  const records = await attendanceService.getAttendanceForClass(classId, date)
  res.status(200).json({ records })
}

async function assertCanViewStudent(req: Request, studentUserId: string): Promise<void> {
  const isSelf = req.userId === studentUserId
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
  const isParent = req.userRole === 'PARENT' && req.userId && (await isParentOfStudent(req.userId, studentUserId))
  if (!isSelf && !isPrivileged && !isParent) {
    throw new ForbiddenError('You do not have permission to view this attendance.')
  }
}

const rangeQuerySchema = z.object({ from: z.string().optional(), to: z.string().optional() })

export async function getForStudent(req: Request, res: Response): Promise<void> {
  await assertCanViewStudent(req, req.params.id)
  const range = parseOrThrow(rangeQuerySchema, req.query)
  const records = await attendanceService.getStudentAttendance(req.params.id, range)
  res.status(200).json({ records })
}

export async function getSummaryForStudent(req: Request, res: Response): Promise<void> {
  await assertCanViewStudent(req, req.params.id)
  const range = parseOrThrow(rangeQuerySchema, req.query)
  const summary = await attendanceService.getStudentAttendanceSummary(req.params.id, range)
  res.status(200).json({ summary })
}
