import type { z } from 'zod'

export function applyAcl<T extends z.ZodTypeAny>(schema: T, data: unknown, _contextName?: string): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    console.warn(`[ACL Validation Warning] in ${_contextName || 'unknown'}:`, result.error)

    return data as z.infer<T>
  }

  return result.data
}
