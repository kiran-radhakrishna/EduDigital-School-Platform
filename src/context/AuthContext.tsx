import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AuthContext } from './auth-context'
import type { User, UserRole } from '../types'
import { DEMO_PERSONAS, getDemoPersona, isDemoUserId, type DemoPersonaKey } from '../data/demoUsers'

const AUTH_STORAGE_KEY = 'auth_user'
const roleValues: readonly UserRole[] = ['student', 'teacher', 'parent', 'admin']

const validRoles = new Set<UserRole>(roleValues)

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<User>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.firstName === 'string' &&
    typeof candidate.lastName === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.role === 'string' &&
    validRoles.has(candidate.role as UserRole)
  )
}

function splitNameParts(value: string): { firstName: string; lastName: string } {
  const normalized = value.trim()
  if (!normalized) return { firstName: 'User', lastName: '' }

  const parts = normalized.split(/\s+/)
  const [firstName, ...rest] = parts
  return { firstName, lastName: rest.join(' ') }
}

function formatNameToken(value: string): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function deriveNameFromEmail(email: string): { firstName: string; lastName: string } {
  const localPart = email.split('@')[0] ?? ''
  const tokens = localPart
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .split(/[._-]+/)
    .filter(Boolean)
    .map((token) => formatNameToken(token))

  if (tokens.length === 0) return { firstName: 'User', lastName: '' }

  const [firstName, ...rest] = tokens
  return { firstName, lastName: rest.join(' ') }
}

function normalizeUser(user: User): User {
  const name = user.name.trim()
  const nameParts = splitNameParts(name)
  const firstName = user.firstName?.trim() || nameParts.firstName
  const lastName = user.lastName?.trim() || nameParts.lastName
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const avatar = user.avatar?.trim() || `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'U'

  return {
    ...user,
    firstName,
    lastName,
    name: fullName || firstName,
    avatar,
  }
}

function readStoredUser(): User | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!isUser(parsed)) {
      console.error('Invalid auth user data in localStorage.')
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return normalizeUser(parsed)
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse auth user from localStorage.', error)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    throw error
  }
}

function buildUser(email: string, role: UserRole, name?: string): User {
  const nameParts = name?.trim() ? splitNameParts(name) : deriveNameFromEmail(email)
  const fullName = [nameParts.firstName, nameParts.lastName].filter(Boolean).join(' ')

  return {
    id: `${role}-${Date.now()}`,
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    name: fullName,
    email: email.trim(),
    role,
    avatar: `${nameParts.firstName[0] ?? ''}${nameParts.lastName[0] ?? ''}`.toUpperCase() || 'U',
    class: role === 'student' ? '10-A' : undefined,
    subject: role === 'teacher' ? 'Mathematics' : undefined,
    joinedAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser())

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }, [user])

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    if (!email.trim()) throw new Error('Email is required.')
    if (!password.trim()) throw new Error('Password is required.')
    if (!validRoles.has(role)) throw new Error('Invalid user role.')

    await new Promise((resolve) => setTimeout(resolve, 400))
    setUser(buildUser(email, role))
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole) => {
      if (!name.trim()) throw new Error('Name is required.')
      if (!email.trim()) throw new Error('Email is required.')
      if (!password.trim()) throw new Error('Password is required.')
      if (!validRoles.has(role)) throw new Error('Invalid user role.')

      await new Promise((resolve) => setTimeout(resolve, 400))
      setUser(buildUser(email, role, name))
    },
    [],
  )

  const loginDemo = useCallback((key: DemoPersonaKey) => {
    const persona = getDemoPersona(key)
    if (!persona) throw new Error(`Unknown demo persona: ${key}`)
    setUser(normalizeUser(persona.user))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (updates.role && !validRoles.has(updates.role)) {
      throw new Error('Invalid user role.')
    }

    setUser((previousUser) => {
      if (!previousUser) return previousUser
      return normalizeUser({ ...previousUser, ...updates })
    })
  }, [])

  const demoPersonaKey = useMemo<DemoPersonaKey | null>(() => {
    if (!user || !isDemoUserId(user.id)) return null
    return DEMO_PERSONAS.find((persona) => persona.user.id === user.id)?.key ?? null
  }, [user])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isDemoMode: demoPersonaKey !== null,
      demoPersonaKey,
      login,
      register,
      loginDemo,
      logout,
      updateUser,
    }),
    [demoPersonaKey, login, loginDemo, logout, register, updateUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
