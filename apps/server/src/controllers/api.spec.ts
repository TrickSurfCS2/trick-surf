import { describe, expect, it, vi } from 'vitest'
import { app } from '../index'
import { mapService } from '../services/map.service'
import { trickService } from '../services/trick.service'
import { triggerService } from '../services/trigger.service'
import { userService } from '../services/user.service'

describe('elysia App Endpoints', () => {
  it('gET /health returns status ok', async () => {
    const res = await app.handle(new Request('http://localhost/health'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ status: 'ok' })
  })

  it('gET /logs returns status ok and timestamp', async () => {
    const res = await app.handle(new Request('http://localhost/logs'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('ok')
    expect(json.timestamp).toBeDefined()
  })

  it('gET /api/v1/map returns list of maps', async () => {
    vi.spyOn(mapService, 'getAll').mockResolvedValueOnce([
      { id: 1, name: 'surf_beginner', fullName: 'Surf Beginner', preview: null, origin: [0, 0, 0], createdAt: new Date(), updatedAt: new Date() },
    ])

    const res = await app.handle(new Request('http://localhost/api/v1/map'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].name).toBe('surf_beginner')
  })

  it('gET /api/v1/trick/list returns filtered tricks', async () => {
    vi.spyOn(trickService, 'getList').mockResolvedValueOnce([
      { id: 10, index: 1, name: 'Trick 1', mapId: 1, point: 100, startType: 1, authorId: 1, authorSteamid64: '123', authorUsername: 'User', trickLength: 0, createdAt: new Date(), updatedAt: new Date(), triggers: [] },
    ] as never)

    const res = await app.handle(new Request('http://localhost/api/v1/trick/list?mapId=1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].id).toBe(10)
  })

  it('gET /api/v1/user/:id returns 404 when user not found', async () => {
    vi.spyOn(userService, 'getByWhere').mockResolvedValueOnce(null)

    const res = await app.handle(new Request('http://localhost/api/v1/user/999'))
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.code).toBe('USER_NOT_FOUND')
  })

  it('gET /api/v1/user/:id returns user when found', async () => {
    vi.spyOn(userService, 'getByWhere').mockResolvedValueOnce({
      id: 1,
      steamid: 'STEAM_0:0:12345',
      username: 'Player1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const res = await app.handle(new Request('http://localhost/api/v1/user/1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.username).toBe('Player1')
  })

  it('gET /api/v1/trigger returns triggers', async () => {
    vi.spyOn(triggerService, 'getAllByWhere').mockResolvedValueOnce([
      { id: 5, name: 'zone1', fullName: null, preview: null, coords: [], mapId: 1, createdAt: new Date(), updatedAt: new Date() },
    ])

    const res = await app.handle(new Request('http://localhost/api/v1/trigger?mapId=1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].name).toBe('zone1')
  })
})
