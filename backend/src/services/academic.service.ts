import { prisma } from '../config/prisma'
import { ConflictError, NotFoundError } from '../utils/errors'

// The public API is keyed by User.id everywhere (it's the only id the frontend
// has post-auth). These resolve a User.id to the internal Teacher/Student row id.
async function resolveTeacherId(teacherUserId: string): Promise<string> {
  const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } })
  if (!teacher) {
    throw new NotFoundError('Teacher not found.')
  }
  return teacher.id
}

async function resolveStudentId(studentUserId: string): Promise<string> {
  const student = await prisma.student.findUnique({ where: { userId: studentUserId } })
  if (!student) {
    throw new NotFoundError('Student not found.')
  }
  return student.id
}

export interface CreateSubjectInput {
  schoolId: string
  name: string
  code?: string
}

export async function listSubjects(schoolId: string) {
  return prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } })
}

export async function createSubject(input: CreateSubjectInput) {
  const existing = await prisma.subject.findFirst({ where: { schoolId: input.schoolId, name: input.name } })
  if (existing) {
    throw new ConflictError('A subject with this name already exists at this school.')
  }

  return prisma.subject.create({
    data: { schoolId: input.schoolId, name: input.name.trim(), code: input.code },
  })
}

// Never `include: { user: true }` on a nested relation — that pulls passwordHash
// along with it. Always select only the safe, public user fields.
const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} as const

const classInclude = {
  academicYear: true,
  homeroomTeacher: { include: { user: { select: safeUserSelect } } },
  enrollments: { include: { student: { include: { user: { select: safeUserSelect } } } } },
  classAssignments: {
    include: { subject: true, teacher: { include: { user: { select: safeUserSelect } } } },
  },
} as const

export async function listClasses(schoolId: string, academicYearId?: string) {
  return prisma.schoolClass.findMany({
    where: { schoolId, academicYearId },
    include: classInclude,
    orderBy: { name: 'asc' },
  })
}

export async function getClassById(id: string) {
  const schoolClass = await prisma.schoolClass.findUnique({ where: { id }, include: classInclude })
  if (!schoolClass) {
    throw new NotFoundError('Class not found.')
  }
  return schoolClass
}

export interface CreateClassInput {
  schoolId: string
  academicYearId: string
  name: string
  grade: string
  section: string
  /** User.id of the homeroom teacher, if any. */
  homeroomTeacherUserId?: string
}

export async function createClass(input: CreateClassInput) {
  const homeroomTeacherId = input.homeroomTeacherUserId
    ? await resolveTeacherId(input.homeroomTeacherUserId)
    : undefined

  return prisma.schoolClass.create({
    data: {
      schoolId: input.schoolId,
      academicYearId: input.academicYearId,
      name: input.name.trim(),
      grade: input.grade,
      section: input.section,
      homeroomTeacherId,
    },
    include: classInclude,
  })
}

/** `teacherUserId`/`subjectId` — teacher is identified by their User.id. */
export async function assignTeacherToClass(classId: string, teacherUserId: string, subjectId: string) {
  await getClassById(classId)
  const teacherId = await resolveTeacherId(teacherUserId)

  const existing = await prisma.classAssignment.findUnique({
    where: { classId_subjectId: { classId, subjectId } },
  })
  if (existing) {
    throw new ConflictError('A teacher is already assigned to this subject for this class.')
  }

  await prisma.classAssignment.create({ data: { classId, teacherId, subjectId } })
  return getClassById(classId)
}

/** `studentUserId` — student is identified by their User.id. */
export async function enrollStudentInClass(classId: string, studentUserId: string) {
  await getClassById(classId)
  const studentId = await resolveStudentId(studentUserId)

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId, classId } },
  })
  if (existing) {
    throw new ConflictError('This student is already enrolled in this class.')
  }

  await prisma.enrollment.create({ data: { classId, studentId } })
  return getClassById(classId)
}

/** `teacherUserId` — the teacher's User.id. */
export async function getTeacherAssignments(teacherUserId: string) {
  const teacherId = await resolveTeacherId(teacherUserId)

  return prisma.classAssignment.findMany({
    where: { teacherId },
    include: { class: { include: { academicYear: true } }, subject: true },
    orderBy: { createdAt: 'asc' },
  })
}

/** `studentUserId` — the student's User.id. */
export async function getStudentEnrollment(studentUserId: string) {
  const studentId = await resolveStudentId(studentUserId)

  return prisma.enrollment.findFirst({
    where: { studentId },
    include: {
      class: {
        include: {
          academicYear: true,
          classAssignments: {
            include: { subject: true, teacher: { include: { user: { select: safeUserSelect } } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
