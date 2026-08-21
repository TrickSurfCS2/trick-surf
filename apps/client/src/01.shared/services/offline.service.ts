import type { MapItem, TrickItem, TriggerItem } from '~/01.shared/types/models'
import localforage from 'localforage'

const mapsStore = localforage.createInstance({ name: 'tricksurf', storeName: 'maps' })
const tricksStore = localforage.createInstance({ name: 'tricksurf', storeName: 'tricks' })
const triggersStore = localforage.createInstance({ name: 'tricksurf', storeName: 'triggers' })

export const offlineService = {
  async saveMaps(maps: MapItem[]): Promise<void> {
    await mapsStore.setItem('maps_list', maps)
  },
  async getMaps(): Promise<MapItem[] | null> {
    return mapsStore.getItem<MapItem[]>('maps_list')
  },
  async saveTricks(mapId: number, tricks: TrickItem[]): Promise<void> {
    await tricksStore.setItem(`tricks_${mapId}`, tricks)
  },
  async getTricks(mapId: number): Promise<TrickItem[] | null> {
    return tricksStore.getItem<TrickItem[]>(`tricks_${mapId}`)
  },
  async saveTriggers(mapId: number, triggers: TriggerItem[]): Promise<void> {
    await triggersStore.setItem(`triggers_${mapId}`, triggers)
  },
  async getTriggers(mapId: number): Promise<TriggerItem[] | null> {
    return triggersStore.getItem<TriggerItem[]>(`triggers_${mapId}`)
  },
}
