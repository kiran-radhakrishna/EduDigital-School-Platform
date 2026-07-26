import { PrismaClient, type UserRole } from '@prisma/client'
import { hashPassword } from '../src/utils/password'

const prisma = new PrismaClient()

// Shared dev password for all seeded accounts — this is throwaway seed data
// for a dev database, never used for real accounts.
const SEED_PASSWORD = 'Passw0rd!'

// Email local-parts must stay ASCII (Zod's .email() validator rejects
// umlauts), even though display names keep their real German spelling.
const GERMAN_TRANSLITERATION: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
}

function toEmailSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => GERMAN_TRANSLITERATION[char] ?? char)
}

interface SeedUserInput {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  schoolId: string
}

async function upsertUser(input: SeedUserInput, passwordHash: string) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      schoolId: input.schoolId,
    },
    create: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      schoolId: input.schoolId,
      passwordHash,
    },
  })
}

async function main() {
  const passwordHash = await hashPassword(SEED_PASSWORD)

  const school = await prisma.school.upsert({
    where: { id: 'seed-school-dis' },
    update: {},
    create: {
      id: 'seed-school-dis',
      name: 'Deggendorf International School',
      city: 'Deggendorf',
      country: 'Germany',
    },
  })

  // ── Administrator ──────────────────────────────────────────────────────
  const adminUser = await upsertUser(
    {
      email: 'claudia.richter@dis.edu',
      firstName: 'Claudia',
      lastName: 'Richter',
      role: 'ADMINISTRATOR',
      schoolId: school.id,
    },
    passwordHash,
  )
  await prisma.administrator.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      schoolId: school.id,
      title: 'School Administrator',
    },
  })

  // ── Authority ───────────────────────────────────────────────────────────
  const authorityUser = await upsertUser(
    {
      email: 'andreas.wolff@dis.edu',
      firstName: 'Andreas',
      lastName: 'Wolff',
      role: 'AUTHORITY',
      schoolId: school.id,
    },
    passwordHash,
  )
  await prisma.authority.upsert({
    where: { userId: authorityUser.id },
    update: {},
    create: {
      userId: authorityUser.id,
      schoolId: school.id,
      title: 'District Education Authority',
    },
  })

  // ── Teachers ────────────────────────────────────────────────────────────
  const teacherInputs: Array<{ firstName: string; lastName: string; subject: string }> = [
    { firstName: 'Sabine', lastName: 'Krüger', subject: 'Mathematics' },
    { firstName: 'Thomas', lastName: 'Neumann', subject: 'English' },
    { firstName: 'Julia', lastName: 'Hoffmann', subject: 'Biology' },
  ]

  for (const teacherInput of teacherInputs) {
    const email = `${toEmailSlug(teacherInput.firstName)}.${toEmailSlug(teacherInput.lastName)}@dis.edu`
    const teacherUser = await upsertUser(
      {
        email,
        firstName: teacherInput.firstName,
        lastName: teacherInput.lastName,
        role: 'TEACHER',
        schoolId: school.id,
      },
      passwordHash,
    )
    await prisma.teacher.upsert({
      where: { userId: teacherUser.id },
      update: {},
      create: {
        userId: teacherUser.id,
        schoolId: school.id,
        subject: teacherInput.subject,
      },
    })
  }

  // ── Students + Parents (one family per pair, realistic 1:1 linking) ─────
  const families: Array<{
    student: { firstName: string; lastName: string; grade: string; rollNumber: number; dateOfBirth: string }
    parent: { firstName: string; lastName: string }
  }> = [
    {
      student: { firstName: 'Leon', lastName: 'Schmidt', grade: '5A', rollNumber: 1, dateOfBirth: '2015-03-12' },
      parent: { firstName: 'Andrea', lastName: 'Schmidt' },
    },
    {
      student: { firstName: 'Mia', lastName: 'Weber', grade: '5A', rollNumber: 2, dateOfBirth: '2015-06-24' },
      parent: { firstName: 'Michael', lastName: 'Weber' },
    },
    {
      student: { firstName: 'Finn', lastName: 'Becker', grade: '6B', rollNumber: 3, dateOfBirth: '2014-01-08' },
      parent: { firstName: 'Sandra', lastName: 'Becker' },
    },
    {
      student: { firstName: 'Lena', lastName: 'Schulz', grade: '6B', rollNumber: 4, dateOfBirth: '2014-09-30' },
      parent: { firstName: 'Christian', lastName: 'Schulz' },
    },
    {
      student: { firstName: 'Paul', lastName: 'Hoffmann', grade: '7A', rollNumber: 5, dateOfBirth: '2013-02-17' },
      parent: { firstName: 'Nicole', lastName: 'Hoffmann' },
    },
    {
      student: { firstName: 'Emma', lastName: 'Koch', grade: '7A', rollNumber: 6, dateOfBirth: '2013-11-05' },
      parent: { firstName: 'Stefan', lastName: 'Koch' },
    },
    {
      student: { firstName: 'Noah', lastName: 'Bauer', grade: '8B', rollNumber: 7, dateOfBirth: '2012-04-21' },
      parent: { firstName: 'Katrin', lastName: 'Bauer' },
    },
    {
      student: { firstName: 'Hannah', lastName: 'Wolf', grade: '8B', rollNumber: 8, dateOfBirth: '2012-07-14' },
      parent: { firstName: 'Markus', lastName: 'Wolf' },
    },
    {
      student: { firstName: 'Ben', lastName: 'Richter', grade: '9A', rollNumber: 9, dateOfBirth: '2011-05-02' },
      parent: { firstName: 'Julia', lastName: 'Richter' },
    },
    {
      student: { firstName: 'Sophie', lastName: 'Zimmermann', grade: '9A', rollNumber: 10, dateOfBirth: '2011-10-19' },
      parent: { firstName: 'Daniel', lastName: 'Zimmermann' },
    },
  ]

  for (const family of families) {
    const studentEmail = `${toEmailSlug(family.student.firstName)}.${toEmailSlug(family.student.lastName)}@dis.edu`
    const studentUser = await upsertUser(
      {
        email: studentEmail,
        firstName: family.student.firstName,
        lastName: family.student.lastName,
        role: 'STUDENT',
        schoolId: school.id,
      },
      passwordHash,
    )
    const student = await prisma.student.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: {
        userId: studentUser.id,
        schoolId: school.id,
        grade: family.student.grade,
        rollNumber: family.student.rollNumber,
        dateOfBirth: new Date(family.student.dateOfBirth),
      },
    })

    const parentEmail = `${toEmailSlug(family.parent.firstName)}.${toEmailSlug(family.parent.lastName)}@dis.edu`
    const parentUser = await upsertUser(
      {
        email: parentEmail,
        firstName: family.parent.firstName,
        lastName: family.parent.lastName,
        role: 'PARENT',
        schoolId: school.id,
      },
      passwordHash,
    )
    const parent = await prisma.parent.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: {
        userId: parentUser.id,
        schoolId: school.id,
      },
    })

    await prisma.parentStudent.upsert({
      where: { parentId_studentId: { parentId: parent.id, studentId: student.id } },
      update: {},
      create: { parentId: parent.id, studentId: student.id },
    })
  }

  console.log('Seed complete.')
  console.log(`  School:         1 (${school.name})`)
  console.log('  Administrator:  1')
  console.log('  Authority:      1')
  console.log(`  Teachers:       ${teacherInputs.length}`)
  console.log(`  Students:       ${families.length}`)
  console.log(`  Parents:        ${families.length}`)
  console.log(`  All seeded accounts share the password: ${SEED_PASSWORD}`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })
