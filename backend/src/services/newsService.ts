import NodeCache from 'node-cache'
import Parser from 'rss-parser'
import he from 'he'
import { getNewsSources, getSettings } from './configService.js'
import type { NewsItem } from '../domain/news.js'

const parser = new Parser()
const cache = new NodeCache({ stdTTL: 60 * 5, useClones: false })
const geocodeCache = new NodeCache({ stdTTL: 60 * 60 * 24, useClones: false })

function stableId(input: string) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(16)
}

const VI_PLACES = [
  'Hà Nội',
  'TP.HCM',
  'Thành phố Hồ Chí Minh',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Huế',
  'Khánh Hòa',
  'Nha Trang',
  'Quảng Ninh',
  'Nghệ An',
  'Thanh Hóa',
  'Bình Dương',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Lâm Đồng',
  'Đắk Lắk',
  'Gia Lai',
  'Bình Định',
  'Phú Yên',
  'Quảng Nam',
  'Quảng Ngãi',
  'Bình Thuận',
  'Kiên Giang',
  'An Giang',
  'Cà Mau',
]

function normalizeText(s: string) {
  return s.replace(/\s+/g, ' ').trim()
}

function decodeRssText(s: string | undefined | null): string | null {
  if (!s) return null
  return normalizeText(he.decode(String(s)))
}

function extractPlaceName(title: string) {
  for (const p of VI_PLACES) {
    if (title.includes(p)) return p
  }
  return null
}

async function geocode(placeName: string): Promise<{ lat: number; lng: number; placeName: string } | null> {
  const cached = geocodeCache.get<{ lat: number; lng: number; placeName: string }>(placeName)
  if (cached) return cached

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', `${placeName}, Vietnam`)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const resp = await fetch(url, {
    headers: {
      // Nominatim requires a valid UA per usage policy
      'User-Agent': 'news-map-demo/1.0 (local dev)',
    },
  })
  if (!resp.ok) return null
  const json = (await resp.json()) as Array<{ lat: string; lon: string; display_name: string }>
  const first = json[0]
  if (!first) return null

  const result = { lat: Number(first.lat), lng: Number(first.lon), placeName }
  geocodeCache.set(placeName, result)
  return result
}

export async function listNews(params: { source?: string; from?: string; to?: string }): Promise<NewsItem[]> {
  const settings = await getSettings()
  if (!settings.services.news.enabled) return []

  const sourcesFile = await getNewsSources()
  const enabledSources = sourcesFile.newsSources.filter((s) => s.enabled)
  const filterSource = params.source?.trim()

  const key = JSON.stringify({ filterSource, from: params.from ?? null, to: params.to ?? null })
  const cached = cache.get<NewsItem[]>(`news:${key}`)
  if (cached) return cached

  const fromTs = params.from ? Date.parse(params.from) : null
  const toTs = params.to ? Date.parse(params.to) : null

  const all: NewsItem[] = []
  for (const src of enabledSources) {
    if (filterSource && src.name !== filterSource) continue

    const feed = await parser.parseURL(src.url)
    for (const item of feed.items ?? []) {
      const title = decodeRssText(item.title) ?? '(untitled)'
      const link = String(item.link ?? '')
      if (!link) continue

      const pubDate = item.isoDate ? String(item.isoDate) : item.pubDate ? String(item.pubDate) : null
      if (fromTs !== null || toTs !== null) {
        const ts = pubDate ? Date.parse(pubDate) : NaN
        if (Number.isFinite(ts)) {
          if (fromTs !== null && ts < fromTs) continue
          if (toTs !== null && ts > toTs) continue
        }
      }

      const description = decodeRssText((item as any).contentSnippet ?? item.content ?? item.summary ?? item['content:encoded'])
      const placeName = extractPlaceName(title)
      const geo = placeName ? await geocode(placeName) : null

      all.push({
        id: stableId(link),
        title,
        description,
        link,
        source: src.name,
        pubDate,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        placeName: geo?.placeName ?? null,
      })
    }
  }

  // newest first
  all.sort((a, b) => (b.pubDate ?? '').localeCompare(a.pubDate ?? ''))

  cache.set(`news:${key}`, all)
  return all
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const items = await listNews({})
  return items.find((x) => x.id === id) ?? null
}

