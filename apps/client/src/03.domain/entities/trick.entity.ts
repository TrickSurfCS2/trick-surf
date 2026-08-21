import type { TrickItem, TriggerItem } from '~/01.shared/types/models'

export class TrickEntity {
  index: number
  id: number
  name: string
  point: number
  startType: number
  totalCompletes: number
  trickLength: number
  createdAt: string | Date
  authorSteamid64?: string
  authorUsername?: string
  routeIds?: string
  route?: string
  triggers: TriggerItem[]

  constructor(data: TrickItem, fallbackIndex?: number) {
    this.index = data.index ?? fallbackIndex ?? data.id
    this.id = data.id
    this.name = data.name
    this.point = data.point
    this.startType = data.startType
    this.totalCompletes = data.totalCompletes ?? 0
    this.triggers = data.triggers ?? []
    this.trickLength = data.trickLength ?? (data.triggers?.length || 0)
    this.createdAt = data.createdAt
    this.authorSteamid64 = data.authorSteamid64
    this.authorUsername = data.authorUsername
    this.routeIds = data.routeIds
    this.route = data.route
  }

  get parsedRouteTriggerIds(): number[] {
    if (!this.routeIds)
      return []

    return this.routeIds
      .split(',')
      .map(id => Number.parseInt(id.trim(), 10))
      .filter(id => !Number.isNaN(id))
  }

  resolveRouteTriggers(allTriggers: TriggerItem[]): TriggerItem[] {
    if (this.triggers && this.triggers.length > 0) {
      return this.triggers
    }

    const ids = this.parsedRouteTriggerIds
    if (ids.length === 0)
      return []

    const triggerMap = new Map(allTriggers.map(t => [t.id, t]))

    return ids.map(id => triggerMap.get(id)).filter((t): t is TriggerItem => !!t)
  }

  get isPreStrafe(): boolean {
    return this.startType === 1
  }
}
