import type { TriggerItem } from './trigger'

export interface TrickItem {
  index?: number
  id: number
  name: string
  point: number
  startType: number
  mapId?: number
  totalCompletes?: number
  trickLength?: number
  createdAt: string | Date
  authorSteamid64?: string
  authorUsername?: string
  routeIds?: string
  route?: string
  triggers?: TriggerItem[]
}

export interface CreateTrickDto {
  name: string
  point: number
  startType?: number
  mapId: number
  authorUsername?: string
  authorSteamid?: string
  triggerIds?: number[]
}

export interface UpdateTrickDto {
  name?: string
  point?: number
  startType?: number
  mapId?: number
  authorUsername?: string
  triggerIds?: number[]
}

export type TrickSortKey = 'index' | 'name' | 'point' | 'trickLength' | 'totalCompletes'

export type SortDir = 'asc' | 'desc' | 'none'

export type TrickSortSetting = Record<TrickSortKey, SortDir>
