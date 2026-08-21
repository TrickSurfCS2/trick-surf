import { describe, expect, it } from 'vitest'
import { corsHeadersFor, isAllowedOrigin } from '../config'
import { withCors } from './cors'

describe('cORS utility', () => {
  it('identifies allowed origins', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true)
    expect(isAllowedOrigin('http://127.0.0.1:3000')).toBe(true)
    expect(isAllowedOrigin(null)).toBe(false)
  })

  it('generates cors headers', () => {
    const headers = corsHeadersFor('http://localhost:5173')
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173')
    expect(headers['Access-Control-Allow-Methods']).toContain('GET')
  })

  it('wraps responses with CORS headers', () => {
    const baseResponse = new Response('ok', { status: 200 })
    const response = withCors(baseResponse, 'http://localhost:5173')

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
    expect(response.status).toBe(200)
  })
})
