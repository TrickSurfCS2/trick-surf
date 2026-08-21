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
