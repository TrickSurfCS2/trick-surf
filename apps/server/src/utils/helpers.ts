function toCamelCaseKeys<T>(obj: T): T {
  if (obj instanceof Date) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(toCamelCaseKeys) as unknown as T
  }
  else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: Record<string, unknown>, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1)
      acc[camelKey] = toCamelCaseKeys((obj as Record<string, unknown>)[key])
      return acc
    }, {}) as unknown as T
  }
  return obj
}

export { toCamelCaseKeys }
