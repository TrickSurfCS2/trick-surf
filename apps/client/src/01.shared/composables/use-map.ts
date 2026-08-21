import { useRoute } from 'vue-router'
import { useMapStore } from '~/01.shared/store/map.store'

export function useCurrentMap() {
  const route = useRoute()
  const mapStore = useMapStore()

  const mapParam = computed(() => route.params.map as string | undefined)

  watch(() => [mapParam.value, mapStore.maps], ([name]) => {
    mapStore.setMapByName(name as string | undefined)
  }, { immediate: true })

  return {
    map: computed(() => mapStore.selectedMap),
    mapParam,
    maps: computed(() => mapStore.maps),
    isLoading: computed(() => mapStore.isLoading),
  }
}
