import type { Pinia } from 'pinia'
import { usePwaStore } from '~/01.shared/store/pwa.store'

export function initializePwaUpdater(pinia: Pinia) {
  const pwaStore = usePwaStore(pinia)
  pwaStore.initPwa()
}
