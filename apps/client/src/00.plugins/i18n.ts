import { createI18n } from 'vue-i18n'
import en from '~/01.shared/locales/en.json'
import ru from '~/01.shared/locales/ru.json'

const savedLanguage = typeof localStorage !== 'undefined'
  ? localStorage.getItem('global-app-language') || 'ru'
  : 'ru'

const initialLocale = savedLanguage.replace(/^"|"$/g, '')

function ruPluralRule(choice: number): number {
  const mod100 = choice % 100
  if (mod100 >= 11 && mod100 <= 19) {
    return 2
  }

  const mod10 = choice % 10
  if (mod10 === 1) {
    return 0
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return 1
  }

  return 2
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: {
    ru,
    en,
  },
  pluralRules: {
    ru: ruPluralRule,
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
