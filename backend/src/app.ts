import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { env } from './config/env'
import { requestContext } from './middleware/requestContext'
import { generalRateLimit } from './middleware/rateLimits'
import { csrfProtection } from './middleware/csrf'
import { logger } from './utils/logger'
import { authRouter } from './routes/auth.routes'
import { userRouter } from './routes/user.routes'
import { schoolRouter } from './routes/school.routes'
import { academicRouter } from './routes/academic.routes'
import { parentRouter } from './routes/parent.routes'
import { attendanceRouter } from './routes/attendance.routes'
import { assignmentRouter } from './routes/assignment.routes'
import { gradeRouter } from './routes/grade.routes'
import { timetableRouter } from './routes/timetable.routes'
import { notificationRouter } from './routes/notification.routes'
import { wellbeingRouter } from './routes/wellbeing.routes'
import { analyticsRouter } from './routes/analytics.routes'
import { dashboardRouter } from './routes/dashboard.routes'
import { libraryRouter } from './routes/library.routes'
import { inventoryRouter } from './routes/inventory.routes'
import { staffRouter } from './routes/staff.routes'
import { feeRouter } from './routes/fee.routes'
import { transportRouter } from './routes/transport.routes'
import { aiRouter } from './routes/ai.routes'
import { docsRouter } from './routes/docs.routes'
import { prisma } from './config/prisma'

function isStatusCodedError(err: unknown): err is Error & { statusCode: number } {
  return (
    err instanceof Error &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number'
  )
}

export function createApp(): Express {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())
  app.use(requestContext)
  app.use(generalRateLimit)
  app.use(csrfProtection)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/health/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      res.status(200).json({ status: 'ready', database: 'connected' })
    } catch {
      res.status(503).json({ status: 'not_ready', database: 'unreachable' })
    }
  })

  app.get('/version', (_req, res) => {
    res.json({
      version: process.env.npm_package_version ?? '0.0.0',
      commit: env.gitCommitSha,
      environment: env.nodeEnv,
    })
  })

  app.use('/docs', docsRouter)

  app.use('/auth', authRouter)
  app.use('/users', userRouter)
  app.use('/schools', schoolRouter)
  app.use('/parents', parentRouter)
  app.use('/attendance', attendanceRouter)
  app.use('/assignments', assignmentRouter)
  app.use('/grades', gradeRouter)
  app.use('/timetable', timetableRouter)
  app.use('/notifications', notificationRouter)
  app.use('/wellbeing', wellbeingRouter)
  app.use('/analytics', analyticsRouter)
  app.use('/dashboard', dashboardRouter)
  app.use('/library', libraryRouter)
  app.use('/inventory', inventoryRouter)
  app.use('/staff', staffRouter)
  app.use('/fees', feeRouter)
  app.use('/transport', transportRouter)
  app.use('/ai', aiRouter)
  app.use('/', academicRouter)

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (isStatusCodedError(err)) {
      if (err.statusCode >= 500) {
        logger.error(err.message, { requestId: req.requestId, stack: err.stack })
      }
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    const stack = err instanceof Error ? err.stack : undefined
    logger.error(message, { requestId: req.requestId, stack })
    // Never leak internals (stack traces, error messages) to the client for unexpected errors.
    res.status(500).json({ error: 'Internal server error.', requestId: req.requestId })
  })

  return app
}
