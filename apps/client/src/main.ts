/* eslint-disable perfectionist/sort-imports */
import 'zone.js'
import { PiniaColada } from '@pinia/colada'
import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { defaultRepositories, REPOS_INJECTION_KEY } from '~/00.plugins/di'
import { i18n } from '~/00.plugins/i18n'
import { vLongPress } from '~/01.shared/directives/long-press'
import { vRipple } from '~/01.shared/directives/ripple'
import router from '~/01.shared/lib/router'
import { configureApi } from '~/01.shared/services/api.service'
import { initMonitoring, setupVueMonitoring } from '~/01.shared/services/monitoring.service'
import { initializePwaUpdater } from '~/01.shared/services/pwa.service'
import { useAuthStore } from '~/01.shared/store/auth.store'
import { useToastStore } from '~/01.shared/store/toast.store'
import App from './app.vue'

import '~/assets/scss/normalize.scss'
import '~/assets/scss/global.scss'
/* eslint-enable perfectionist/sort-imports */

async function bootstrap() {
  initMonitoring()

  const app = createApp(App)
  const pinia = createPinia()
  const head = createHead()

  // 1. Directives & Core Plugins
  app.directive('ripple', vRipple)
  app.directive('longPress', vLongPress)

  app.use(pinia)
  app.use(PiniaColada)
  app.use(i18n)
  app.use(head)
  app.provide(REPOS_INJECTION_KEY, defaultRepositories)

  // 2. Configure API
  const authStore = useAuthStore()
  const toastStore = useToastStore()

  authStore.init()

  configureApi({
    getToken: () => (typeof localStorage !== 'undefined' ? localStorage.getItem('trick_surf_token') : null),
    onUnauthorized: () => authStore.logout(),
    onError: message => toastStore.error(message),
  })

  // 3. Plugins setup
  try {
    const { setupPlugins } = await import('~/00.plugins/index')
    await setupPlugins(app, router)
  }
  catch (err) {
    console.warn('[bootstrap] Failed to setup plugins:', err)
  }

  // 4. Router & Mount
  app.use(router)
  setupVueMonitoring(app, router)
  await router.isReady()
  app.mount('#app')

  document.getElementById('app-preloader')?.remove()

  // 5. PWA updater
  initializePwaUpdater(pinia)
}

bootstrap()
