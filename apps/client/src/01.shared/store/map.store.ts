import type { MapItem } from '~/01.shared/types/models'
import { defineStore } from 'pinia'
import { defaultRepositories } from '~/00.plugins/di'

export const useMapStore = defineStore('map', () => {
  const maps = ref<MapItem[]>([])
  const selectedMap = ref<MapItem | null>(null)
  const isLoading = ref(false)
  const isLoaded = ref(false)

  async function fetchMaps(): Promise<MapItem[]> {
    if (isLoaded.value && maps.value.length > 0)
      return maps.value

    isLoading.value = true
    try {
      const data = await defaultRepositories.map.list()
      maps.value = data || []
      isLoaded.value = true

      return maps.value
    }
    catch (err) {
      console.warn('[MapStore] Failed to fetch maps:', err)

      return []
    }
    finally {
      isLoading.value = false
    }
  }

  function setMapByName(name?: string) {
    if (!name && maps.value.length > 0) {
      selectedMap.value = maps.value[0]

      return
    }

    const found = maps.value.find(m => m.name.toLowerCase() === name?.toLowerCase())
    if (found) {
      selectedMap.value = found
    }
    else if (maps.value.length > 0) {
      selectedMap.value = maps.value[0]
    }
  }

  return {
    maps,
    selectedMap,
    isLoading,
    isLoaded,
    fetchMaps,
    setMapByName,
  }
})
