import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ThemesVariant } from '~/01.shared/constants/themes'

export const useGlobalSettingsStore = defineStore('globalSettings', () => {
  const theme = useLocalStorage<ThemesVariant>('app-theme', ThemesVariant.Dark)
  const appLanguage = useLocalStorage<string>('global-app-language', 'ru')

  if (theme.value !== ThemesVariant.Dark && theme.value !== ThemesVariant.Light) {
    theme.value = ThemesVariant.Dark
  }

  if (appLanguage.value.startsWith('"') && appLanguage.value.endsWith('"'))
    appLanguage.value = appLanguage.value.replace(/^"|"$/g, '')

  return {
    theme,
    appLanguage,
  }
})
