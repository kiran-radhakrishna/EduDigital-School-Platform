import axios from 'axios'
import { apiClient } from './apiClient'
import type { User, UserRole } from '../types'

interface AuthResponse {
  user: User
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    return data?.error ?? fallback
  }
  return fallback
}

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password })
      return data.user
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Login failed. Please try again.'), { cause: error })
    }
  },

  async register(name: string, email: string, password: string, role: UserRole): Promise<User> {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', { name, email, password, role })
      return data.user
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Registration failed. Please try again.'), { cause: error })
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<AuthResponse>('/auth/me')
    return data.user
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email })
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Could not process that request. Please try again.'), { cause: error })
    }
  },

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, password })
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Could not reset your password. Please try again.'), { cause: error })
    }
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { token })
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Could not verify your email. Please try again.'), { cause: error })
    }
  },

  async resendVerification(): Promise<void> {
    await apiClient.post('/auth/resend-verification')
  },
}
