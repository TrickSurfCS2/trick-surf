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
  .post('/', async ({ body }) => {
    return trickService.createTrick(body)
  }, {
    body: t.Object({
      name: t.String(),
      point: t.Numeric(),
      startType: t.Optional(t.Numeric()),
      mapId: t.Numeric(),
      authorId: t.Optional(t.Numeric()),
      authorUsername: t.Optional(t.String()),
      authorSteamid: t.Optional(t.String()),
      triggerIds: t.Optional(t.Array(t.Numeric())),
    }),
    detail: {
      tags: ['trick'],
      summary: 'Create a new trick with routes',
    },
  })
  .put('/:id', async ({ params, body }) => {
    return trickService.updateTrick(params.id, body)
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      point: t.Optional(t.Numeric()),
      startType: t.Optional(t.Numeric()),
      mapId: t.Optional(t.Numeric()),
      authorUsername: t.Optional(t.String()),
      triggerIds: t.Optional(t.Array(t.Numeric())),
    }),
    detail: {
      tags: ['trick'],
      summary: 'Update trick by id',
    },
  })
  .delete('/:id', async ({ params }) => {
    return trickService.deleteTrick(params.id)
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ['trick'],
      summary: 'Delete trick by id',
    },
  })
