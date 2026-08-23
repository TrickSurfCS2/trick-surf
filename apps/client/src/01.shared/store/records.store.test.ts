import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultRepositories } from '~/00.plugins/di'
import { useRecordsStore } from './records.store'

describe('records.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    vi.spyOn(defaultRepositories.record, 'getMapRecords').mockResolvedValue({
      mapId: 1,
      trickRecords: [
        {
          trickId: 101,
          trickName: 'Spawn to Bridge',
          trickPoint: 100,
          trickStartType: 0,
          totalCompletes: 5,
          timeWr: {
            completeId: 1,
            userId: 1,
            username: 'PlayerOne',
            steamid: 'STEAM_1',
            time: 4.5,
            speed: 1200,
            createdAt: new Date().toISOString(),
          },
          speedWr: {
            completeId: 2,
            userId: 2,
            username: 'PlayerTwo',
            steamid: 'STEAM_2',
            time: 5.0,
            speed: 1450,
            createdAt: new Date().toISOString(),
          },
        },
        {
          trickId: 102,
          trickName: 'Tower Climb',
          trickPoint: 50,
          trickStartType: 1,
          totalCompletes: 2,
          timeWr: {
            completeId: 3,
            userId: 1,
            username: 'PlayerOne',
            steamid: 'STEAM_1',
            time: 8.2,
            speed: 900,
            createdAt: new Date().toISOString(),
          },
          speedWr: null,
        },
      ],
      leaderboard: [
        {
          rank: 1,
          userId: 1,
          username: 'PlayerOne',
          steamid: 'STEAM_1',
          points: 150,
          completedTricksCount: 2,
          totalCompletesCount: 5,
          timeWrCount: 2,
          speedWrCount: 0,
        },
        {
          rank: 2,
          userId: 2,
          username: 'PlayerTwo',
          steamid: 'STEAM_2',
          points: 100,
          completedTricksCount: 1,
          totalCompletesCount: 2,
          timeWrCount: 0,
          speedWrCount: 1,
        },
      ],
      recentCompletes: [
        {
          id: 10,
          trickId: 101,
          trickName: 'Spawn to Bridge',
          userId: 1,
          username: 'PlayerOne',
          steamid: 'STEAM_1',
          speed: 1200,
          time: 4.5,
          createdAt: new Date().toISOString(),
        },
      ],
    })
  })

  it('fetches map records and computes stats summary', async () => {
    const store = useRecordsStore()
    await store.fetchMapRecords(1)

    expect(store.mapRecords).toBeDefined()
    expect(store.filteredTrickRecords).toHaveLength(2)
    expect(store.filteredLeaderboard).toHaveLength(2)
    expect(store.filteredRecentCompletes).toHaveLength(1)

    expect(store.statsSummary.totalCompletes).toBe(7)
    expect(store.statsSummary.totalTricks).toBe(2)
    expect(store.statsSummary.totalPlayers).toBe(2)
    expect(store.statsSummary.topPointsPlayer?.username).toBe('PlayerOne')
  })

  it('filters trick records by search and startType', async () => {
    const store = useRecordsStore()
    await store.fetchMapRecords(1)

    store.setSearch('Tower')
    expect(store.filteredTrickRecords).toHaveLength(1)
    expect(store.filteredTrickRecords[0].trickName).toBe('Tower Climb')

    store.setSearch('')
    store.setStartTypeFilter('pre')
    expect(store.filteredTrickRecords).toHaveLength(1)
    expect(store.filteredTrickRecords[0].trickStartType).toBe(1)

    store.setStartTypeFilter('unlimited')
    expect(store.filteredTrickRecords).toHaveLength(1)
    expect(store.filteredTrickRecords[0].trickStartType).toBe(0)
  })

  it('toggles tabs and manages dialog state', () => {
    const store = useRecordsStore()
    expect(store.activeTab).toBe('tricks')

    store.setTab('leaderboard')
    expect(store.activeTab).toBe('leaderboard')

    store.openTrickCompletesDialog(101)
    expect(store.isCompletesDialogOpen).toBe(true)

    store.closeTrickCompletesDialog()
    expect(store.isCompletesDialogOpen).toBe(false)
  })
})
