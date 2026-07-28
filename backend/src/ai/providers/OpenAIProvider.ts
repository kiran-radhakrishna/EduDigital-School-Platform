import { env } from '../../config/env'
import { AppError } from '../../utils/errors'
import type { AIChatMessage, AIGenerateOptions, AIGenerateResult, AIProvider } from '../types'

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions'

interface OpenAIChatCompletionResponse {
  choices: Array<{ message: { content: string } }>
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai'

  async generateReply(messages: AIChatMessage[], options: AIGenerateOptions): Promise<AIGenerateResult> {
    if (!env.openaiApiKey) {
      throw new AppError('The OpenAI provider is not configured. Set OPENAI_API_KEY.', 503)
    }

    let response: Response
    try {
      response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: options.model,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          messages: messages.map((message) => ({ role: message.role, content: message.content })),
        }),
      })
    } catch {
      throw new AppError('Could not reach the OpenAI provider.', 502)
    }

    if (!response.ok) {
      throw new AppError('The OpenAI provider returned an error.', 502)
    }

    const data = (await response.json()) as OpenAIChatCompletionResponse
    const content = data.choices[0]?.message.content ?? ''

    return {
      content,
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    }
  }
}
