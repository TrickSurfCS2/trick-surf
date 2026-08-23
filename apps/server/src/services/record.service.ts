import type {
  MapRecordsResponse,
  PlayerLeaderboardEntry,
  RecentCompleteItem,
  TrickCompleteEntry,
  TrickCompletesResponse,
  TrickRecordSummary,
  WrInfo,
} from '#/models/record'
import prisma from '#/prisma'

export class RecordService {
  getMapRecords = async (mapId: number): Promise<MapRecordsResponse> => {
    // 1. Fetch all tricks on this map
    const tricks = await prisma.trick.findMany({
      where: { mapId: Number(mapId) },
      select: {
        id: true,
        name: true,
        point: true,
        startType: true,
      },
      orderBy: { id: 'asc' },
    })

    if (tricks.length === 0) {
      return {
        mapId: Number(mapId),
        trickRecords: [],
        leaderboard: [],
        recentCompletes: [],
      }
    }

    const trickIds = tricks.map(t => t.id)
    const trickMap = new Map(tricks.map(t => [t.id, t]))

    // 2. Fetch all completes for these tricks
    const completes = await prisma.complete.findMany({
      where: { trickId: { in: trickIds } },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            steamid: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    })

    // Group completes by trickId
    const completesByTrick = new Map<number, typeof completes>()
    for (const c of completes) {
      const list = completesByTrick.get(c.trickId) || []
      list.push(c)
      completesByTrick.set(c.trickId, list)
    }

    // Compute WRs per trick
    const trickRecords: TrickRecordSummary[] = []
    const timeWrHolders = new Map<number, WrInfo>()
    const speedWrHolders = new Map<number, WrInfo>()

    for (const trick of tricks) {
      const trickCompletes = completesByTrick.get(trick.id) || []
      let timeWr: WrInfo | null = null
      let speedWr: WrInfo | null = null

      for (const c of trickCompletes) {
        if (!timeWr || c.time < (timeWr.time ?? Number.POSITIVE_INFINITY)) {
          timeWr = {
            completeId: c.id,
            userId: c.userId,
            username: c.User?.username || 'Unknown',
            steamid: c.User?.steamid || '',
            time: c.time,
            speed: c.speed,
            createdAt: c.createdAt,
          }
        }

        if (!speedWr || c.speed > (speedWr.speed ?? Number.NEGATIVE_INFINITY)) {
          speedWr = {
            completeId: c.id,
            userId: c.userId,
            username: c.User?.username || 'Unknown',
            steamid: c.User?.steamid || '',
            time: c.time,
            speed: c.speed,
            createdAt: c.createdAt,
          }
        }
      }

      if (timeWr)
        timeWrHolders.set(trick.id, timeWr)
      if (speedWr)
        speedWrHolders.set(trick.id, speedWr)

      trickRecords.push({
        trickId: trick.id,
        trickName: trick.name,
        trickPoint: trick.point,
        trickStartType: trick.startType,
        totalCompletes: trickCompletes.length,
        timeWr,
        speedWr,
      })
    }

    // 3. Compute Map Leaderboard
    const playerStatsMap = new Map<
      number,
      {
        userId: number
        username: string
        steamid: string
        uniqueTrickIds: Set<number>
        points: number
        totalCompletesCount: number
        timeWrCount: number
        speedWrCount: number
      }
    >()

    for (const c of completes) {
      let stat = playerStatsMap.get(c.userId)
      if (!stat) {
        stat = {
          userId: c.userId,
          username: c.User?.username || 'Unknown',
          steamid: c.User?.steamid || '',
          uniqueTrickIds: new Set<number>(),
          points: 0,
          totalCompletesCount: 0,
          timeWrCount: 0,
          speedWrCount: 0,
        }
        playerStatsMap.set(c.userId, stat)
      }

      stat.totalCompletesCount += 1
      if (!stat.uniqueTrickIds.has(c.trickId)) {
        stat.uniqueTrickIds.add(c.trickId)
        const trick = trickMap.get(c.trickId)
        if (trick) {
          stat.points += trick.point
        }
      }
    }

    // Calculate WR counts per player
    for (const [, wr] of timeWrHolders) {
      const stat = playerStatsMap.get(wr.userId)
      if (stat)
        stat.timeWrCount += 1
    }
    for (const [, wr] of speedWrHolders) {
      const stat = playerStatsMap.get(wr.userId)
      if (stat)
        stat.speedWrCount += 1
    }

    const leaderboard: PlayerLeaderboardEntry[] = Array.from(playerStatsMap.values())
      .sort((a, b) => {
        if (b.points !== a.points)
          return b.points - a.points
        if (b.uniqueTrickIds.size !== a.uniqueTrickIds.size)
          return b.uniqueTrickIds.size - a.uniqueTrickIds.size
        const bWrTotal = b.timeWrCount + b.speedWrCount
        const aWrTotal = a.timeWrCount + a.speedWrCount
        if (bWrTotal !== aWrTotal)
          return bWrTotal - aWrTotal
        return b.totalCompletesCount - a.totalCompletesCount
      })
      .map((stat, idx) => ({
        rank: idx + 1,
        userId: stat.userId,
        username: stat.username,
        steamid: stat.steamid,
        points: stat.points,
        completedTricksCount: stat.uniqueTrickIds.size,
        totalCompletesCount: stat.totalCompletesCount,
        timeWrCount: stat.timeWrCount,
        speedWrCount: stat.speedWrCount,
      }))

    // 4. Recent completes (latest 30)
    const recentCompletes: RecentCompleteItem[] = completes.slice(0, 30).map(c => ({
      id: c.id,
      trickId: c.trickId,
      trickName: trickMap.get(c.trickId)?.name || 'Unknown Trick',
      userId: c.userId,
      username: c.User?.username || 'Unknown',
      steamid: c.User?.steamid || '',
      speed: c.speed,
      time: c.time,
      createdAt: c.createdAt,
    }))

    return {
      mapId: Number(mapId),
      trickRecords,
      leaderboard,
      recentCompletes,
    }
  }

  getTrickCompletes = async (trickId: number): Promise<TrickCompletesResponse | null> => {
    const trick = await prisma.trick.findUnique({
      where: { id: Number(trickId) },
    })

    if (!trick)
      return null

    const completes = await prisma.complete.findMany({
      where: { trickId: Number(trickId) },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            steamid: true,
          },
        },
      },
    })

    // Rank by time (ascending)
    const sortedByTime = [...completes].sort((a, b) => a.time - b.time)
    const timeRanks = new Map<number, number>()
    sortedByTime.forEach((c, idx) => {
      timeRanks.set(c.id, idx + 1)
    })

    // Rank by speed (descending)
    const sortedBySpeed = [...completes].sort((a, b) => b.speed - a.speed)
    const speedRanks = new Map<number, number>()
    sortedBySpeed.forEach((c, idx) => {
      speedRanks.set(c.id, idx + 1)
    })

    let timeWr: WrInfo | null = null
    let speedWr: WrInfo | null = null

    if (sortedByTime.length > 0) {
      const best = sortedByTime[0]
      timeWr = {
        completeId: best.id,
        userId: best.userId,
        username: best.User?.username || 'Unknown',
        steamid: best.User?.steamid || '',
        time: best.time,
        speed: best.speed,
        createdAt: best.createdAt,
      }
    }

    if (sortedBySpeed.length > 0) {
      const best = sortedBySpeed[0]
      speedWr = {
        completeId: best.id,
        userId: best.userId,
        username: best.User?.username || 'Unknown',
        steamid: best.User?.steamid || '',
        time: best.time,
        speed: best.speed,
        createdAt: best.createdAt,
      }
    }

    const completeEntries: TrickCompleteEntry[] = sortedByTime.map(c => ({
      id: c.id,
      userId: c.userId,
      username: c.User?.username || 'Unknown',
      steamid: c.User?.steamid || '',
      speed: c.speed,
      time: c.time,
      createdAt: c.createdAt,
      rankByTime: timeRanks.get(c.id) ?? 0,
      rankBySpeed: speedRanks.get(c.id) ?? 0,
    }))

    return {
      trickId: trick.id,
      trickName: trick.name,
      trickPoint: trick.point,
      trickStartType: trick.startType,
      mapId: trick.mapId,
      timeWr,
      speedWr,
      completes: completeEntries,
    }
  }

  getLeaderboard = async (params?: { mapId?: number, limit?: number }): Promise<PlayerLeaderboardEntry[]> => {
    if (params?.mapId) {
      const mapRecords = await this.getMapRecords(params.mapId)
      return params.limit ? mapRecords.leaderboard.slice(0, params.limit) : mapRecords.leaderboard
    }

    // Global leaderboard across all maps
    const allTricks = await prisma.trick.findMany({
      select: { id: true, point: true },
    })
    const trickMap = new Map(allTricks.map(t => [t.id, t]))

    const allCompletes = await prisma.complete.findMany({
      include: {
        User: {
          select: { id: true, username: true, steamid: true },
        },
      },
    })

    const playerStatsMap = new Map<
      number,
      {
        userId: number
        username: string
        steamid: string
        uniqueTrickIds: Set<number>
        points: number
        totalCompletesCount: number
        timeWrCount: number
        speedWrCount: number
      }
    >()

    for (const c of allCompletes) {
      let stat = playerStatsMap.get(c.userId)
      if (!stat) {
        stat = {
          userId: c.userId,
          username: c.User?.username || 'Unknown',
          steamid: c.User?.steamid || '',
          uniqueTrickIds: new Set<number>(),
          points: 0,
          totalCompletesCount: 0,
          timeWrCount: 0,
          speedWrCount: 0,
        }
        playerStatsMap.set(c.userId, stat)
      }

      stat.totalCompletesCount += 1
      if (!stat.uniqueTrickIds.has(c.trickId)) {
        stat.uniqueTrickIds.add(c.trickId)
        const trick = trickMap.get(c.trickId)
        if (trick)
          stat.points += trick.point
      }
    }

    const leaderboard: PlayerLeaderboardEntry[] = Array.from(playerStatsMap.values())
      .sort((a, b) => {
        if (b.points !== a.points)
          return b.points - a.points
        if (b.uniqueTrickIds.size !== a.uniqueTrickIds.size)
          return b.uniqueTrickIds.size - a.uniqueTrickIds.size
        return b.totalCompletesCount - a.totalCompletesCount
      })
      .map((stat, idx) => ({
        rank: idx + 1,
        userId: stat.userId,
        username: stat.username,
        steamid: stat.steamid,
        points: stat.points,
        completedTricksCount: stat.uniqueTrickIds.size,
        totalCompletesCount: stat.totalCompletesCount,
        timeWrCount: stat.timeWrCount,
        speedWrCount: stat.speedWrCount,
      }))

    return params?.limit ? leaderboard.slice(0, params.limit) : leaderboard
  }
}

export const recordService = new RecordService()
export default RecordService
