import express from 'express'
import { configRouter } from './config.js'
import { newsRouter } from './news.js'
import { videosRouter } from './videos.js'
import { weatherRouter } from './weather.js'

export const apiRouter = express.Router()

apiRouter.use('/news', newsRouter)
apiRouter.use('/videos', videosRouter)
apiRouter.use('/weather', weatherRouter)
apiRouter.use('/config', configRouter)

