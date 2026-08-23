import { Elysia, t } from 'elysia'
import { recordService } from '../services/record.service'

export const recordController = new Elysia({ prefix: '/api/v1/records' })
  .get('/map/:mapId', async ({ params }) => {
    return recordService.getMapRecords(params.mapId)
  }, {
    params: t.Object({
      mapId: t.Numeric(),
    }),
    detail: {
      tags: ['records'],
      summary: 'Get records and leaderboard for a specific map',
    },
  })
  .get('/trick/:trickId', async ({ params, set }) => {
    const result = await recordService.getTrickCompletes(params.trickId)
    if (!result) {
      set.status = 404
      return { code: 'TRICK_NOT_FOUND', message: 'Trick not found' }
    }
    return result
  }, {
    params: t.Object({
      trickId: t.Numeric(),
    }),
    detail: {
      tags: ['records'],
      summary: 'Get all completion records for a specific trick',
    },
  })
  .get('/leaderboard', async ({ query }) => {
    const mapId = query.mapId !== undefined ? Number(query.mapId) : undefined
    const limit = query.limit !== undefined ? Number(query.limit) : undefined
    return recordService.getLeaderboard({ mapId, limit })
  }, {
    query: t.Object({
      mapId: t.Optional(t.Numeric()),
      limit: t.Optional(t.Numeric()),
    }),
    detail: {
      tags: ['records'],
      summary: 'Get global or map-specific player leaderboard',
    },
  })
