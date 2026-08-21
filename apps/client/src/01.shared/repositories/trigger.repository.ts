import type { GetTriggerParams, TriggerItem } from '~/01.shared/types/models'
import { z } from 'zod'
import { applyAcl } from '~/01.shared/lib/acl'
import { api } from '~/01.shared/services/api.service'
import { offlineService } from '~/01.shared/services/offline.service'
import { TriggerSchema } from '~/01.shared/types/schemas'

export interface ITriggerRepository {
  list: (params?: GetTriggerParams) => Promise<TriggerItem[]>
}

export class DefaultTriggerRepository implements ITriggerRepository {
  async list(params?: GetTriggerParams): Promise<TriggerItem[]> {
    try {
      const raw = await api.trigger.list(params)
      const data = applyAcl(z.array(TriggerSchema), raw, 'trigger.list()')
      if (params?.mapId)
        await offlineService.saveTriggers(params.mapId, data).catch(() => {})

      return data
    }
    catch (error) {
      if (params?.mapId) {
        const offlineData = await offlineService.getTriggers(params.mapId)
        if (offlineData && offlineData.length > 0)
          return applyAcl(z.array(TriggerSchema), offlineData, 'trigger.list() [offline]')
      }

      throw error
    }
  }
}

export const triggerRepository: ITriggerRepository = new DefaultTriggerRepository()
