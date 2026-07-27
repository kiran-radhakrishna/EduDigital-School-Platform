import { apiClient } from './apiClient'

export interface ParentChild {
  id: string
  name: string
  firstName: string
  lastName: string
  avatar: string
  grade?: string
}

interface ChildResponse {
  id: string
  firstName: string
  lastName: string
  name: string
  avatar: string
  class?: string
}

export const parentApi = {
  /** `parentUserId` — the logged-in parent's own User.id. Real linked children, not Demo Mode's sample family. */
  async getChildren(parentUserId: string): Promise<ParentChild[]> {
    const { data } = await apiClient.get<{ children: ChildResponse[] }>(`/parents/${parentUserId}/children`)
    return data.children.map((child) => ({
      id: child.id,
      name: child.name,
      firstName: child.firstName,
      lastName: child.lastName,
      avatar: child.avatar,
      grade: child.class,
    }))
  },
}
