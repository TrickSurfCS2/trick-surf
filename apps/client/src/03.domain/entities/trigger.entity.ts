import type { TriggerItem } from '~/01.shared/types/models'
import { getMediaUrl } from '~/01.shared/lib/helpers'

export class TriggerEntity {
  id: number
  name: string
  fullName: string
  preview: string | null
  coords: number[]
  mapId?: number
  updatedAt?: string | Date

  constructor(data: TriggerItem) {
    this.id = data.id
    this.name = data.name
    this.fullName = data.fullName || data.name
    this.preview = data.preview ?? null
    this.coords = data.coords || []
    this.mapId = data.mapId ?? 0
    this.updatedAt = data.updatedAt
  }

  get previewUrl(): string {
    return getMediaUrl(this.preview)
  }

  get coordinatesLabel(): string {
    if (!this.coords || this.coords.length === 0)
      return ''

    return this.coords.map(c => Math.round(c)).join(', ')
  }
}
