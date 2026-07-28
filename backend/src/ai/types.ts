export type AIChatRole = 'user' | 'assistant' | 'system'

export interface AIChatMessage {
  role: AIChatRole
  content: string
}

export interface AIGenerateOptions {
  model: string
  maxTokens: number
  temperature: number
}

export interface AIGenerateResult {
  content: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

/**
 * Common contract every AI backend implements. Controllers/services only ever
 * talk to this interface — never to a specific vendor SDK — so adding a new
 * backend (Claude, Gemini, Ollama, Azure OpenAI, ...) means adding one class
 * here and registering it in providerFactory.ts, with no other code changes.
 */
export interface AIProvider {
  readonly name: string
  generateReply(messages: AIChatMessage[], options: AIGenerateOptions): Promise<AIGenerateResult>
}
