import { prisma } from '../config/prisma'
import { NotFoundError } from '../utils/errors'

export async function listSchools() {
  return prisma.school.findMany({ orderBy: { name: 'asc' } })
}

export async function getSchoolById(id: string) {
  const school = await prisma.school.findUnique({ where: { id } })
  if (!school) {
    throw new NotFoundError('School not found.')
  }
  return school
}

export interface CreateSchoolInput {
  name: string
  city?: string
  country?: string
}

export async function createSchool(input: CreateSchoolInput) {
  return prisma.school.create({
    data: { name: input.name.trim(), city: input.city, country: input.country },
  })
}

export interface UpdateSchoolInput {
  name?: string
  city?: string
  country?: string
}

export async function updateSchool(id: string, input: UpdateSchoolInput) {
  await getSchoolById(id)
  return prisma.school.update({ where: { id }, data: input })
}

export async function deleteSchool(id: string): Promise<void> {
  await getSchoolById(id)
  await prisma.school.delete({ where: { id } })
}

export interface CreateAcademicYearInput {
  name: string
  startDate: string
  endDate: string
  isCurrent?: boolean
}

export async function listAcademicYears(schoolId: string) {
  await getSchoolById(schoolId)
  return prisma.academicYear.findMany({ where: { schoolId }, orderBy: { startDate: 'desc' } })
}

export async function createAcademicYear(schoolId: string, input: CreateAcademicYearInput) {
  await getSchoolById(schoolId)

  return prisma.$transaction(async (tx) => {
    if (input.isCurrent) {
      await tx.academicYear.updateMany({ where: { schoolId, isCurrent: true }, data: { isCurrent: false } })
    }

    return tx.academicYear.create({
      data: {
        schoolId,
        name: input.name.trim(),
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        isCurrent: input.isCurrent ?? false,
      },
    })
  })
}
