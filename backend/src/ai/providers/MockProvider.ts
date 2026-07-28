import type { AIChatMessage, AIGenerateOptions, AIGenerateResult, AIProvider } from '../types'

const MOCK_REPLIES = [
  "That's a great question. Based on what you've shared, here's a suggestion to help you move forward.",
  'Here is a summary of the key points, along with a recommended next step.',
  "I've looked at this from a few angles — let me walk you through the most useful one.",
]

/**
 * The safe default provider — never calls an external API. Used only when no real provider
 * (e.g. OpenAI) is configured via AI_PROVIDER/OPENAI_API_KEY. Note: Demo Mode never reaches this
 * class at all — it's a frontend-only simulation that never calls the backend (see AITutor.tsx
 * and data/demoAiResponses.ts). This class is what a *real, authenticated* user gets if the
 * backend has no AI provider configured yet.
 */
export class MockProvider implements AIProvider {
  readonly name = 'mock'

  generateReply(messages: AIChatMessage[], _options: AIGenerateOptions): Promise<AIGenerateResult> {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')
    const topic = lastUserMessage?.content.trim().slice(0, 80) ?? 'your question'
    const opener = MOCK_REPLIES[messages.length % MOCK_REPLIES.length]
    const content = `${opener}\n\nRegarding "${topic}": this is a placeholder response — no AI provider is configured for this account yet. Set AI_PROVIDER and OPENAI_API_KEY to enable real AI replies.`

    const promptTokens = Math.ceil(messages.reduce((sum, message) => sum + message.content.length, 0) / 4)
    const completionTokens = Math.ceil(content.length / 4)

    return Promise.resolve({
      content,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    })
  }
}
