import { describe, expect, it } from 'vitest'
import { generateOpaqueToken, hashToken } from './tokens'

describe('generateOpaqueToken', () => {
  it('generates high-entropy, URL-safe, unique tokens', () => {
    const a = generateOpaqueToken()
    const b = generateOpaqueToken()

    expect(a).not.toEqual(b)
    expect(a.length).toBeGreaterThanOrEqual(32)
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})

describe('hashToken', () => {
  it('is deterministic', () => {
    const token = generateOpaqueToken()
    expect(hashToken(token)).toEqual(hashToken(token))
  })

  it('produces different hashes for different tokens', () => {
    expect(hashToken('token-a')).not.toEqual(hashToken('token-b'))
  })

  it('does not return the original token', () => {
    const token = 'my-secret-token'
    expect(hashToken(token)).not.toEqual(token)
  })
})
