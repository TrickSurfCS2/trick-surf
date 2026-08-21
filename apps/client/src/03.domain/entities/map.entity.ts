import type { MapItem } from '~/01.shared/types/models'
import { getMediaUrl } from '~/01.shared/lib/helpers'

export class MapEntity {
  id: number
  name: string
  fullName: string
  preview: string
  createdAt?: string | Date
  updatedAt?: string | Date

  constructor(data: MapItem) {
    this.id = data.id
    this.name = data.name
    this.fullName = data.fullName || data.name
    this.preview = data.preview
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  get previewUrl(): string {
    return getMediaUrl(this.preview)
  }

  get routePath(): string {
    return `/${this.name}/tricks`
  }
}
