import { AppError } from '../utils/errors'
import { MockProvider } from './providers/MockProvider'
import { OpenAIProvider } from './providers/OpenAIProvider'
import type { AIProvider } from './types'

// Add a new backend by implementing AIProvider and registering it here —
// no other file needs to change. Planned: 'claude', 'gemini', 'ollama', 'azure-openai'.
const PROVIDERS: Record<string, () => AIProvider> = {
  mock: () => new MockProvider(),
  openai: () => new OpenAIProvider(),
}

export function getAIProvider(providerName: string): AIProvider {
  const factory = PROVIDERS[providerName]
  if (!factory) {
    throw new AppError(`Unsupported AI provider: ${providerName}`, 500)
  }
  return factory()
}
