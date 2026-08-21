import { defineStore } from 'pinia'

export const usePwaStore = defineStore('pwa', () => {
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  let updateServiceWorker: (() => Promise<void>) | undefined

  async function initPwa() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator))
      return

    try {
      const { registerSW } = await import('virtual:pwa-register')
      updateServiceWorker = registerSW({
        immediate: true,
        onNeedRefresh() {
          needRefresh.value = true
        },
        onOfflineReady() {
          offlineReady.value = true
        },
      })
    }
    catch (err) {
      console.warn('[PWA] Service worker registration failed:', err)
    }
  }

  async function reload() {
    if (updateServiceWorker)
      await updateServiceWorker()
    needRefresh.value = false
  }

  return {
    needRefresh,
    offlineReady,
    initPwa,
    reload,
  }
})
