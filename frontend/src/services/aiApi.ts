import { apiClient } from './apiClient'

export type AIMessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface AIMessage {
  id: string
  conversationId: string
  role: AIMessageRole
  content: string
  tokensUsed: number | null
  createdAt: string
}

export interface AIConversationSummary {
  id: string
  title: string | null
  provider: string
  model: string
  feature?: string | null
  createdAt: string
  updatedAt: string
}

export interface AIConversation extends AIConversationSummary {
  messages: AIMessage[]
}

export interface AIUsageSummary {
  totalTokens: number
  promptTokens: number
  completionTokens: number
  requestCount: number
}

export interface AIChatResult {
  conversation: AIConversationSummary
  message: AIMessage
}

export interface StudyPlan {
  id: string
  studentUserId: string
  conversationId: string | null
  content: string
  createdAt: string
}

export const aiApi = {
  async sendChatMessage(message: string, conversationId?: string): Promise<AIChatResult> {
    const { data } = await apiClient.post<AIChatResult>('/ai/chat', { message, conversationId })
    return data
  },
  async listConversations(feature?: string): Promise<AIConversationSummary[]> {
    const { data } = await apiClient.get<{ conversations: AIConversationSummary[] }>('/ai/conversations', {
      params: feature ? { feature } : undefined,
    })
    return data.conversations
  },
  async getConversation(conversationId: string): Promise<AIConversation> {
    const { data } = await apiClient.get<{ conversation: AIConversation }>(`/ai/conversations/${conversationId}`)
    return data.conversation
  },
  async getMyUsage(): Promise<AIUsageSummary> {
    const { data } = await apiClient.get<{ usage: AIUsageSummary }>('/ai/usage/me')
    return data.usage
  },
  async getSchoolUsage(schoolId: string): Promise<AIUsageSummary> {
    const { data } = await apiClient.get<{ usage: AIUsageSummary }>('/ai/usage', { params: { schoolId } })
    return data.usage
  },

  // Phase 7B feature endpoints — each starts/continues its own feature-tagged conversation thread.
  async tutorChat(message: string, conversationId?: string): Promise<AIChatResult> {
    const { data } = await apiClient.post<AIChatResult>('/ai/tutor/chat', { message, conversationId })
    return data
  },
  async homeworkChat(message: string, conversationId?: string, mode?: 'student' | 'teacher'): Promise<AIChatResult> {
    const { data } = await apiClient.post<AIChatResult>('/ai/homework/chat', { message, conversationId, mode })
    return data
  },
  async careerChat(message: string, conversationId?: string): Promise<AIChatResult> {
    const { data } = await apiClient.post<AIChatResult>('/ai/career/chat', { message, conversationId })
    return data
  },
  async teacherChat(message: string, conversationId?: string): Promise<AIChatResult> {
    const { data } = await apiClient.post<AIChatResult>('/ai/teacher/chat', { message, conversationId })
    return data
  },
  async parentChat(studentUserId: string, message: string, conversationId?: string): Promise<AIChatResult> {
    const { data } = await apiClient.post<AIChatResult>('/ai/parent/chat', { studentUserId, message, conversationId })
    return data
  },
  async adminChat(message: string, conversationId?: string): Promise<AIChatResult> {
    const { data } = await apiClient.post<AIChatResult>('/ai/admin/chat', { message, conversationId })
    return data
  },
  async generateStudyPlan(): Promise<{ plan: StudyPlan; conversation: AIConversationSummary; message: AIMessage }> {
    const { data } = await apiClient.post<{ plan: StudyPlan; conversation: AIConversationSummary; message: AIMessage }>(
      '/ai/study-plan/generate',
    )
    return data
  },
  async listStudyPlans(): Promise<StudyPlan[]> {
    const { data } = await apiClient.get<{ plans: StudyPlan[] }>('/ai/study-plan')
    return data.plans
  },
}
