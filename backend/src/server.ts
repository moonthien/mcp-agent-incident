import cors from 'cors'
import express from 'express'
import { apiRouter } from './routes/api.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api', apiRouter)

  app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.path}` })
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  })

  return app
}

