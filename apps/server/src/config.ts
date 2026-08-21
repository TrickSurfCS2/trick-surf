import process from 'node:process'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().default('postgresql://surfgxds:surfgxds@localhost:5432/surfgxds_dev?schema=public'),
  CORS_EXTRA_ORIGINS: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional().default(''),
  OTEL_SERVICE_NAME: z.string().default('trick-surf-server'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format())
  throw new Error('Application environment configuration error')
}

const env = parsedEnv.data

export const {
  NODE_ENV,
  HOST,
  PORT,
  DATABASE_URL,
  CORS_EXTRA_ORIGINS,
  FRONTEND_URL,
  OTEL_EXPORTER_OTLP_ENDPOINT,
  OTEL_SERVICE_NAME,
} = env

// CORS Configuration
const EXTRA_CORS_ORIGINS = env.CORS_EXTRA_ORIGINS
  .split(/[\s,]+/)
  .map(o => o.trim())
  .filter(Boolean)

export const ALLOWED_ORIGINS = new Set([
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  ...EXTRA_CORS_ORIGINS,
])

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin)
    return false
  if (ALLOWED_ORIGINS.has('*') || ALLOWED_ORIGINS.has(origin))
    return true

  for (const allowed of ALLOWED_ORIGINS) {
    if (allowed.includes('*')) {
      const regexPattern = allowed
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\\\*/g, '.*')
      const regex = new RegExp(`^${regexPattern}$`, 'i')
      if (regex.test(origin))
        return true
    }
  }

  try {
    const originUrl = new URL(origin)
    const originHost = originUrl.hostname
    if (originHost === 'localhost' || originHost === '127.0.0.1')
      return true
  }
  catch {
    // Ignore invalid URL format
  }

  return false
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
  'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length',
  'Access-Control-Max-Age': '86400',
}

export function corsHeadersFor(origin: string | null, requestHeaders?: string | null): Record<string, string> {
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : '*'

  const headers: Record<string, string> = {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
  }

  if (requestHeaders) {
    headers['Access-Control-Allow-Headers'] = requestHeaders
  }

  return headers
}

export default {
  host: HOST,
  port: PORT,
  nodeEnv: NODE_ENV,
}
