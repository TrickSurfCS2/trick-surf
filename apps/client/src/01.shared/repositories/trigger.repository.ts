import type { CreateTriggerDto, GetTriggerParams, TriggerItem, UpdateTriggerDto } from '~/01.shared/types/models'
import { z } from 'zod'
import { applyAcl } from '~/01.shared/lib/acl'
import { api } from '~/01.shared/services/api.service'
import { offlineService } from '~/01.shared/services/offline.service'
import { TriggerSchema } from '~/01.shared/types/schemas'

export interface ITriggerRepository {
  list: (params?: GetTriggerParams) => Promise<TriggerItem[]>
  create: (dto: CreateTriggerDto) => Promise<TriggerItem>
  update: (id: number, dto: UpdateTriggerDto) => Promise<TriggerItem>
  delete: (id: number) => Promise<{ id: number }>
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

  async create(dto: CreateTriggerDto): Promise<TriggerItem> {
    try {
      const raw = await api.trigger.create(dto)
      const data = applyAcl(TriggerSchema, raw, 'trigger.create()')

      return data
    }
    catch {
      const fallbackItem: TriggerItem = {
        id: Date.now(),
        name: dto.name,
        fullName: dto.fullName || null,
        preview: dto.preview || null,
        coords: dto.coords || [],
        mapId: dto.mapId,
        updatedAt: new Date().toISOString(),
      }

      return fallbackItem
    }
  }

  async update(id: number, dto: UpdateTriggerDto): Promise<TriggerItem> {
    try {
      const raw = await api.trigger.update(id, dto)
      const data = applyAcl(TriggerSchema, raw, 'trigger.update()')

      return data
    }
    catch {
      const fallbackItem: TriggerItem = {
        id,
        name: dto.name || 'Trigger',
        fullName: dto.fullName || null,
        preview: dto.preview || null,
        coords: dto.coords || [],
        mapId: dto.mapId,
        updatedAt: new Date().toISOString(),
      }

      return fallbackItem
    }
  }

  async delete(id: number): Promise<{ id: number }> {
    try {
      return await api.trigger.delete(id)
    }
    catch {
      return { id }
    }
  }
}

export const triggerRepository: ITriggerRepository = new DefaultTriggerRepository()
