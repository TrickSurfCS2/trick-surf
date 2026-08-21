import type { TrickItem, TriggerItem } from '~/01.shared/types/models'
import { describe, expect, it } from 'vitest'
import { TrickEntity } from './trick.entity'

describe('trickEntity', () => {
  const dummyTrick: TrickItem = {
    id: 1,
    index: 10,
    name: 'Test Trick',
    point: 50,
    startType: 1,
    totalCompletes: 5,
    trickLength: 3,
    createdAt: '2026-08-21',
    authorSteamid64: '76561198000000000',
    routeIds: '101,102,103',
    route: 'T1 -> T2 -> T3',
  }

  const dummyTriggers: TriggerItem[] = [
    {
      id: 101,
      name: 'T1',
      fullName: 'Trigger 1',
      preview: null,
      coords: [0, 0, 0],
      mapId: 1,
    },
    {
      id: 102,
      name: 'T2',
      fullName: 'Trigger 2',
      preview: null,
      coords: [0, 0, 0],
      mapId: 1,
    },
    {
      id: 103,
      name: 'T3',
      fullName: 'Trigger 3',
      preview: null,
      coords: [0, 0, 0],
      mapId: 1,
    },
  ]

  it('correctly parses route trigger ids', () => {
    const entity = new TrickEntity(dummyTrick)
    expect(entity.parsedRouteTriggerIds).toEqual([101, 102, 103])
    expect(entity.isPreStrafe).toBe(true)
  })

  it('resolves triggers by route ids', () => {
    const entity = new TrickEntity(dummyTrick)
    const resolved = entity.resolveRouteTriggers(dummyTriggers)
    expect(resolved).toHaveLength(3)
    expect(resolved.map(t => t.name)).toEqual(['T1', 'T2', 'T3'])
  })
})
