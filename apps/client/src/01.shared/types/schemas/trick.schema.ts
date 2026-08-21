import { z } from 'zod'
import { TriggerSchema } from './trigger.schema'

export const TrickSchema = z.object({
  index: z.number().optional(),
  id: z.number(),
  name: z.string(),
  point: z.number(),
  startType: z.number().optional().default(0),
  totalCompletes: z.number().optional().default(0),
  trickLength: z.number().optional().default(0),
  createdAt: z.union([z.string(), z.date()]).optional().default(''),
  authorSteamid64: z.string().optional().default(''),
  authorUsername: z.string().optional().default(''),
  routeIds: z.string().optional().default(''),
  route: z.string().optional().default(''),
  triggers: z.array(TriggerSchema).optional().default([]),
})
