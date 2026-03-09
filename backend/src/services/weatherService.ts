import { getSettings } from './configService.js'

export type WeatherResponse = {
  placeName?: string
  latitude: number
  longitude: number
  current?: {
    time: string
    temperature_2m?: number
    weather_code?: number
    wind_speed_10m?: number
  }
  daily?: {
    time: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    weather_code?: number[]
  }
}

const PLACE_COORDS: Record<string, { name: string; lat: number; lon: number }> = {
  'ha-noi': { name: 'Hà Nội', lat: 21.0278, lon: 105.8342 },
  hanoi: { name: 'Hà Nội', lat: 21.0278, lon: 105.8342 },
  'tp-ho-chi-minh': { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  tphcm: { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  'da-nang': { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  'can-tho': { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
  'hai-phong': { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  hue: { name: 'Huế', lat: 16.4637, lon: 107.5909 },
  'nha-trang': { name: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
}

async function fetchOpenMeteo(lat: number, lon: number): Promise<WeatherResponse> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m')
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code')
  url.searchParams.set('timezone', 'auto')

  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Weather provider error')
  return (await resp.json()) as WeatherResponse
}

export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherResponse> {
  const settings = await getSettings()
  if (!settings.services.weather.enabled) {
    return { latitude: lat, longitude: lon }
  }
  return fetchOpenMeteo(lat, lon)
}

export async function getWeatherByPlace(placeId: string): Promise<WeatherResponse | null> {
  const p = PLACE_COORDS[placeId]
  if (!p) return null
  const data = await getWeatherByCoords(p.lat, p.lon)
  return { ...data, placeName: p.name }
}

