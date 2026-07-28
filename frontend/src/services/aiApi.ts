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

export const aiApi = {
  async sendChatMessage(message: string, conversationId?: string): Promise<{ conversation: AIConversationSummary; message: AIMessage }> {
    const { data } = await apiClient.post<{ conversation: AIConversationSummary; message: AIMessage }>('/ai/chat', {
      message,
      conversationId,
    })
    return data
  },
  async listConversations(): Promise<AIConversationSummary[]> {
    const { data } = await apiClient.get<{ conversations: AIConversationSummary[] }>('/ai/conversations')
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
}
