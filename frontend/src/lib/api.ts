import type { AppSettings, ConfigResponse, GeocodeResult, NewsItem, VideoItem, WeatherResponse } from './types'

const API_BASE: string = import.meta.env.VITE_API_URL ?? '/api'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let resp: Response
  try {
    resp = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch (e) {
    const msg =
      e instanceof Error
        ? `${e.message} (API_BASE=${API_BASE}, path=${path})`
        : `Failed to fetch (API_BASE=${API_BASE}, path=${path})`
    throw new Error(msg)
  }
  if (!resp.ok) {
    let message = 'Request failed'
    try {
      const json = (await resp.json()) as { error?: string }
      message = json.error ?? message
    } catch {
      // ignore
    }
    throw new Error(message)
  }
  return (await resp.json()) as T
}

export function getConfig() {
  return apiFetch<ConfigResponse>('/config')
}

export function getSettings() {
  return apiFetch<AppSettings>('/config/settings')
}

export function updateSettings(patch: Partial<AppSettings>) {
  return apiFetch<AppSettings>('/config/settings', { method: 'PUT', body: JSON.stringify(patch) })
}

export function getNews(params: { source?: string; from?: string; to?: string }) {
  const qs = new URLSearchParams()
  if (params.source) qs.set('source', params.source)
  if (params.from) qs.set('from', params.from)
  if (params.to) qs.set('to', params.to)
  const suffix = qs.toString()
  return apiFetch<{ items: NewsItem[] }>(`/news${suffix ? `?${suffix}` : ''}`).then((x) => x.items)
}

export function getVideos(params: { source?: string }) {
  const qs = new URLSearchParams()
  if (params.source) qs.set('source', params.source)
  const suffix = qs.toString()
  return apiFetch<{ items: VideoItem[] }>(`/videos${suffix ? `?${suffix}` : ''}`).then((x) => x.items)
}

export function getWeatherByCoords(lat: number, lon: number) {
  const qs = new URLSearchParams()
  qs.set('lat', String(lat))
  qs.set('lon', String(lon))
  return apiFetch<WeatherResponse>(`/weather?${qs.toString()}`)
}

export async function geocodePlaceName(placeName: string): Promise<GeocodeResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', `${placeName}, Vietnam`)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const resp = await fetch(url.toString(), {
    headers: {
      // Nominatim requires a valid UA per usage policy
      'User-Agent': 'news-map-frontend/1.0 (local dev)',
    },
  })
  if (!resp.ok) return null
  const json = (await resp.json()) as Array<{ lat: string; lon: string; display_name: string }>
  const first = json[0]
  if (!first) return null
  return { lat: Number(first.lat), lng: Number(first.lon), placeName }
}

