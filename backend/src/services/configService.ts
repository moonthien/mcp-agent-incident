import { AppSettingsSchema, type AppSettings, NewsSourcesFileSchema, type NewsSourcesFile } from '../domain/config.js'
import { dataPath, readJsonFile, writeJsonFile } from '../lib/fileStore.js'

const SETTINGS_FILE = dataPath('app-settings.json')
const NEWS_SOURCES_FILE = dataPath('news-sources.json')

export async function getSettings(): Promise<AppSettings> {
  const raw = await readJsonFile<unknown>(SETTINGS_FILE)
  return AppSettingsSchema.parse(raw)
}

export async function saveSettings(next: AppSettings): Promise<AppSettings> {
  await writeJsonFile(SETTINGS_FILE, next)
  return next
}

export async function getNewsSources(): Promise<NewsSourcesFile> {
  const raw = await readJsonFile<unknown>(NEWS_SOURCES_FILE)
  return NewsSourcesFileSchema.parse(raw)
}

export async function saveNewsSources(next: NewsSourcesFile): Promise<NewsSourcesFile> {
  await writeJsonFile(NEWS_SOURCES_FILE, next)
  return next
}

