import express from 'express'
import { z } from 'zod'
import { MapStyleSchema, NewsSourcesFileSchema, mergeSettings } from '../domain/config.js'
import { getNewsSources, getSettings, saveNewsSources, saveSettings } from '../services/configService.js'

export const configRouter = express.Router()

configRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await getSettings()
    const sources = await getNewsSources()

    res.json({
      theme: settings.theme,
      mapStyle: settings.mapStyle,
      services: settings.services,
      video: {
        youtube: { enabled: true },
        tiktok: { enabled: true },
      },
      weather: {
        provider: 'open-meteo',
        openweatherConfigured: false,
      },
      news: { sourcesCount: sources.newsSources.length },
      geo: settings.geo,
      newsSources: sources.newsSources.map((s) => ({ name: s.name, enabled: s.enabled })),
    })
  } catch (err) {
    next(err)
  }
})

configRouter.get('/news-sources', async (_req, res, next) => {
  try {
    const sources = await getNewsSources()
    res.json(sources)
  } catch (err) {
    next(err)
  }
})

configRouter.put('/news-sources', async (req, res, next) => {
  try {
    const parsed = NewsSourcesFileSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid newsSources (must be array)' })
    const saved = await saveNewsSources(parsed.data)
    res.json(saved)
  } catch (err) {
    next(err)
  }
})

configRouter.get('/settings', async (_req, res, next) => {
  try {
    const settings = await getSettings()
    res.json(settings)
  } catch (err) {
    next(err)
  }
})

configRouter.put('/settings', async (req, res, next) => {
  try {
    // Validate mapStyle separately to provide the exact error message in spec
    const maybeMapStyle = z.object({ mapStyle: z.unknown().optional() }).safeParse(req.body)
    if (maybeMapStyle.success && maybeMapStyle.data.mapStyle !== undefined) {
      const ok = MapStyleSchema.safeParse(maybeMapStyle.data.mapStyle)
      if (!ok.success) {
        return res.status(400).json({
          error: 'Invalid mapStyle. Valid values: default, terrain, admin, dark, light, satellite',
        })
      }
    }

    const current = await getSettings()
    let nextSettings
    try {
      nextSettings = mergeSettings(current, req.body)
    } catch (_err) {
      return res.status(400).json({ error: 'Invalid settings payload' })
    }

    const saved = await saveSettings(nextSettings)
    res.json(saved)
  } catch (err) {
    next(err)
  }
})

