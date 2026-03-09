import express from 'express'
import { getVideoById, listVideos } from '../services/videoService.js'

export const videosRouter = express.Router()

videosRouter.get('/', async (req, res, next) => {
  try {
    const source = typeof req.query.source === 'string' ? req.query.source : undefined
    const items = await listVideos({ source })
    res.json({ items })
  } catch (err) {
    next(err)
  }
})

videosRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await getVideoById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

