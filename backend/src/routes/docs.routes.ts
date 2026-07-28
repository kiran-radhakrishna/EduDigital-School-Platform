import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { openApiSpec } from '../openapi'

export const docsRouter = Router()

docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: 'EduDigital API Docs' }))
