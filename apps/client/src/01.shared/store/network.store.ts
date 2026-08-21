import { useOnline } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useNetworkStore = defineStore('network', () => {
  const isOnline = useOnline()
  const isNetworkTimeoutModalOpen = ref(false)

  function initListeners() {
    // network listeners initialized via useOnline
  }

  return {
    isOnline,
    isNetworkTimeoutModalOpen,
    initListeners,
  }
})
