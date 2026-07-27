import axios from 'axios'
import { apiClient } from './apiClient'

export interface School {
  id: string
  name: string
  city?: string | null
  country?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSchoolInput {
  name: string
  city?: string
  country?: string
}

export interface UpdateSchoolInput {
  name?: string
  city?: string
  country?: string
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    return data?.error ?? fallback
  }
  return fallback
}

export const schoolApi = {
  async list(): Promise<School[]> {
    const { data } = await apiClient.get<{ schools: School[] }>('/schools')
    return data.schools
  },

  async create(input: CreateSchoolInput): Promise<School> {
    try {
      const { data } = await apiClient.post<{ school: School }>('/schools', input)
      return data.school
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create school.'), { cause: error })
    }
  },

  async update(id: string, input: UpdateSchoolInput): Promise<School> {
    try {
      const { data } = await apiClient.patch<{ school: School }>(`/schools/${id}`, input)
      return data.school
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update school.'), { cause: error })
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/schools/${id}`)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete school.'), { cause: error })
    }
  },
}
