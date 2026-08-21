import { z } from 'zod'

export const MapSchema = z.object({
  id: z.number(),
  name: z.string(),
  fullName: z.string(),
  preview: z.string(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
})
