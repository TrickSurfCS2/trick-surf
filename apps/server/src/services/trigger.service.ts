import type { Prisma } from '@prisma/client'
import type { IWherePayload } from '#/types/prisma-helpers'
import prisma from '#/prisma'

export class TriggerService {
  //* Read
  getAll = async () => prisma.trigger.findMany()

  getAllByWhere = async <T>(payload: IWherePayload<T, Prisma.TriggerWhereInput>) =>
    prisma.trigger.findMany({ ...payload.query, where: payload.where })

  getByWhere = async <T>(payload: IWherePayload<T, Prisma.TriggerWhereInput>) =>
    prisma.trigger.findFirst({ ...payload.query, where: payload.where })
}

export const triggerService = new TriggerService()
export default TriggerService
