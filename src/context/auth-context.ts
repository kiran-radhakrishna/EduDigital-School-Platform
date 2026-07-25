import { createContext } from 'react'
import type { User, UserRole } from '../types'
import type { DemoPersonaKey } from '../data/demoUsers'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isDemoMode: boolean
  demoPersonaKey: DemoPersonaKey | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  loginDemo: (key: DemoPersonaKey) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
