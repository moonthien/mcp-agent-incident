export type MapStyle = 'default' | 'terrain' | 'admin' | 'dark' | 'light' | 'satellite'

export type NewsItem = {
  id: string
  title: string
  description: string | null
  link: string
  source: string
  pubDate: string | null
  lat: number | null
  lng: number | null
  placeName: string | null
}

export type VideoItem = {
  id: string
  title: string
  thumbnail: string | null
  source: string
  url: string
  publishedAt: string | null
  lat?: number
  lng?: number
}

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

export type GeocodeResult = {
  lat: number
  lng: number
  placeName: string
}

export type AppSettings = {
  theme: { default: 'light' | 'dark' }
  mapStyle: MapStyle
  services: {
    news: { enabled: boolean }
    video: { enabled: boolean }
    weather: { enabled: boolean }
  }
  geo: {
    areas: Array<{ id: string; name: string; type: string; enabled: boolean }>
  }
}

export type ConfigResponse = {
  theme: AppSettings['theme']
  mapStyle: AppSettings['mapStyle']
  services: AppSettings['services']
  video: { youtube: { enabled: boolean }; tiktok: { enabled: boolean } }
  weather: { provider: 'open-meteo' | 'openweathermap'; openweatherConfigured: boolean }
  news: { sourcesCount: number }
  geo: AppSettings['geo']
  newsSources: Array<{ name: string; enabled: boolean }>
}

