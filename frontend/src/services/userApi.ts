import axios from 'axios'
import { apiClient } from './apiClient'

export type AdminRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'AUTHORITY' | 'ADMINISTRATOR'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  avatar: string
  class?: string
  subject?: string
  phone?: string
  joinedAt: string
  schoolId?: string
  schoolName?: string
}

export interface ListUsersParams {
  role?: AdminRole
  schoolId?: string
  search?: string
  page?: number
  limit?: number
}

export interface ListUsersResult {
  items: AdminUser[]
  total: number
  page: number
  limit: number
}

export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
  role: AdminRole
  schoolId?: string
  grade?: string
  rollNumber?: number
  dateOfBirth?: string
  subject?: string
  phone?: string
  title?: string
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  schoolId?: string | null
  grade?: string
  rollNumber?: number
  dateOfBirth?: string
  subject?: string
  phone?: string
  title?: string
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    return data?.error ?? fallback
  }
  return fallback
}

export const userApi = {
  async list(params: ListUsersParams): Promise<ListUsersResult> {
    const { data } = await apiClient.get<ListUsersResult>('/users', { params })
    return data
  },

  async create(input: CreateUserInput): Promise<AdminUser> {
    try {
      const { data } = await apiClient.post<{ user: AdminUser }>('/users', input)
      return data.user
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create user.'), { cause: error })
    }
  },

  async update(id: string, input: UpdateUserInput): Promise<AdminUser> {
    try {
      const { data } = await apiClient.patch<{ user: AdminUser }>(`/users/${id}`, input)
      return data.user
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update user.'), { cause: error })
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete user.'), { cause: error })
    }
  },
}
