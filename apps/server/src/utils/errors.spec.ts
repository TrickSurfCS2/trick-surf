import { NotFoundError, t, ValidationError } from 'elysia'
import { describe, expect, it } from 'vitest'
import { AppError, extractErrorInfo, handleElysiaError } from './errors'

describe('errors utility', () => {
  it('handles AppError correctly', () => {
    const error = new AppError(400, 'Custom bad request', 'CUSTOM_BAD_REQUEST', { field: 'name' })
    const info = extractErrorInfo(error)

    expect(info.status).toBe(400)
    expect(info.errorCode).toBe(400)
    expect(info.code).toBe('CUSTOM_BAD_REQUEST')
    expect(info.message).toBe('Custom bad request')
    expect(info.details).toEqual({ field: 'name' })
  })

  it('handles ValidationError correctly', () => {
    const error = new ValidationError('property', t.String(), 123)
    const info = extractErrorInfo(error)

    expect(info.status).toBe(400)
    expect(info.errorCode).toBe(400)
    expect(info.code).toBe('VALIDATION_ERROR')
  })

  it('handles NotFoundError correctly', () => {
    const error = new NotFoundError('Not found')
    const info = extractErrorInfo(error)

    expect(info.status).toBe(404)
    expect(info.errorCode).toBe(404)
    expect(info.code).toBe('NOT_FOUND')
  })

  it('handles generic unknown errors', () => {
    const error = new Error('Database exploded')
    const info = extractErrorInfo(error)

    expect(info.status).toBe(500)
    expect(info.errorCode).toBe(500)
    expect(info.code).toBe('INTERNAL_SERVER_ERROR')
    expect(info.message).toBe('Database exploded')
  })

  it('handleElysiaError sets status on set object', () => {
    const set: { status?: number | string } = {}
    const error = new AppError(403, 'Forbidden', 'FORBIDDEN')
    const result = handleElysiaError({ error, set })

    expect(set.status).toBe(403)
    expect(result.status).toBe(403)
    expect(result.code).toBe('FORBIDDEN')
  })
})
