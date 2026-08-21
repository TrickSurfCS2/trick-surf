import { useHead } from '@vueuse/head'
import { ThemesVariant } from '~/01.shared/constants/themes'
import { useGlobalSettingsStore } from '~/01.shared/store/settings.store'

const themesColors: Record<ThemesVariant, string> = {
  [ThemesVariant.Dark]: '#0d1117',
  [ThemesVariant.Light]: '#faf4f2',
}

export function useChangeTheme() {
  const settingsStore = useGlobalSettingsStore()

  useHead({
    meta: [
      {
        name: 'theme-color',
        content: () => themesColors[settingsStore.theme] || '#0d1117',
      },
    ],
  })

  function applyTheme(value: ThemesVariant) {
    document.documentElement.setAttribute('data-theme', value)
    document.documentElement.setAttribute('data-color-mode', value)
  }

  watchEffect(() => applyTheme(settingsStore.theme))

  const setTheme = (value: ThemesVariant) => {
    settingsStore.theme = value
  }

  const toggleTheme = () => {
    const themeOrder = [ThemesVariant.Dark, ThemesVariant.Light]
    const currentIndex = themeOrder.indexOf(settingsStore.theme)
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length]
    setTheme(nextTheme)
  }

  return {
    theme: computed(() => settingsStore.theme),
    setTheme,
    toggleTheme,
  }
}
