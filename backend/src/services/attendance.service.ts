import type { AttendanceStatus as PrismaAttendanceStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { NotFoundError } from '../utils/errors'
import { resolveStudentId, resolveTeacherId, safeUserSelect } from './resolvers'

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

async function requireClass(classId: string) {
  const schoolClass = await prisma.schoolClass.findUnique({ where: { id: classId } })
  if (!schoolClass) {
    throw new NotFoundError('Class not found.')
  }
  return schoolClass
}

export interface AttendanceEntryInput {
  studentUserId: string
  status: PrismaAttendanceStatus
  reason?: string
}

/** `recordedByUserId` — the teacher's User.id who is taking attendance. */
export async function recordAttendance(
  classId: string,
  date: string,
  entries: AttendanceEntryInput[],
  recordedByUserId?: string,
) {
  await requireClass(classId)

  const recordedById = recordedByUserId ? await resolveTeacherId(recordedByUserId) : undefined
  const dateOnly = toDateOnly(date)

  const students = await prisma.student.findMany({
    where: { userId: { in: entries.map((entry) => entry.studentUserId) } },
    select: { id: true, userId: true },
  })
  const studentIdByUserId = new Map(students.map((student) => [student.userId, student.id]))

  const operations = entries.map((entry) => {
    const studentId = studentIdByUserId.get(entry.studentUserId)
    if (!studentId) {
      throw new NotFoundError(`Student ${entry.studentUserId} not found.`)
    }

    return prisma.attendanceRecord.upsert({
      where: { studentId_classId_date: { studentId, classId, date: dateOnly } },
      update: { status: entry.status, reason: entry.reason, recordedById },
      create: { studentId, classId, date: dateOnly, status: entry.status, reason: entry.reason, recordedById },
    })
  })

  await prisma.$transaction(operations)
  return getAttendanceForClass(classId, date)
}

export async function getAttendanceForClass(classId: string, date: string) {
  await requireClass(classId)
  const dateOnly = toDateOnly(date)

  return prisma.attendanceRecord.findMany({
    where: { classId, date: dateOnly },
    include: { student: { include: { user: { select: safeUserSelect } } } },
    orderBy: { student: { rollNumber: 'asc' } },
  })
}

export interface AttendanceRange {
  from?: string
  to?: string
}

/** `studentUserId` — the student's User.id. */
export async function getStudentAttendance(studentUserId: string, range: AttendanceRange = {}) {
  const studentId = await resolveStudentId(studentUserId)

  return prisma.attendanceRecord.findMany({
    where: {
      studentId,
      date: {
        gte: range.from ? toDateOnly(range.from) : undefined,
        lte: range.to ? toDateOnly(range.to) : undefined,
      },
    },
    include: { class: { select: { id: true, name: true } } },
    orderBy: { date: 'desc' },
  })
}

export interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

/** `studentUserId` — the student's User.id. */
export async function getStudentAttendanceSummary(
  studentUserId: string,
  range: AttendanceRange = {},
): Promise<AttendanceSummary> {
  const records = await getStudentAttendance(studentUserId, range)

  const counts = { present: 0, absent: 0, late: 0, excused: 0 }
  for (const record of records) {
    if (record.status === 'PRESENT') counts.present += 1
    else if (record.status === 'ABSENT') counts.absent += 1
    else if (record.status === 'LATE') counts.late += 1
    else if (record.status === 'EXCUSED') counts.excused += 1
  }

  const total = records.length
  const percentage = total > 0 ? Math.round(((counts.present + counts.late) / total) * 1000) / 10 : 0

  return { total, ...counts, percentage }
}
