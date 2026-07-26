import type { Weekday } from '@prisma/client'
import { prisma } from '../config/prisma'
import { resolveStudentId, resolveTeacherId, safeUserSelect } from './resolvers'

const slotInclude = {
  subject: true,
  teacher: { include: { user: { select: safeUserSelect } } },
} as const

export interface CreateSlotInput {
  classId: string
  subjectId: string
  /** The assigned teacher's User.id. */
  teacherUserId: string
  day: Weekday
  startTime: string
  endTime: string
  room?: string
}

export async function createSlot(input: CreateSlotInput) {
  const teacherId = await resolveTeacherId(input.teacherUserId)

  return prisma.timetableSlot.create({
    data: {
      classId: input.classId,
      subjectId: input.subjectId,
      teacherId,
      day: input.day,
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
    },
    include: slotInclude,
  })
}

export async function getTimetableForClass(classId: string) {
  return prisma.timetableSlot.findMany({
    where: { classId },
    include: slotInclude,
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  })
}

/** `studentUserId` — the student's User.id; returns the timetable for their enrolled class. */
export async function getTimetableForStudent(studentUserId: string) {
  const studentId = await resolveStudentId(studentUserId)
  const enrollment = await prisma.enrollment.findFirst({ where: { studentId } })
  if (!enrollment) return []
  return getTimetableForClass(enrollment.classId)
}

/** `teacherUserId` — the teacher's User.id; returns every slot they teach, across all classes. */
export async function getTimetableForTeacher(teacherUserId: string) {
  const teacherId = await resolveTeacherId(teacherUserId)

  return prisma.timetableSlot.findMany({
    where: { teacherId },
    include: { subject: true, class: { select: { id: true, name: true, grade: true, section: true } } },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  })
}
