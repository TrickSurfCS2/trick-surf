import type {
  MapRecordsResponse,
  PlayerLeaderboardEntry,
  TrickCompletesResponse,
} from '~/01.shared/types/models'
import { api } from '~/01.shared/services/api.service'

export interface IRecordRepository {
  getMapRecords: (mapId: number) => Promise<MapRecordsResponse>
  getTrickCompletes: (trickId: number) => Promise<TrickCompletesResponse>
  getLeaderboard: (params?: { mapId?: number, limit?: number }) => Promise<PlayerLeaderboardEntry[]>
}

export class DefaultRecordRepository implements IRecordRepository {
  async getMapRecords(mapId: number): Promise<MapRecordsResponse> {
    return api.record.getMapRecords(mapId)
  }

  async getTrickCompletes(trickId: number): Promise<TrickCompletesResponse> {
    return api.record.getTrickCompletes(trickId)
  }

  async getLeaderboard(params?: { mapId?: number, limit?: number }): Promise<PlayerLeaderboardEntry[]> {
    return api.record.getLeaderboard(params)
  }
}

export const recordRepository: IRecordRepository = new DefaultRecordRepository()
