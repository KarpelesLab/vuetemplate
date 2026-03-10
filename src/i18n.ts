import { createI18n } from 'vue-i18n'
import { getLocale } from '@karpeleslab/klbfw'

// Eagerly import all locale JSON files
const localeModules = import.meta.glob('./locale/**/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, string> }
>

// Build messages object from locale files
// Files are expected at ./locale/<lang>/<namespace>.json
// Messages are merged per locale, namespaced by filename
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messages: Record<string, any> = {}

for (const path in localeModules) {
  // path looks like: ./locale/en-US/common.json
  const match = path.match(/\.\/locale\/([^/]+)\/(.+)\.json$/)
  if (!match) continue

  const [, locale, namespace] = match
  if (!messages[locale]) {
    messages[locale] = {}
  }
  messages[locale][namespace] = localeModules[path].default
}

const i18n = createI18n({
  legacy: false,
  locale: getLocale() || 'en-US',
  fallbackLocale: 'en-US',
  messages,
})

export default i18n
