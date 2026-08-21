export interface TriggerItem {
  id: number
  name: string
  fullName?: string | null
  preview?: string | null
  coords?: number[]
  mapId?: number
  updatedAt?: string | Date
}

export interface GetTriggerParams {
  id?: number
  mapId?: number
  name?: string
  fullName?: string
}

export interface GetTrickListParams {
  mapId?: number
}
