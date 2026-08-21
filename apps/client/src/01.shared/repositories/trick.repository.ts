import type { GetTrickListParams, TrickItem } from '~/01.shared/types/models'
import { z } from 'zod'
import { applyAcl } from '~/01.shared/lib/acl'
import { api } from '~/01.shared/services/api.service'
import { offlineService } from '~/01.shared/services/offline.service'
import { TrickSchema } from '~/01.shared/types/schemas'

export interface ITrickRepository {
  list: (params?: GetTrickListParams) => Promise<TrickItem[]>
}

export class DefaultTrickRepository implements ITrickRepository {
  async list(params?: GetTrickListParams): Promise<TrickItem[]> {
    try {
      const raw = await api.trick.list(params)
      const data = applyAcl(z.array(TrickSchema), raw, 'trick.list()')
      if (params?.mapId)
        await offlineService.saveTricks(params.mapId, data).catch(() => {})

      return data
    }
    catch (error) {
      if (params?.mapId) {
        const offlineData = await offlineService.getTricks(params.mapId)
        if (offlineData && offlineData.length > 0)
          return applyAcl(z.array(TrickSchema), offlineData, 'trick.list() [offline]')
      }

      throw error
    }
  }
}

export const trickRepository: ITrickRepository = new DefaultTrickRepository()
