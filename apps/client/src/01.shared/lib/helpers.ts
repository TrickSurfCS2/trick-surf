import { API_URL, CDN_URL } from './env'

export function getMediaUrl(path?: string | null): string {
  if (!path)
    return ''

  if (path.startsWith('data:') || path.startsWith('blob:'))
    return path

  if (path.startsWith('http://') || path.startsWith('https://'))
    return path

  if (CDN_URL) {
    const cleanPath = path.replace(/^\/?(api\/)?uploads\//, '').replace(/^\//, '')

    return `${CDN_URL}/${cleanPath}`
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${API_URL}${cleanPath}`
}

export function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object')
    return obj

  return JSON.parse(JSON.stringify(obj))
}

export function formatDate(date: string | Date | undefined | null | object): string {
  if (!date)
    return ''

  if (typeof date === 'object' && !(date instanceof Date))
    return ''

  const d = new Date(date as string | Date)
  if (Number.isNaN(d.getTime()))
    return ''

  return d.toISOString().split('T')[0]
}
