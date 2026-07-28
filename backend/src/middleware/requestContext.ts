import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string
    }
  }
}

const REQUEST_ID_HEADER = 'X-Request-Id'

/** Assigns a request id (reusing an inbound one from a trusted proxy if present) and logs every request. */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const inboundId = req.headers['x-request-id']
  req.requestId = typeof inboundId === 'string' && inboundId.length > 0 ? inboundId : randomUUID()
  res.setHeader(REQUEST_ID_HEADER, req.requestId)

  const startedAt = process.hrtime.bigint()
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    logger.info('request', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    })
  })

  next()
}
