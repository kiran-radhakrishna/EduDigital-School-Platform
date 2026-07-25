import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { authRouter } from './routes/auth.routes'

export function createApp(): Express {
  const app = express()

  app.use(cors({ origin: env.corsOrigin, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/auth', authRouter)

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error.' })
  })

  return app
}
