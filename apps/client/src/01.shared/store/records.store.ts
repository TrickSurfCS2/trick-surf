import type {
  MapRecordsResponse,
  PlayerLeaderboardEntry,
  RecentCompleteItem,
  RecordSortKey,
  RecordTabKey,
  SortDir,
  TrickCompletesResponse,
  TrickRecordSummary,
} from '~/01.shared/types/models'
import { defineStore } from 'pinia'
import { defaultRepositories } from '~/00.plugins/di'

const trickComparators: Partial<Record<RecordSortKey, (a: TrickRecordSummary, b: TrickRecordSummary) => number>> = {
  name: (a, b) => a.trickName.localeCompare(b.trickName),
  point: (a, b) => a.trickPoint - b.trickPoint,
  completes: (a, b) => a.totalCompletes - b.totalCompletes,
  timeWr: (a, b) => (a.timeWr?.time ?? Number.POSITIVE_INFINITY) - (b.timeWr?.time ?? Number.POSITIVE_INFINITY),
  speedWr: (a, b) => (a.speedWr?.speed ?? 0) - (b.speedWr?.speed ?? 0),
}

function compareTrickRecords(
  a: TrickRecordSummary,
  b: TrickRecordSummary,
  key: RecordSortKey,
  dir: number,
): number {
  const comparator = trickComparators[key]

  return comparator ? dir * comparator(a, b) : 0
}

const leaderboardComparators: Partial<Record<RecordSortKey, (a: PlayerLeaderboardEntry, b: PlayerLeaderboardEntry) => number>> = {
  points: (a, b) => a.points - b.points,
  completes: (a, b) => a.completedTricksCount - b.completedTricksCount,
  wrs: (a, b) => (a.timeWrCount + a.speedWrCount) - (b.timeWrCount + b.speedWrCount),
  name: (a, b) => a.username.localeCompare(b.username),
}

function compareLeaderboard(
  a: PlayerLeaderboardEntry,
  b: PlayerLeaderboardEntry,
  key: RecordSortKey,
  dir: number,
): number {
  const comparator = leaderboardComparators[key]

  return comparator ? dir * comparator(a, b) : dir * (a.rank - b.rank)
}

export const useRecordsStore = defineStore('records', () => {
  const currentMapId = ref<number | null>(null)
  const mapRecords = ref<MapRecordsResponse | null>(null)
  const selectedTrickCompletes = ref<TrickCompletesResponse | null>(null)
  const activeTab = ref<RecordTabKey>('tricks')
  const searchQuery = ref('')
  const startTypeFilter = ref<'all' | 'pre' | 'unlimited'>('all')

  const isLoading = ref(false)
  const isCompletesLoading = ref(false)
  const isCompletesDialogOpen = ref(false)
  const error = ref<string | null>(null)

  const sortKey = ref<RecordSortKey>('index')
  const sortDir = ref<SortDir>('none')

  async function fetchMapRecords(mapId: number, force = false) {
    if (!force && currentMapId.value === mapId && mapRecords.value)
      return

    currentMapId.value = mapId
    isLoading.value = true
    error.value = null

    try {
      const data = await defaultRepositories.record.getMapRecords(mapId)
      mapRecords.value = data
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch map records'
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchTrickCompletes(trickId: number) {
    isCompletesLoading.value = true
    try {
      const data = await defaultRepositories.record.getTrickCompletes(trickId)
      selectedTrickCompletes.value = data
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch trick completes'
    }
    finally {
      isCompletesLoading.value = false
    }
  }

  function openTrickCompletesDialog(trickId: number) {
    isCompletesDialogOpen.value = true
    fetchTrickCompletes(trickId)
  }

  function closeTrickCompletesDialog() {
    isCompletesDialogOpen.value = false
    selectedTrickCompletes.value = null
  }

  function setTab(tab: RecordTabKey) {
    activeTab.value = tab
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  function setStartTypeFilter(filter: 'all' | 'pre' | 'unlimited') {
    startTypeFilter.value = filter
  }

  function toggleSort(key: RecordSortKey) {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'none' ? 'asc' : sortDir.value === 'asc' ? 'desc' : 'none'
    }
    else {
      sortKey.value = key
      sortDir.value = 'asc'
    }
  }

  // Computed filtered trick records
  const filteredTrickRecords = computed<TrickRecordSummary[]>(() => {
    if (!mapRecords.value?.trickRecords)
      return []

    let result = [...mapRecords.value.trickRecords]

    // Mode filter
    if (startTypeFilter.value === 'pre') {
      result = result.filter(t => t.trickStartType === 1)
    }
    else if (startTypeFilter.value === 'unlimited') {
      result = result.filter(t => t.trickStartType === 0)
    }

    // Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      result = result.filter((t, idx) =>
        t.trickName.toLowerCase().includes(q)
        || String(idx + 1).includes(q)
        || t.timeWr?.username.toLowerCase().includes(q)
        || t.speedWr?.username.toLowerCase().includes(q))
    }

    // Sorting
    if (sortDir.value !== 'none') {
      const dir = sortDir.value === 'asc' ? 1 : -1
      result.sort((a, b) => compareTrickRecords(
        a,
        b,
        sortKey.value,
        dir,
      ))
    }

    return result
  })

  // Computed filtered leaderboard
  const filteredLeaderboard = computed<PlayerLeaderboardEntry[]>(() => {
    if (!mapRecords.value?.leaderboard)
      return []

    let result = [...mapRecords.value.leaderboard]

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      result = result.filter(p =>
        p.username.toLowerCase().includes(q)
        || p.steamid.toLowerCase().includes(q)
        || String(p.rank).includes(q))
    }

    if (sortDir.value !== 'none') {
      const dir = sortDir.value === 'asc' ? 1 : -1
      result.sort((a, b) => compareLeaderboard(
        a,
        b,
        sortKey.value,
        dir,
      ))
    }

    return result
  })

  // Computed filtered recent completes
  const filteredRecentCompletes = computed<RecentCompleteItem[]>(() => {
    if (!mapRecords.value?.recentCompletes)
      return []

    let result = [...mapRecords.value.recentCompletes]

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      result = result.filter(c =>
        c.trickName.toLowerCase().includes(q)
        || c.username.toLowerCase().includes(q)
        || c.steamid.toLowerCase().includes(q))
    }

    return result
  })

  // Overview Stats
  const statsSummary = computed(() => {
    const records = mapRecords.value
    if (!records) {
      return {
        totalCompletes: 0,
        totalTricks: 0,
        totalPlayers: 0,
        topPointsPlayer: null as PlayerLeaderboardEntry | null,
        topWrPlayer: null as PlayerLeaderboardEntry | null,
      }
    }

    const totalCompletes = records.trickRecords.reduce((acc, t) => acc + t.totalCompletes, 0)
    const totalTricks = records.trickRecords.length
    const totalPlayers = records.leaderboard.length

    const topPointsPlayer = records.leaderboard[0] ?? null

    const topWrPlayer = [...records.leaderboard].sort((a, b) => {
      const bWrs = b.timeWrCount + b.speedWrCount
      const aWrs = a.timeWrCount + a.speedWrCount

      return bWrs - aWrs
    })[0] ?? null

    return {
      totalCompletes,
      totalTricks,
      totalPlayers,
      topPointsPlayer,
      topWrPlayer: topWrPlayer && (topWrPlayer.timeWrCount + topWrPlayer.speedWrCount > 0) ? topWrPlayer : null,
    }
  })

  return {
    currentMapId,
    mapRecords,
    selectedTrickCompletes,
    activeTab,
    searchQuery,
    startTypeFilter,
    isLoading,
    isCompletesLoading,
    isCompletesDialogOpen,
    error,
    sortKey,
    sortDir,
    filteredTrickRecords,
    filteredLeaderboard,
    filteredRecentCompletes,
    statsSummary,
    fetchMapRecords,
    fetchTrickCompletes,
    openTrickCompletesDialog,
    closeTrickCompletesDialog,
    setTab,
    setSearch,
    setStartTypeFilter,
    toggleSort,
  }
})
