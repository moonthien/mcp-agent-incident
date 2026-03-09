import type { VideoItem } from '../domain/video.js'
import { getSettings } from './configService.js'

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: 'yt-1',
    title: 'Tin nhanh Việt Nam (demo)',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: new Date().toISOString(),
    lat: 21.0278,
    lng: 105.8342,
  },
  {
    id: 'tt-1',
    title: 'Clip nóng hôm nay (demo)',
    thumbnail: null,
    source: 'tiktok',
    url: 'https://www.tiktok.com/',
    publishedAt: new Date().toISOString(),
    lat: 10.8231,
    lng: 106.6297,
  },
]

export async function listVideos(params: { source?: string }) {
  const settings = await getSettings()
  if (!settings.services.video.enabled) return []

  const source = params.source?.toLowerCase()
  if (source) return SAMPLE_VIDEOS.filter((v) => v.source === source)
  return SAMPLE_VIDEOS
}

export async function getVideoById(id: string) {
  const items = await listVideos({})
  return items.find((x) => x.id === id) ?? null
}

