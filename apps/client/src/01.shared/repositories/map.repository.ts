import type { MapItem } from '~/01.shared/types/models'
import { z } from 'zod'
import { applyAcl } from '~/01.shared/lib/acl'
import { api } from '~/01.shared/services/api.service'
import { offlineService } from '~/01.shared/services/offline.service'
import { MapSchema } from '~/01.shared/types/schemas'

export interface IMapRepository {
  list: () => Promise<MapItem[]>
}

export class DefaultMapRepository implements IMapRepository {
  async list(): Promise<MapItem[]> {
    try {
      const raw = await api.map.list()
      const data = applyAcl(z.array(MapSchema), raw, 'map.list()')
      await offlineService.saveMaps(data).catch(() => {})

      return data
    }
    catch (error) {
      const offlineData = await offlineService.getMaps()
      if (offlineData && offlineData.length > 0)
        return applyAcl(z.array(MapSchema), offlineData, 'map.list() [offline]')
      throw error
    }
  }
}

export const mapRepository: IMapRepository = new DefaultMapRepository()
