import { Elysia } from 'elysia'
import { mapService } from '../services/map.service'

export const mapController = new Elysia({ prefix: '/api/v1/map' })
  .get('/', async () => {
    return mapService.getAll()
  }, {
    detail: {
      tags: ['map'],
      summary: 'Get all maps',
    },
  })
