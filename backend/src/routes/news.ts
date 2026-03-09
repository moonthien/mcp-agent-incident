import express from 'express'
import { listNews, getNewsById } from '../services/newsService.js'

export const newsRouter = express.Router()

newsRouter.get('/', async (req, res, next) => {
  try {
    const source = typeof req.query.source === 'string' ? req.query.source : undefined
    const from = typeof req.query.from === 'string' ? req.query.from : undefined
    const to = typeof req.query.to === 'string' ? req.query.to : undefined

    const items = await listNews({ source, from, to })
    res.json({ items })
  } catch (err) {
    next(err)
  }
})

newsRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await getNewsById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

