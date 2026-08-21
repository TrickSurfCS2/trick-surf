import type { TriggerItem } from './trigger'

export interface TrickItem {
  index?: number
  id: number
  name: string
  point: number
  startType: number
  totalCompletes?: number
  trickLength?: number
  createdAt: string | Date
  authorSteamid64?: string
  authorUsername?: string
  routeIds?: string
  route?: string
  triggers?: TriggerItem[]
}

export type TrickSortKey = 'index' | 'name' | 'point' | 'trickLength' | 'totalCompletes'

export type SortDir = 'asc' | 'desc' | 'none'

export type TrickSortSetting = Record<TrickSortKey, SortDir>
