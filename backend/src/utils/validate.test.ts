import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { parseOrThrow } from './validate'
import { AppError } from './errors'

const schema = z.object({ email: z.string().email(), age: z.number().min(0) })

describe('parseOrThrow', () => {
  it('returns the parsed data when valid', () => {
    const result = parseOrThrow(schema, { email: 'a@b.com', age: 10 })
    expect(result).toEqual({ email: 'a@b.com', age: 10 })
  })

  it('throws an AppError with a readable message when invalid', () => {
    expect(() => parseOrThrow(schema, { email: 'not-an-email', age: -1 })).toThrow(AppError)
  })

  it('throws AppError (400-class) rather than letting the raw ZodError escape', () => {
    try {
      parseOrThrow(schema, { email: 'x' })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).statusCode).toBe(400)
    }
  })
})
