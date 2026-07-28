import type { AIMessageRole } from '@prisma/client'
import { prisma } from '../config/prisma'
import { env } from '../config/env'
import { ForbiddenError, NotFoundError } from '../utils/errors'
import { getAIProvider } from '../ai/providerFactory'
import type { AIChatMessage } from '../ai/types'

function toProviderRole(role: AIMessageRole): AIChatMessage['role'] {
  return role.toLowerCase() as AIChatMessage['role']
}

function modelForProvider(providerName: string): string {
  return providerName === 'openai' ? env.openaiModel : 'mock-v1'
}

/** Every role has a direct User.schoolId, unlike the admin/authority-only resolver in analytics.service.ts. */
export async function getSchoolIdForAnyUser(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { schoolId: true } })
  return user?.schoolId ?? null
}

async function getOwnedConversation(conversationId: string, userId: string) {
  const conversation = await prisma.aIConversation.findUnique({ where: { id: conversationId } })
  if (!conversation) {
    throw new NotFoundError('Conversation not found.')
  }
  if (conversation.userId !== userId) {
    throw new ForbiddenError('You do not have permission to access this conversation.')
  }
  return conversation
}

export interface SendMessageInput {
  userId: string
  schoolId: string | null
  conversationId?: string
  message: string
  /** Which AI feature this belongs to (tutor, homework, study-planner, ...). Ignored when continuing an existing conversation. */
  feature?: string
  /**
   * Hidden instructions injected as a SYSTEM message when a NEW conversation is created (e.g. persona +
   * role-appropriate data context for a feature). Ignored when continuing an existing conversation, since
   * the system framing was already set for that thread.
   */
  systemContext?: string
}

export async function sendMessage(input: SendMessageInput) {
  const conversation = input.conversationId
    ? await getOwnedConversation(input.conversationId, input.userId)
    : await prisma.aIConversation.create({
        data: {
          userId: input.userId,
          schoolId: input.schoolId,
          provider: env.aiProvider,
          model: modelForProvider(env.aiProvider),
          title: input.message.trim().slice(0, 60),
          feature: input.feature ?? null,
        },
      })

  if (!input.conversationId && input.systemContext) {
    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: 'SYSTEM', content: input.systemContext },
    })
  }

  await prisma.aIMessage.create({
    data: { conversationId: conversation.id, role: 'USER', content: input.message },
  })

  const history = await prisma.aIMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
  })

  const provider = getAIProvider(conversation.provider)
  const result = await provider.generateReply(
    history.map((entry) => ({ role: toProviderRole(entry.role), content: entry.content })),
    { model: conversation.model, maxTokens: env.aiMaxTokens, temperature: env.aiTemperature },
  )

  const [assistantMessage] = await prisma.$transaction([
    prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: result.content,
        tokensUsed: result.totalTokens,
      },
    }),
    prisma.aIUsage.create({
      data: {
        userId: input.userId,
        schoolId: input.schoolId,
        conversationId: conversation.id,
        provider: conversation.provider,
        model: conversation.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
      },
    }),
    prisma.aIConversation.update({ where: { id: conversation.id }, data: { model: conversation.model } }),
  ])

  return { conversation, message: assistantMessage }
}

export async function listConversations(userId: string, feature?: string) {
  return prisma.aIConversation.findMany({
    where: { userId, ...(feature ? { feature } : {}) },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, provider: true, model: true, feature: true, createdAt: true, updatedAt: true },
  })
}

export async function getConversation(conversationId: string, userId: string, isPrivileged: boolean) {
  const conversation = await prisma.aIConversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  if (!conversation) {
    throw new NotFoundError('Conversation not found.')
  }
  if (conversation.userId !== userId && !isPrivileged) {
    throw new ForbiddenError('You do not have permission to view this conversation.')
  }
  return conversation
}

export interface UsageSummary {
  totalTokens: number
  promptTokens: number
  completionTokens: number
  requestCount: number
}

export async function getUsageForUser(userId: string): Promise<UsageSummary> {
  const totals = await prisma.aIUsage.aggregate({
    where: { userId },
    _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
    _count: true,
  })
  return {
    totalTokens: totals._sum.totalTokens ?? 0,
    promptTokens: totals._sum.promptTokens ?? 0,
    completionTokens: totals._sum.completionTokens ?? 0,
    requestCount: totals._count,
  }
}

export async function getUsageForSchool(schoolId: string): Promise<UsageSummary> {
  const totals = await prisma.aIUsage.aggregate({
    where: { schoolId },
    _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
    _count: true,
  })
  return {
    totalTokens: totals._sum.totalTokens ?? 0,
    promptTokens: totals._sum.promptTokens ?? 0,
    completionTokens: totals._sum.completionTokens ?? 0,
    requestCount: totals._count,
  }
}
