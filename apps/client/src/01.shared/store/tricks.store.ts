import type {
  CreateTrickDto,
  CreateTriggerDto,
  SortDir,
  TrickItem,
  TrickSortKey,
  TrickSortSetting,
  TriggerItem,
  UpdateTrickDto,
  UpdateTriggerDto,
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

  // --- TRICK MUTATIONS ---

  async function createTrick(dto: CreateTrickDto): Promise<TrickItem> {
    const created = await defaultRepositories.trick.create(dto)

    // Resolve triggers for local display
    const routeTriggers = (dto.triggerIds || [])
      .map(id => triggers.value.find(t => t.id === Number(id)))
      .filter((t): t is TriggerItem => !!t)

    const fullTrick: TrickItem = {
      ...created,
      index: tricks.value.length + 1,
      trickLength: routeTriggers.length,
      triggers: routeTriggers.length > 0 ? routeTriggers : (created.triggers || []),
      totalCompletes: 0,
    }

    tricks.value.push(fullTrick)
    applyFiltersAndSort()

    return fullTrick
  }

  async function updateTrick(id: number, dto: UpdateTrickDto): Promise<TrickItem> {
    const updated = await defaultRepositories.trick.update(id, dto)

    const idx = tricks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      let routeTriggers = tricks.value[idx].triggers || []
      if (dto.triggerIds !== undefined) {
        routeTriggers = dto.triggerIds
          .map(tId => triggers.value.find(t => t.id === Number(tId)))
          .filter((t): t is TriggerItem => !!t)
      }

      tricks.value[idx] = {
        ...tricks.value[idx],
        ...updated,
        name: dto.name ?? updated.name,
        point: dto.point !== undefined ? Number(dto.point) : updated.point,
        startType: dto.startType !== undefined ? Number(dto.startType) : updated.startType,
        authorUsername: dto.authorUsername ?? tricks.value[idx].authorUsername,
        trickLength: routeTriggers.length,
        triggers: routeTriggers,
      }
      applyFiltersAndSort()

      return tricks.value[idx]
    }

    return updated
  }

  async function deleteTrick(id: number): Promise<void> {
    await defaultRepositories.trick.delete(id)
    tricks.value = tricks.value.filter(t => t.id !== id)
    // Re-index remaining tricks
    tricks.value.forEach((t, idx) => {
      t.index = idx + 1
    })
    applyFiltersAndSort()
  }

  async function duplicateTrick(trickId: number): Promise<TrickItem | null> {
    const original = tricks.value.find(t => t.id === trickId)
    if (!original || !currentMapId.value)
      return null

    const triggerIds = (original.triggers || []).map(t => t.id)

    return createTrick({
      name: `${original.name} (Copy)`,
      point: original.point,
      startType: original.startType,
      mapId: currentMapId.value,
      authorUsername: original.authorUsername || 'You',
      triggerIds,
    })
  }

  // --- TRIGGER MUTATIONS ---

  async function createTrigger(dto: CreateTriggerDto): Promise<TriggerItem> {
    const created = await defaultRepositories.trigger.create(dto)
    triggers.value.push(created)

    return created
  }

  async function updateTrigger(id: number, dto: UpdateTriggerDto): Promise<TriggerItem> {
    const updated = await defaultRepositories.trigger.update(id, dto)
    const idx = triggers.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      triggers.value[idx] = {
        ...triggers.value[idx],
        ...updated,
      }
    }

    // Also update any tricks referencing this trigger
    tricks.value.forEach((trick) => {
      if (trick.triggers) {
        trick.triggers = trick.triggers.map((t) => {
          if (t.id === id) {
            return { ...t, ...updated }
          }

          return t
        })
      }
    })

    applyFiltersAndSort()

    return updated
  }

  async function deleteTrigger(id: number): Promise<void> {
    await defaultRepositories.trigger.delete(id)
    triggers.value = triggers.value.filter(t => t.id !== id)

    // Remove deleted trigger from trick routes
    tricks.value.forEach((trick) => {
      if (trick.triggers) {
        trick.triggers = trick.triggers.filter(t => t.id !== id)
        trick.trickLength = trick.triggers.length
      }
    })

    applyFiltersAndSort()
  }

  function getTriggerUsageCount(triggerId: number): number {
    return tricks.value.filter(trick =>
      trick.triggers?.some(t => t.id === triggerId)).length
  }

  function exportData() {
    return {
      mapId: currentMapId.value,
      exportedAt: new Date().toISOString(),
      tricks: tricks.value,
      triggers: triggers.value,
    }
  }

  async function importData(payload: { tricks?: CreateTrickDto[], triggers?: CreateTriggerDto[] }) {
    if (!currentMapId.value)
      return

    if (payload.triggers && payload.triggers.length > 0) {
      for (const tDto of payload.triggers) {
        await createTrigger({ ...tDto, mapId: currentMapId.value })
      }
    }

    if (payload.tricks && payload.tricks.length > 0) {
      for (const tDto of payload.tricks) {
        await createTrick({ ...tDto, mapId: currentMapId.value })
      }
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
    createTrick,
    updateTrick,
    deleteTrick,
    duplicateTrick,
    createTrigger,
    updateTrigger,
    deleteTrigger,
    getTriggerUsageCount,
    exportData,
    importData,
  }
})
