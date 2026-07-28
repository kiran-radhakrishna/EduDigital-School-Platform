import type { Request, Response } from 'express'
import { z } from 'zod'
import { parseOrThrow } from '../utils/validate'
import { AppError } from '../utils/errors'
import { getUserSchoolId } from '../services/resolvers'
import * as academicService from '../services/academic.service'

function isPrivileged(req: Request): boolean {
  return req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
}

async function assertCanAccessSchool(req: Request, schoolId: string): Promise<void> {
  if (isPrivileged(req)) return

  const userSchoolId = req.userId ? await getUserSchoolId(req.userId) : null
  if (userSchoolId !== schoolId) {
    throw new AppError("You do not have permission to access this school's data.", 403)
  }
}

const schoolIdQuerySchema = z.object({ schoolId: z.string().min(1) })

export async function listSubjects(req: Request, res: Response): Promise<void> {
  const { schoolId } = parseOrThrow(schoolIdQuerySchema, req.query)
  await assertCanAccessSchool(req, schoolId)
  const subjects = await academicService.listSubjects(schoolId)
  res.status(200).json({ subjects })
}

const createSubjectSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().min(1),
  code: z.string().optional(),
})

export async function createSubject(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createSubjectSchema, req.body)
  const subject = await academicService.createSubject(input)
  res.status(201).json({ subject })
}

const listClassesQuerySchema = z.object({
  schoolId: z.string().min(1),
  academicYearId: z.string().optional(),
})

export async function listClasses(req: Request, res: Response): Promise<void> {
  const { schoolId, academicYearId } = parseOrThrow(listClassesQuerySchema, req.query)
  await assertCanAccessSchool(req, schoolId)
  const classes = await academicService.listClasses(schoolId, academicYearId)
  res.status(200).json({ classes })
}

export async function getClassById(req: Request, res: Response): Promise<void> {
  const schoolClass = await academicService.getClassById(req.params.id)
  await assertCanAccessSchool(req, schoolClass.schoolId)
  res.status(200).json({ class: schoolClass })
}

const createClassSchema = z.object({
  schoolId: z.string().min(1),
  academicYearId: z.string().min(1),
  name: z.string().min(1),
  grade: z.string().min(1),
  section: z.string().min(1),
  homeroomTeacherUserId: z.string().optional(),
})

export async function createClass(req: Request, res: Response): Promise<void> {
  const input = parseOrThrow(createClassSchema, req.body)
  const schoolClass = await academicService.createClass(input)
  res.status(201).json({ class: schoolClass })
}

const assignTeacherSchema = z.object({
  teacherUserId: z.string().min(1),
  subjectId: z.string().min(1),
})

export async function assignTeacher(req: Request, res: Response): Promise<void> {
  const { teacherUserId, subjectId } = parseOrThrow(assignTeacherSchema, req.body)
  const schoolClass = await academicService.assignTeacherToClass(req.params.id, teacherUserId, subjectId)
  res.status(200).json({ class: schoolClass })
}

const enrollSchema = z.object({
  studentUserId: z.string().min(1),
})

export async function enrollStudent(req: Request, res: Response): Promise<void> {
  const { studentUserId } = parseOrThrow(enrollSchema, req.body)
  const schoolClass = await academicService.enrollStudentInClass(req.params.id, studentUserId)
  res.status(200).json({ class: schoolClass })
}

export async function getTeacherAssignments(req: Request, res: Response): Promise<void> {
  const isSelf = req.userId === req.params.id
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
  if (!isSelf && !isPrivileged) {
    throw new AppError('You do not have permission to view these assignments.', 403)
  }

  const assignments = await academicService.getTeacherAssignments(req.params.id)
  res.status(200).json({ assignments })
}

export async function getStudentEnrollment(req: Request, res: Response): Promise<void> {
  const isSelf = req.userId === req.params.id
  const isPrivileged = req.userRole === 'ADMINISTRATOR' || req.userRole === 'AUTHORITY'
  if (!isSelf && !isPrivileged) {
    throw new AppError('You do not have permission to view this enrollment.', 403)
  }

  const enrollment = await academicService.getStudentEnrollment(req.params.id)
  res.status(200).json({ enrollment })
}
