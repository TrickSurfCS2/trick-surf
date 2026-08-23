export interface WrInfo {
  completeId: number
  userId: number
  username: string
  steamid: string
  time?: number
  speed?: number
  createdAt: Date | string
}

export interface TrickRecordSummary {
  trickId: number
  trickName: string
  trickPoint: number
  trickStartType: number
  totalCompletes: number
  timeWr: WrInfo | null
  speedWr: WrInfo | null
}

export interface PlayerLeaderboardEntry {
  rank: number
  userId: number
  username: string
  steamid: string
  points: number
  completedTricksCount: number
  totalCompletesCount: number
  timeWrCount: number
  speedWrCount: number
}

export interface RecentCompleteItem {
  id: number
  trickId: number
  trickName: string
  userId: number
  username: string
  steamid: string
  speed: number
  time: number
  createdAt: Date | string
}

export interface MapRecordsResponse {
  mapId: number
  trickRecords: TrickRecordSummary[]
  leaderboard: PlayerLeaderboardEntry[]
  recentCompletes: RecentCompleteItem[]
}

export interface TrickCompleteEntry {
  id: number
  userId: number
  username: string
  steamid: string
  speed: number
  time: number
  createdAt: Date | string
  rankByTime: number
  rankBySpeed: number
}

export interface TrickCompletesResponse {
  trickId: number
  trickName: string
  trickPoint: number
  trickStartType: number
  mapId: number
  timeWr: WrInfo | null
  speedWr: WrInfo | null
  completes: TrickCompleteEntry[]
}
