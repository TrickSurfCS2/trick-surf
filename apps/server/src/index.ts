import { staticPlugin } from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { mapController } from './controllers/map.controller'
import { recordController } from './controllers/record.controller'
import { trickController } from './controllers/trick.controller'
import { triggerController } from './controllers/trigger.controller'
import { userController } from './controllers/user.controller'
import { registerRuntimeMetrics, telemetryPlugin } from './plugins/telemetry'
import { createServer } from './server'
import { handleElysiaError } from './utils/errors'

registerRuntimeMetrics()

export const app = new Elysia()
  .onError(handleElysiaError)
  .use(swagger({
    path: '/swagger',
    documentation: {
      info: {
        title: 'Trick Surf API',
        version: '1.0.0',
        description: 'Trick Surf Backend API documentation',
      },
    },
  }))
  .use(staticPlugin({
    assets: 'public',
    prefix: '/public',
  }))
  .use(telemetryPlugin)
  .use(mapController)
  .use(trickController)
  .use(triggerController)
  .use(userController)
  .use(recordController)
  .get('/health', () => ({ status: 'ok' }))
  .get('/logs', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

createServer(app)
