import { createI18n } from 'vue-i18n'
import en from '~/01.shared/locales/en.json'
import ru from '~/01.shared/locales/ru.json'

const savedLanguage = typeof localStorage !== 'undefined'
  ? localStorage.getItem('global-app-language') || 'ru'
  : 'ru'

const initialLocale = savedLanguage.replace(/^"|"$/g, '')

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: {
    ru,
    en,
  },
})

export async function loadLanguageAsync(lang: string): Promise<void> {
  const cleanLang = lang.replace(/^"|"$/g, '')
  i18n.global.locale.value = cleanLang as 'ru' | 'en'
  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('lang', cleanLang)
  }
}

export const localePromise = Promise.resolve()
