import express from 'express'
import { getWeatherByCoords, getWeatherByPlace } from '../services/weatherService.js'

export const weatherRouter = express.Router()

weatherRouter.get('/', async (req, res, next) => {
  try {
    const lat = typeof req.query.lat === 'string' ? Number(req.query.lat) : NaN
    const lon = typeof req.query.lon === 'string' ? Number(req.query.lon) : NaN
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'Missing lat or lon query parameter' })
    }

    const data = await getWeatherByCoords(lat, lon)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

weatherRouter.get('/place/:placeId', async (req, res, next) => {
  try {
    const data = await getWeatherByPlace(req.params.placeId)
    if (!data) return res.status(404).json({ error: 'Not found' })
    res.json(data)
  } catch (err) {
    next(err)
  }
})

