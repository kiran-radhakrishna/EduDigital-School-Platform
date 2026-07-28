import { describe, expect, it } from 'vitest'
import { MockProvider } from './MockProvider'

describe('MockProvider', () => {
  const provider = new MockProvider()
  const options = { model: 'mock-v1', maxTokens: 500, temperature: 0.7 }

  it('never throws and never performs network I/O', async () => {
    const result = await provider.generateReply([{ role: 'user', content: 'What is 2+2?' }], options)
    expect(result.content.length).toBeGreaterThan(0)
  })

  it('echoes the last user message in the reply, clearly labeled as a placeholder', async () => {
    const result = await provider.generateReply([{ role: 'user', content: 'Explain fractions' }], options)
    expect(result.content).toContain('Explain fractions')
    expect(result.content).toMatch(/placeholder/i)
  })

  it('reports non-zero, roughly length-proportional token counts', async () => {
    const short = await provider.generateReply([{ role: 'user', content: 'hi' }], options)
    const long = await provider.generateReply(
      [{ role: 'user', content: 'a'.repeat(400) }],
      options,
    )
    expect(short.totalTokens).toBeGreaterThan(0)
    expect(long.promptTokens).toBeGreaterThan(short.promptTokens)
    expect(long.totalTokens).toEqual(long.promptTokens + long.completionTokens)
  })
})
