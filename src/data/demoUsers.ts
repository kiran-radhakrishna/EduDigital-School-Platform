// ─── Demo Mode · Instant-login sample personas ──────────────────────────────
// Each persona reuses the app's existing role system: 'authority' and
// 'administrator' both operate under the 'admin' User.role (the codebase
// already treats admin as the school/district authority, see Profile.tsx),
// but land on different initial routes so they read as distinct personas.

import type { User, UserRole } from '../types'

export type DemoPersonaKey = 'student' | 'teacher' | 'parent' | 'authority' | 'administrator'

export interface DemoPersona {
  key: DemoPersonaKey
  label: string
  description: string
  role: UserRole
  initialPath: string
  user: User
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    key: 'student',
    label: 'Student',
    description: 'Assignments, grades, timetable, and AI learning tools.',
    role: 'student',
    initialPath: '/student/dashboard',
    user: {
      id: 'demo-student',
      firstName: 'Emma',
      lastName: 'Wagner',
      name: 'Emma Wagner',
      email: 'emma.wagner@demo.edudigital.school',
      role: 'student',
      avatar: 'EW',
      class: '10-B',
      joinedAt: '2024-09-02T00:00:00.000Z',
    },
  },
  {
    key: 'teacher',
    label: 'Teacher',
    description: 'Classes, grading, attendance, and student wellbeing.',
    role: 'teacher',
    initialPath: '/teacher/dashboard',
    user: {
      id: 'demo-teacher',
      firstName: 'Michael',
      lastName: 'Bauer',
      name: 'Michael Bauer',
      email: 'michael.bauer@demo.edudigital.school',
      role: 'teacher',
      avatar: 'MB',
      subject: 'Mathematics',
      joinedAt: '2019-08-15T00:00:00.000Z',
    },
  },
  {
    key: 'parent',
    label: 'Parent',
    description: "Track your child's grades, attendance, and events.",
    role: 'parent',
    initialPath: '/parent/dashboard',
    user: {
      id: 'demo-parent',
      firstName: 'Sarah',
      lastName: 'Klein',
      name: 'Sarah Klein',
      email: 'sarah.klein@demo.edudigital.school',
      role: 'parent',
      avatar: 'SK',
      joinedAt: '2021-01-11T00:00:00.000Z',
    },
  },
  {
    key: 'authority',
    label: 'Authority',
    description: 'Review, approve, and publish school and district events.',
    role: 'admin',
    initialPath: '/admin/events',
    user: {
      id: 'demo-authority',
      firstName: 'Lukas',
      lastName: 'Hoffmann',
      name: 'Dr. Lukas Hoffmann',
      email: 'lukas.hoffmann@demo.edudigital.school',
      role: 'admin',
      avatar: 'LH',
      joinedAt: '2018-03-20T00:00:00.000Z',
    },
  },
  {
    key: 'administrator',
    label: 'Administrator',
    description: 'School-wide analytics, subjects, and operations.',
    role: 'admin',
    initialPath: '/admin/dashboard',
    user: {
      id: 'demo-administrator',
      firstName: 'Elena',
      lastName: 'Fischer',
      name: 'Elena Fischer',
      email: 'elena.fischer@demo.edudigital.school',
      role: 'admin',
      avatar: 'EF',
      joinedAt: '2016-06-01T00:00:00.000Z',
    },
  },
]

const DEMO_USER_IDS = new Set(DEMO_PERSONAS.map((persona) => persona.user.id))

export function isDemoUserId(id: string): boolean {
  return DEMO_USER_IDS.has(id)
}

export function getDemoPersona(key: DemoPersonaKey): DemoPersona | undefined {
  return DEMO_PERSONAS.find((persona) => persona.key === key)
}
