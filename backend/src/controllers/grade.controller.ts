import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import { isParentOfStudent, isTeacherAssignedToClass } from '../services/resolvers'
import * as gradeService from '../services/grade.service'

const GRADE_TYPES = ['ASSIGNMENT', 'EXAM', 'PROJECT', 'PARTICIPATION'] as const

async function assertCanManageClass(req: Request, classId: string): Promise<void> {
  if (req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY') return
  if (req.userRole === 'TEACHER' && req.userId && (await isTeacherAssignedToClass(req.userId, classId))) return
  throw new ForbiddenError('You are not assigned to this class.')
}

const recordSchema = z.object({
  studentUserId: z.string().min(1),
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  type: z.enum(GRADE_TYPES),
  title: z.string().min(1),
  score: z.number().nonnegative(),
  maxScore: z.number().positive(),
  date: z.string().min(1),
})

export async function record(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(recordSchema, req.body)
  await assertCanManageClass(req, input.classId)

  if (!req.userId) throw new ForbiddenError()
  const grade = await gradeService.recordGrade({ ...input, teacherUserId: req.userId })
  res.status(201).json({ grade })
}

const classQuerySchema = z.object({ classId: z.string().min(1), subjectId: z.string().optional() })

export async function listForClass(req: Request, res: Response): Promise<void> {
  const { classId, subjectId } = parseOrThrow(classQuerySchema, req.query)
  await assertCanManageClass(req, classId)

  const grades = await gradeService.listGradesForClass(classId, subjectId)
  res.status(200).json({ grades })
}

async function assertCanViewStudent(req: Request, studentUserId: string): Promise<void> {
  const isSelf = req.userId === studentUserId
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
  const isParent = req.userRole === 'PARENT' && req.userId && (await isParentOfStudent(req.userId, studentUserId))
  if (!isSelf && !isPrivileged && !isParent) {
    throw new ForbiddenError('You do not have permission to view these grades.')
  }
}

const studentQuerySchema = z.object({ subjectId: z.string().optional() })

export async function listForStudent(req: Request, res: Response): Promise<void> {
  await assertCanViewStudent(req, req.params.id)
  const { subjectId } = parseOrThrow(studentQuerySchema, req.query)
  const grades = await gradeService.listGradesForStudent(req.params.id, subjectId)
  res.status(200).json({ grades })
}

export async function getProgressReport(req: Request, res: Response): Promise<void> {
  await assertCanViewStudent(req, req.params.id)
  const report = await gradeService.getProgressReport(req.params.id)
  res.status(200).json({ report })
}
