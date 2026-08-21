import { describe, expect, it } from 'vitest'
import { MapEntity } from './map.entity'

describe('mapEntity', () => {
  it('formats preview url and route path', () => {
    const entity = new MapEntity({
      id: 1,
      name: 'ski2',
      fullName: 'surf_ski2',
      preview: '/image/ski2.jpg',
    })

    expect(entity.routePath).toBe('/ski2/tricks')
    expect(entity.previewUrl).toContain('/image/ski2.jpg')
  })
})
