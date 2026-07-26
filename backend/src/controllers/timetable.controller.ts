import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import { isParentOfStudent, isTeacherAssignedToClass } from '../services/resolvers'
import * as timetableService from '../services/timetable.service'

const DAY_VALUES = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const

async function assertCanManageClass(req: Request, classId: string): Promise<void> {
  if (req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY') return
  if (req.userRole === 'TEACHER' && req.userId && (await isTeacherAssignedToClass(req.userId, classId))) return
  throw new ForbiddenError('You are not assigned to this class.')
}

const createSlotSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherUserId: z.string().min(1),
  day: z.enum(DAY_VALUES),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  room: z.string().optional(),
})

export async function createSlot(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createSlotSchema, req.body)
  await assertCanManageClass(req, input.classId)

  const slot = await timetableService.createSlot(input)
  res.status(201).json({ slot })
}

const classQuerySchema = z.object({ classId: z.string().min(1) })

export async function getForClass(req: Request, res: Response): Promise<void> {
  const { classId } = parseOrThrow(classQuerySchema, req.query)
  await assertCanManageClass(req, classId)

  const slots = await timetableService.getTimetableForClass(classId)
  res.status(200).json({ slots })
}

export async function getForStudent(req: Request, res: Response): Promise<void> {
  const studentUserId = req.params.id
  const isSelf = req.userId === studentUserId
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
  const isParent =
    req.userRole === 'PARENT' && req.userId && (await isParentOfStudent(req.userId, studentUserId))

  if (!isSelf && !isPrivileged && !isParent) {
    throw new ForbiddenError('You do not have permission to view this timetable.')
  }

  const slots = await timetableService.getTimetableForStudent(studentUserId)
  res.status(200).json({ slots })
}

export async function getForTeacher(req: Request, res: Response): Promise<void> {
  const teacherUserId = req.params.id
  const isSelf = req.userId === teacherUserId
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'

  if (!isSelf && !isPrivileged) {
    throw new ForbiddenError('You do not have permission to view this timetable.')
  }

  const slots = await timetableService.getTimetableForTeacher(teacherUserId)
  res.status(200).json({ slots })
}
