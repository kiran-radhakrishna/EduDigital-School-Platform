import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, UserRole } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const demoNames: Record<UserRole, string> = {
  student: 'Alex Morgan',
  teacher: 'Dr. Emily Carter',
  parent: 'Jordan Reyes',
  admin: 'Taylor Brooks',
}

function buildDemoUser(email: string, role: UserRole): User {
  return {
    id: `${role}-${Date.now()}`,
    name: demoNames[role],
    email,
    role,
    class: role === 'student' ? '10-A' : undefined,
    subject: role === 'teacher' ? 'Mathematics' : undefined,
    joinedAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user')
    return stored ? (JSON.parse(stored) as User) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth_user')
    }
  }, [user])

  const login = async (email: string, _password: string, role: UserRole) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    setUser(buildDemoUser(email, role))
  }

  const register = async (name: string, email: string, _password: string, role: UserRole) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    setUser({
      id: `${role}-${Date.now()}`,
      name,
      email,
      role,
      joinedAt: new Date().toISOString(),
    })
  }

  const logout = () => setUser(null)

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout, updateUser }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
