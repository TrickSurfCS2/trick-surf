import type {
  SortDir,
  TrickItem,
  TrickSortKey,
  TrickSortSetting,
  TriggerItem,
} from '~/01.shared/types/models'
import { defineStore } from 'pinia'
import { defaultRepositories } from '~/00.plugins/di'
import { deepCopy } from '~/01.shared/lib/helpers'

export const useTricksStore = defineStore('tricks', () => {
  const tricks = ref<TrickItem[]>([])
  const triggers = ref<TriggerItem[]>([])
  const filteredTricks = ref<TrickItem[]>([])
  const currentMapId = ref<number | null>(null)
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const searchQuery = ref('')

  const sortedSettings = ref<TrickSortSetting>({
    index: 'none',
    name: 'none',
    point: 'none',
    trickLength: 'none',
    totalCompletes: 'none',
  })

  function applyFiltersAndSort() {
    let result = deepCopy(tricks.value)

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      result = result.filter(t => t.name.toLowerCase().includes(q) || String(t.index ?? '').includes(q))
    }

    Object.entries(sortedSettings.value).forEach(([key, dir]) => {
      if (dir !== 'none') {
        result.sort((a, b) => {
          const aVal = a[key as keyof TrickItem] ?? 0
          const bVal = b[key as keyof TrickItem] ?? 0
          if (aVal < bVal)
            return dir === 'asc' ? -1 : 1
          if (aVal > bVal)
            return dir === 'asc' ? 1 : -1

          return 0
        })
      }
    })

    filteredTricks.value = result
  }

  function toggleSort(key: TrickSortKey) {
    const current = sortedSettings.value[key]
    const nextDir: SortDir = current === 'none' ? 'asc' : current === 'asc' ? 'desc' : 'none'

    sortedSettings.value = {
      index: 'none',
      name: 'none',
      point: 'none',
      trickLength: 'none',
      totalCompletes: 'none',
      [key]: nextDir,
    }

    applyFiltersAndSort()
  }

  function setSearch(query: string) {
    searchQuery.value = query
    applyFiltersAndSort()
  }

  async function fetchTricks(mapId: number) {
    currentMapId.value = mapId
    isLoading.value = true
    isLoaded.value = false

    try {
      const [tricksData, triggersData] = await Promise.all([
        defaultRepositories.trick.list({ mapId }),
        defaultRepositories.trigger.list({ mapId }),
      ])

      tricks.value = (tricksData || []).map((t, idx) => ({
        ...t,
        index: t.index ?? (idx + 1),
        trickLength: t.trickLength ?? (t.triggers?.length || 0),
        totalCompletes: t.totalCompletes ?? 0,
      }))
      triggers.value = triggersData || []
      applyFiltersAndSort()
    }
    catch (err) {
      console.warn('[TricksStore] Failed to fetch tricks/triggers:', err)
      tricks.value = []
      triggers.value = []
      filteredTricks.value = []
    }
    finally {
      isLoading.value = false
      isLoaded.value = true
    }
  }

  return {
    tricks,
    triggers,
    filteredTricks,
    currentMapId,
    isLoading,
    isLoaded,
    searchQuery,
    sortedSettings,
    fetchTricks,
    toggleSort,
    setSearch,
    applyFiltersAndSort,
  }
})
