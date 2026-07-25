import type { User, UserRole } from '../types'

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function percentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

export function gradeLetter(score: number, maxScore: number): string {
  const pct = percentage(score, maxScore)
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export interface CurrentUserIdentity {
  firstName: string
  lastName: string
  fullName: string
  avatar: string
  role: UserRole
}

function splitFullName(name: string): { firstName: string; lastName: string } {
  const normalized = name.trim()
  if (!normalized) return { firstName: 'User', lastName: '' }

  const parts = normalized.split(/\s+/)
  const [firstName, ...rest] = parts
  return { firstName, lastName: rest.join(' ') }
}

export function getCurrentUserIdentity(
  user: User | null,
  fallbackRole: UserRole = 'student',
): CurrentUserIdentity {
  const fullName = user?.name?.trim() || 'User'
  const inferred = splitFullName(fullName)
  const firstName = user?.firstName?.trim() || inferred.firstName
  const lastName = user?.lastName?.trim() || inferred.lastName
  const resolvedFullName = [firstName, lastName].filter(Boolean).join(' ')
  const avatar = (user?.avatar?.trim() || initials(resolvedFullName || fullName || 'User')).slice(0, 2)

  return {
    firstName,
    lastName,
    fullName: resolvedFullName || fullName,
    avatar,
    role: user?.role ?? fallbackRole,
  }
}
