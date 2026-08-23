import { Elysia, t } from 'elysia'
import { triggerService } from '../services/trigger.service'

export const triggerController = new Elysia({ prefix: '/api/v1/trigger' })
  .get('/', async ({ query }) => {
    const { mapId, name, fullName, id } = query

    const where = {
      id: id !== undefined ? Number(id) : undefined,
      mapId: mapId !== undefined ? Number(mapId) : undefined,
      name: name ? String(name) : undefined,
      fullName: fullName ? String(fullName) : undefined,
    }

    return triggerService.getAllByWhere({ where })
  }, {
    query: t.Object({
      id: t.Optional(t.Numeric()),
      mapId: t.Optional(t.Numeric()),
      name: t.Optional(t.String()),
      fullName: t.Optional(t.String()),
    }),
    detail: {
      tags: ['trigger'],
      summary: 'Get triggers filtered by criteria',
    },
  })
  .post('/', async ({ body }) => {
    return triggerService.createTrigger(body)
  }, {
    body: t.Object({
      name: t.String(),
      fullName: t.Optional(t.Nullable(t.String())),
      preview: t.Optional(t.Nullable(t.String())),
      coords: t.Optional(t.Any()),
      mapId: t.Numeric(),
    }),
    detail: {
      tags: ['trigger'],
      summary: 'Create a new trigger',
    },
  })
  .put('/:id', async ({ params, body }) => {
    return triggerService.updateTrigger(params.id, body)
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      fullName: t.Optional(t.Nullable(t.String())),
      preview: t.Optional(t.Nullable(t.String())),
      coords: t.Optional(t.Any()),
      mapId: t.Optional(t.Numeric()),
    }),
    detail: {
      tags: ['trigger'],
      summary: 'Update trigger by id',
    },
  })
  .delete('/:id', async ({ params }) => {
    return triggerService.deleteTrigger(params.id)
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ['trigger'],
      summary: 'Delete trigger by id',
    },
  })
