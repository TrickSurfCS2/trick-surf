import type { CreateTrickDto, GetTrickListParams, TrickItem, UpdateTrickDto } from '~/01.shared/types/models'
import { z } from 'zod'
import { applyAcl } from '~/01.shared/lib/acl'
import { api } from '~/01.shared/services/api.service'
import { offlineService } from '~/01.shared/services/offline.service'
import { TrickSchema } from '~/01.shared/types/schemas'

export interface ITrickRepository {
  list: (params?: GetTrickListParams) => Promise<TrickItem[]>
  create: (dto: CreateTrickDto) => Promise<TrickItem>
  update: (id: number, dto: UpdateTrickDto) => Promise<TrickItem>
  delete: (id: number) => Promise<{ id: number }>
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

  async create(dto: CreateTrickDto): Promise<TrickItem> {
    try {
      const raw = await api.trick.create(dto)
      const data = applyAcl(TrickSchema, raw, 'trick.create()')

      return data
    }
    catch {
      // Local fallback in offline mode
      const fallbackItem: TrickItem = {
        id: Date.now(),
        name: dto.name,
        point: dto.point,
        startType: dto.startType ?? 0,
        mapId: dto.mapId,
        authorUsername: dto.authorUsername || 'You',
        createdAt: new Date().toISOString(),
        trickLength: dto.triggerIds?.length || 0,
        totalCompletes: 0,
      }

      return fallbackItem
    }
  }

  async update(id: number, dto: UpdateTrickDto): Promise<TrickItem> {
    try {
      const raw = await api.trick.update(id, dto)
      const data = applyAcl(TrickSchema, raw, 'trick.update()')

      return data
    }
    catch {
      const fallbackItem: TrickItem = {
        id,
        name: dto.name || 'Updated Trick',
        point: dto.point || 50,
        startType: dto.startType ?? 0,
        mapId: dto.mapId,
        authorUsername: dto.authorUsername || 'You',
        createdAt: new Date().toISOString(),
        trickLength: dto.triggerIds?.length || 0,
      }

      return fallbackItem
    }
  }

  async delete(id: number): Promise<{ id: number }> {
    try {
      return await api.trick.delete(id)
    }
    catch {
      return { id }
    }
  }
}

export const trickRepository: ITrickRepository = new DefaultTrickRepository()
