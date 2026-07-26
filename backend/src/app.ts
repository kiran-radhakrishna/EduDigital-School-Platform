import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { authRouter } from './routes/auth.routes'
import { userRouter } from './routes/user.routes'
import { schoolRouter } from './routes/school.routes'
import { academicRouter } from './routes/academic.routes'
import { parentRouter } from './routes/parent.routes'

function isStatusCodedError(err: unknown): err is Error & { statusCode: number } {
  return (
    err instanceof Error &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number'
  )
}

export function createApp(): Express {
  const app = express()

  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/auth', authRouter)
  app.use('/users', userRouter)
  app.use('/schools', schoolRouter)
  app.use('/parents', parentRouter)
  app.use('/', academicRouter)

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (isStatusCodedError(err)) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Internal server error.' })
  })

  return app
}
