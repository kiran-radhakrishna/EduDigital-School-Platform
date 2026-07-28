import { beforeAll, describe, expect, it, vi } from 'vitest'
import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'

// The mock instance is constructed entirely inside the factory (nothing outer-scope referenced),
// which is the pattern vitest's mock hoisting requires. `./app` (and everything it transitively
// imports) sees this mocked module the first time it's loaded — via the import below.
vi.mock('./config/prisma', () => ({ prisma: mockDeep<PrismaClient>() }))

import { createApp } from './app'
import { hashPassword } from './utils/password'
import { prisma } from './config/prisma'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
const app = createApp()

const SEED_PASSWORD = 'Passw0rd!'
let passwordHash: string

beforeAll(async () => {
  passwordHash = await hashPassword(SEED_PASSWORD)
})

describe('GET /health', () => {
  it('returns 200 without touching the database', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('GET /health/ready', () => {
  it('returns 200 when the database responds', async () => {
    prismaMock.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }])
    const res = await request(app).get('/health/ready')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ready')
  })

  it('returns 503 when the database is unreachable', async () => {
    prismaMock.$queryRaw.mockRejectedValueOnce(new Error('connection refused'))
    const res = await request(app).get('/health/ready')
    expect(res.status).toBe(503)
    expect(res.body.status).toBe('not_ready')
  })
})

describe('GET /version', () => {
  it('reports version, commit, and environment', async () => {
    const res = await request(app).get('/version')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('version')
    expect(res.body).toHaveProperty('commit')
    expect(res.body).toHaveProperty('environment')
  })
})

describe('every response', () => {
  it('carries a unique X-Request-Id header', async () => {
    const res = await request(app).get('/health')
    expect(res.headers['x-request-id']).toBeTruthy()
  })
})

describe('POST /auth/login', () => {
  it('rejects a malformed body before touching the database', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'not-an-email' })
    expect(res.status).toBe(400)
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('rejects unknown emails with a generic message (no user enumeration)', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    const res = await request(app).post('/auth/login').send({ email: 'nobody@example.com', password: 'whatever' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid email or password.')
  })

  it('rejects a valid email with the wrong password', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'leon@example.com',
      passwordHash,
      role: 'STUDENT',
    } as unknown as Awaited<ReturnType<typeof prismaMock.user.findUnique>>)

    const res = await request(app).post('/auth/login').send({ email: 'leon@example.com', password: 'wrong-password' })
    expect(res.status).toBe(401)
  })

  it('logs in successfully and sets access, refresh, and CSRF cookies', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'leon@example.com',
      firstName: 'Leon',
      lastName: 'Schmidt',
      passwordHash,
      role: 'STUDENT',
      createdAt: new Date(),
      student: { grade: '5A' },
      teacher: null,
      parent: null,
      authority: null,
      administrator: null,
      school: null,
    } as unknown as Awaited<ReturnType<typeof prismaMock.user.findUnique>>)
    prismaMock.refreshToken.create.mockResolvedValueOnce({} as never)

    const res = await request(app).post('/auth/login').send({ email: 'leon@example.com', password: SEED_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('leon@example.com')

    const cookies = res.headers['set-cookie'] as unknown as string[]
    expect(cookies.some((c) => c.startsWith('edudigital_token='))).toBe(true)
    expect(cookies.some((c) => c.startsWith('edudigital_refresh='))).toBe(true)
    expect(cookies.some((c) => c.startsWith('edudigital_csrf='))).toBe(true)
    // The access + refresh cookies must not be readable from JS; the CSRF one must be.
    expect(cookies.find((c) => c.startsWith('edudigital_token='))).toMatch(/HttpOnly/)
    expect(cookies.find((c) => c.startsWith('edudigital_csrf='))).not.toMatch(/HttpOnly/)
  })
})

describe('CSRF protection', () => {
  it('blocks a state-changing request from an authenticated session without a matching CSRF header', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'leon@example.com',
      firstName: 'Leon',
      lastName: 'Schmidt',
      passwordHash,
      role: 'STUDENT',
      createdAt: new Date(),
      student: { grade: '5A' },
      teacher: null,
      parent: null,
      authority: null,
      administrator: null,
      school: null,
    } as unknown as Awaited<ReturnType<typeof prismaMock.user.findUnique>>)
    prismaMock.refreshToken.create.mockResolvedValueOnce({} as never)

    const agent = request.agent(app)
    await agent.post('/auth/login').send({ email: 'leon@example.com', password: SEED_PASSWORD })

    const res = await agent.post('/ai/chat').send({ message: 'hi' })
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/csrf/i)
  })

  it('allows safe (GET) requests without a CSRF header', async () => {
    const res = await request(app).get('/health')
    expect(res.status).not.toBe(403)
  })
})
