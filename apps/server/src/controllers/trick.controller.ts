import { Elysia, t } from 'elysia'
import { trickService } from '../services/trick.service'

export const trickController = new Elysia({ prefix: '/api/v1/trick' })
  .get('/', async () => {
    return trickService.getAll()
  }, {
    detail: {
      tags: ['trick'],
      summary: 'Get all tricks',
    },
  })
  .get('/list', async ({ query }) => {
    const where = { mapId: query.mapId !== undefined ? Number(query.mapId) : undefined }
    return trickService.getList(where)
  }, {
    query: t.Object({
      mapId: t.Optional(t.Numeric()),
    }),
    detail: {
      tags: ['trick'],
      summary: 'Get tricks list filtered by mapId',
    },
  })
  .get('/:trickId/wr', async ({ params }) => {
    return trickService.getRecord(params.trickId)
  }, {
    params: t.Object({
      trickId: t.Numeric(),
    }),
    detail: {
      tags: ['trick'],
      summary: 'Get trick world record by trickId',
    },
  })
