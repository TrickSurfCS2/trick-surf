import { z } from 'zod'

export const TriggerSchema = z.object({
  id: z.number(),
  name: z.string(),
  fullName: z.string().nullable().optional(),
  preview: z.string().nullable().optional(),
  coords: z.array(z.number()).optional().default([]),
  mapId: z.number().optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
})
