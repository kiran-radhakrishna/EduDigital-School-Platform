import type { GradeType as PrismaGradeType } from '@prisma/client'
import { prisma } from '../config/prisma'
import { resolveStudentId, resolveTeacherId } from './resolvers'

export interface RecordGradeInput {
  studentUserId: string
  classId: string
  subjectId: string
  /** The grading teacher's User.id. */
  teacherUserId: string
  type: PrismaGradeType
  title: string
  score: number
  maxScore: number
  date: string
}

export async function recordGrade(input: RecordGradeInput) {
  const studentId = await resolveStudentId(input.studentUserId)
  const teacherId = await resolveTeacherId(input.teacherUserId)

  return prisma.grade.create({
    data: {
      studentId,
      classId: input.classId,
      subjectId: input.subjectId,
      teacherId,
      type: input.type,
      title: input.title.trim(),
      score: input.score,
      maxScore: input.maxScore,
      date: new Date(`${input.date}T00:00:00.000Z`),
    },
    include: { subject: true },
  })
}

/** `studentUserId` — the student's User.id. */
export async function listGradesForStudent(studentUserId: string, subjectId?: string) {
  const studentId = await resolveStudentId(studentUserId)

  return prisma.grade.findMany({
    where: { studentId, subjectId },
    include: { subject: true },
    orderBy: { date: 'desc' },
  })
}

export async function listGradesForClass(classId: string, subjectId?: string) {
  return prisma.grade.findMany({
    where: { classId, subjectId },
    include: { subject: true },
    orderBy: { date: 'desc' },
  })
}

export interface SubjectAverage {
  subjectId: string
  subjectName: string
  averagePercentage: number
  gradeCount: number
}

export interface ProgressReport {
  gpa: number
  overallPercentage: number
  gradeCount: number
  bySubject: SubjectAverage[]
}

/** `studentUserId` — the student's User.id. Computes GPA on a 4.0 scale and a per-subject breakdown. */
export async function getProgressReport(studentUserId: string): Promise<ProgressReport> {
  const grades = await listGradesForStudent(studentUserId)

  if (grades.length === 0) {
    return { gpa: 0, overallPercentage: 0, gradeCount: 0, bySubject: [] }
  }

  const bySubjectMap = new Map<string, { name: string; totalPercentage: number; count: number }>()
  let totalPercentage = 0

  for (const grade of grades) {
    const percentage = grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0
    totalPercentage += percentage

    const existing = bySubjectMap.get(grade.subjectId)
    if (existing) {
      existing.totalPercentage += percentage
      existing.count += 1
    } else {
      bySubjectMap.set(grade.subjectId, { name: grade.subject.name, totalPercentage: percentage, count: 1 })
    }
  }

  const overallPercentage = Math.round((totalPercentage / grades.length) * 10) / 10
  const gpa = Math.round(Math.min(4, (overallPercentage / 100) * 4) * 100) / 100

  const bySubject: SubjectAverage[] = Array.from(bySubjectMap.entries()).map(([subjectId, value]) => ({
    subjectId,
    subjectName: value.name,
    averagePercentage: Math.round((value.totalPercentage / value.count) * 10) / 10,
    gradeCount: value.count,
  }))

  return { gpa, overallPercentage, gradeCount: grades.length, bySubject }
}
