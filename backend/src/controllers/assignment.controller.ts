import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { ForbiddenError } from '../utils/errors'
import { isParentOfStudent, isTeacherAssignedToClass } from '../services/resolvers'
import * as assignmentService from '../services/assignment.service'

async function assertCanManageClass(req: Request, classId: string): Promise<void> {
  if (req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY') return
  if (req.userRole === 'TEACHER' && req.userId && (await isTeacherAssignedToClass(req.userId, classId))) return
  throw new ForbiddenError('You are not assigned to this class.')
}

const createSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().min(1),
  maxScore: z.number().int().positive().optional(),
})

export async function create(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createSchema, req.body)
  await assertCanManageClass(req, input.classId)

  if (!req.userId) throw new ForbiddenError()
  const assignment = await assignmentService.createAssignment({ ...input, teacherUserId: req.userId })
  res.status(201).json({ assignment })
}

const classQuerySchema = z.object({ classId: z.string().min(1) })

export async function listForClass(req: Request, res: Response): Promise<void> {
  const { classId } = parseOrThrow(classQuerySchema, req.query)
  await assertCanManageClass(req, classId)

  const assignments = await assignmentService.listAssignmentsForClass(classId)
  res.status(200).json({ assignments })
}

export async function getById(req: Request, res: Response): Promise<void> {
  const assignment = await assignmentService.getAssignmentById(req.params.id)
  await assertCanManageClass(req, assignment.classId)
  res.status(200).json({ assignment })
}

const submitSchema = z.object({ content: z.string().optional() })

export async function submit(req: Request, res: Response): Promise<void> {
  if (req.userRole !== 'STUDENT' || !req.userId) {
    throw new ForbiddenError('Only students can submit assignments.')
  }

  const { content } = parseOrThrow(submitSchema, req.body)
  const assignment = await assignmentService.submitAssignment(req.params.id, req.userId, content)
  res.status(200).json({ assignment })
}

const gradeSchema = z.object({
  studentUserId: z.string().min(1),
  score: z.number().nonnegative(),
  feedback: z.string().optional(),
})

export async function grade(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(gradeSchema, req.body)
  const existing = await assignmentService.getAssignmentById(req.params.id)
  await assertCanManageClass(req, existing.classId)

  const assignment = await assignmentService.gradeSubmission(req.params.id, input.studentUserId, input)
  res.status(200).json({ assignment })
}

export async function listForStudent(req: Request, res: Response): Promise<void> {
  const studentUserId = req.params.id
  const isSelf = req.userId === studentUserId
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
  const isParent =
    req.userRole === 'PARENT' && req.userId && (await isParentOfStudent(req.userId, studentUserId))

  if (!isSelf && !isPrivileged && !isParent) {
    throw new ForbiddenError('You do not have permission to view these assignments.')
  }

  const submissions = await assignmentService.getAssignmentsForStudent(studentUserId)
  res.status(200).json({ submissions })
}
