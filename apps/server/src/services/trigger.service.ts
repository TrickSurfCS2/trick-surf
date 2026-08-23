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

  createTrigger = async (data: {
    name: string
    fullName?: string | null
    preview?: string | null
    coords?: Prisma.InputJsonValue
    mapId: number
  }) => {
    return prisma.trigger.create({
      data: {
        name: data.name,
        fullName: data.fullName,
        preview: data.preview,
        coords: data.coords,
        mapId: Number(data.mapId),
      },
    })
  }

  updateTrigger = async (id: number, data: {
    name?: string
    fullName?: string | null
    preview?: string | null
    coords?: Prisma.InputJsonValue
    mapId?: number
  }) => {
    return prisma.trigger.update({
      where: { id: Number(id) },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.preview !== undefined ? { preview: data.preview } : {}),
        ...(data.coords !== undefined ? { coords: data.coords } : {}),
        ...(data.mapId !== undefined ? { mapId: Number(data.mapId) } : {}),
      },
    })
  }

  deleteTrigger = async (id: number) => {
    await prisma.route.deleteMany({
      where: { triggerId: Number(id) },
    }).catch(() => {})

    return prisma.trigger.delete({
      where: { id: Number(id) },
    })
  }
}

export const triggerService = new TriggerService()
export default TriggerService
