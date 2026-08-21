import { describe, expect, it } from 'vitest'
import { deepCopy, formatDate, getMediaUrl } from './helpers'

describe('helpers', () => {
  it('deepCopy creates an independent copy', () => {
    const original = { a: 1, b: [2, 3], c: { d: 'test' } }
    const copy = deepCopy(original)
    expect(copy).toEqual(original)
    expect(copy).not.toBe(original)
    expect(copy.b).not.toBe(original.b)
  })

  it('formatDate formats date properly', () => {
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('2026-08-21T12:00:00.000Z')).toBe('2026-08-21')
  })

  it('getMediaUrl returns media url', () => {
    expect(getMediaUrl(null)).toBe('')
    expect(getMediaUrl('http://example.com/image.png')).toBe('http://example.com/image.png')
    expect(getMediaUrl('data:image/png;base64,123')).toBe('data:image/png;base64,123')
  })
})
