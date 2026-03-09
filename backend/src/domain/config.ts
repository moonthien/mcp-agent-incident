import { z } from 'zod'

export const MapStyleSchema = z.enum(['default', 'terrain', 'admin', 'dark', 'light', 'satellite'])
export type MapStyle = z.infer<typeof MapStyleSchema>

export const ThemeSchema = z.object({
  default: z.enum(['light', 'dark']),
})

export const ServicesSchema = z.object({
  news: z.object({ enabled: z.boolean() }),
  video: z.object({ enabled: z.boolean() }),
  weather: z.object({ enabled: z.boolean() }),
})

export const GeoAreaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['default', 'region', 'global', 'custom']),
  enabled: z.boolean(),
})

export const AppSettingsSchema = z.object({
  theme: ThemeSchema,
  mapStyle: MapStyleSchema,
  services: ServicesSchema,
  geo: z.object({
    areas: z.array(GeoAreaSchema),
  }),
})
export type AppSettings = z.infer<typeof AppSettingsSchema>

export const NewsSourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  enabled: z.boolean(),
})
export type NewsSource = z.infer<typeof NewsSourceSchema>

export const NewsSourcesFileSchema = z.object({
  newsSources: z.array(NewsSourceSchema),
})
export type NewsSourcesFile = z.infer<typeof NewsSourcesFileSchema>

export function mergeSettings(current: AppSettings, patch: unknown): AppSettings {
  const PatchSchema = z
    .object({
      theme: ThemeSchema.optional(),
      mapStyle: MapStyleSchema.optional(),
      services: ServicesSchema.partial().optional(),
      geo: z
        .object({
          areas: z.array(GeoAreaSchema).optional(),
        })
        .optional(),
    })
    .strict()

  const parsed = PatchSchema.safeParse(patch)
  if (!parsed.success) throw new Error('Invalid settings payload')

  const next: AppSettings = {
    ...current,
    theme: parsed.data.theme ?? current.theme,
    mapStyle: parsed.data.mapStyle ?? current.mapStyle,
    services: {
      ...current.services,
      ...(parsed.data.services ?? {}),
    },
    geo: {
      ...current.geo,
      ...(parsed.data.geo ?? {}),
    },
  }

  return AppSettingsSchema.parse(next)
}

