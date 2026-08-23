import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultRepositories } from '~/00.plugins/di'
import { useTricksStore } from './tricks.store'

describe('tricks.store CRUD', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    let trigIdCounter = 100
    let trickIdCounter = 200

    vi.spyOn(defaultRepositories.trigger, 'create').mockImplementation(async dto => ({
      id: ++trigIdCounter,
      name: dto.name,
      fullName: dto.fullName || null,
      preview: dto.preview || null,
      coords: dto.coords || [],
      mapId: dto.mapId,
    }))

    vi.spyOn(defaultRepositories.trigger, 'update').mockImplementation(async (id, dto) => ({
      id,
      name: dto.name || 'Trigger',
      fullName: dto.fullName || null,
      preview: dto.preview || null,
      coords: dto.coords || [],
      mapId: dto.mapId,
    }))

    vi.spyOn(defaultRepositories.trigger, 'delete').mockImplementation(async id => ({ id }))

    vi.spyOn(defaultRepositories.trick, 'create').mockImplementation(async dto => ({
      id: ++trickIdCounter,
      name: dto.name,
      point: dto.point,
      startType: dto.startType ?? 0,
      mapId: dto.mapId,
      authorUsername: dto.authorUsername,
      createdAt: new Date().toISOString(),
      triggers: [],
    }))

    vi.spyOn(defaultRepositories.trick, 'update').mockImplementation(async (id, dto) => ({
      id,
      name: dto.name || 'Trick',
      point: dto.point ?? 50,
      startType: dto.startType ?? 0,
      mapId: dto.mapId ?? 1,
      authorUsername: dto.authorUsername,
      createdAt: new Date().toISOString(),
      triggers: [],
    }))

    vi.spyOn(defaultRepositories.trick, 'delete').mockImplementation(async id => ({ id }))
  })

  it('creates, updates, and deletes triggers', async () => {
    const store = useTricksStore()
    store.currentMapId = 1

    // 1. Create Trigger
    const createdTrigger = await store.createTrigger({
      name: 'spawn_zone',
      fullName: 'Main Spawn',
      coords: [100, 200, 300],
      mapId: 1,
    })

    expect(createdTrigger.name).toBe('spawn_zone')
    expect(store.triggers).toHaveLength(1)

    // 2. Update Trigger
    const updatedTrigger = await store.updateTrigger(createdTrigger.id, {
      fullName: 'Updated Spawn Area',
    })

    expect(updatedTrigger.fullName).toBe('Updated Spawn Area')
    expect(store.triggers[0].fullName).toBe('Updated Spawn Area')

    // 3. Delete Trigger
    await store.deleteTrigger(createdTrigger.id)
    expect(store.triggers).toHaveLength(0)
  })

  it('creates, duplicates, updates, and deletes tricks', async () => {
    const store = useTricksStore()
    store.currentMapId = 1

    const trig1 = await store.createTrigger({ name: 'start', mapId: 1 })
    const trig2 = await store.createTrigger({ name: 'finish', mapId: 1 })

    // 1. Create Trick
    const trick = await store.createTrick({
      name: 'Start to Finish',
      point: 100,
      startType: 1,
      mapId: 1,
      authorUsername: 'Surfer',
      triggerIds: [trig1.id, trig2.id],
    })

    expect(trick.name).toBe('Start to Finish')
    expect(trick.point).toBe(100)
    expect(trick.startType).toBe(1)
    expect(store.tricks).toHaveLength(1)
    expect(store.getTriggerUsageCount(trig1.id)).toBe(1)

    // 2. Duplicate Trick
    const duplicated = await store.duplicateTrick(trick.id)
    expect(duplicated).not.toBeNull()
    expect(duplicated?.name).toContain('(Copy)')
    expect(store.tricks).toHaveLength(2)

    // 3. Update Trick
    const updated = await store.updateTrick(trick.id, {
      name: 'Renamed Trick',
      point: 250,
    })
    expect(updated.name).toBe('Renamed Trick')
    expect(updated.point).toBe(250)

    // 4. Delete Trick
    await store.deleteTrick(trick.id)
    expect(store.tricks).toHaveLength(1)
  })

  it('exports and imports map data properly', async () => {
    const store = useTricksStore()
    store.currentMapId = 1

    await store.createTrigger({ name: 'zone_a', mapId: 1 })
    await store.createTrick({ name: 'Trick A', point: 50, mapId: 1 })

    const exported = store.exportData()
    expect(exported.mapId).toBe(1)
    expect(exported.tricks).toHaveLength(1)
    expect(exported.triggers).toHaveLength(1)

    setActivePinia(createPinia())
    const newStore = useTricksStore()
    newStore.currentMapId = 1

    await newStore.importData({
      triggers: [{ name: 'imported_zone', mapId: 1 }],
      tricks: [{ name: 'Imported Trick', point: 200, mapId: 1 }],
    })

    expect(newStore.triggers).toHaveLength(1)
    expect(newStore.tricks).toHaveLength(1)
  })
})
