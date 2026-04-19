import tr from './i18n/locales/tr.json'
import en from './i18n/locales/en.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'tr',
  fallbackLocale: 'en',
  messages: {
    tr,
    en
  }
}))
