import type { Prisma } from '@prisma/client'
import type { TrickRecord } from '#/models/trick'
import type { IUpdatePayload, IWherePayload } from '#/types/prisma-helpers'
import prisma from '#/prisma'
import { toCamelCaseKeys } from '#/utils/helpers'

export interface ListParams {
  mapId?: number
}

export class TrickService {
  //* Read
  getAll = async () => {
    return prisma.trick.findMany()
  }

  getList = async (params: ListParams) => {
    const { mapId } = params

    const tricksWithTriggers = await prisma.trick.findMany({
      include: {
        User: true,
        Route: {
          include: {
            Trigger: true,
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
      where: {
        mapId,
      },
      orderBy: {
        id: 'asc',
      },
    })

    const transformedResult = tricksWithTriggers.map(({ Route, User: user, ...trick }, idx) => ({
      ...trick,
      index: idx + 1,
      authorSteamid64: user?.steamid,
      authorUsername: user?.username,
      trickLength: Route.length,
      triggers: Route.map(route => route.Trigger),
    }))

    return toCamelCaseKeys(transformedResult)
  }

  getAllByWhere = async <T>(payload: IWherePayload<T, Prisma.TrickWhereInput>) => {
    return prisma.trick.findMany({ ...payload.query, where: payload.where })
  }

  getByWhere = async <T>(payload: IWherePayload<T, Prisma.TrickWhereInput>) => {
    return prisma.trick.findFirst({ ...payload.query, where: payload.where })
  }

  getRecord = async (trickId: number): Promise<TrickRecord | null> => {
    const result = await prisma.$queryRaw<TrickRecord[]>`
      SELECT 
        twr.time as timeWR,
        twr_user.steamid as steamidTimeWR,
        twr_user.username as usernameTimeWR,
        twr.id as completeIdTimeWR,
        swr.speed as speedWR,
        swr_user.username as usernameSpeedWR,
        swr_user.steamid as steamidSpeedWR,
        swr.id as completeIdSpeedWR
      FROM \`trick\` as t
      LEFT JOIN 
        \`complete\` twr ON twr.id = 
          (SELECT twri.completeId FROM \`time_wr\` as twri WHERE twri.trickId = ${trickId})
      LEFT JOIN 
        \`complete\` swr ON swr.id = 
          (SELECT swri.completeId FROM \`speed_wr\` as swri WHERE swri.trickId = ${trickId})
      LEFT JOIN 
        \`user\` twr_user ON twr.userId = twr_user.id
      LEFT JOIN 
        \`user\` swr_user ON swr.userId = swr_user.id
      WHERE t.id = ${trickId};
    `

    return result[0] ?? null
  }

  createTrick = async (data: {
    name: string
    point: number
    startType?: number
    mapId: number
    authorId?: number
    authorSteamid?: string
    authorUsername?: string
    triggerIds?: number[]
  }) => {
    let authorId = data.authorId

    if (!authorId && data.authorSteamid) {
      const user = await prisma.user.upsert({
        where: { steamid: data.authorSteamid },
        update: { username: data.authorUsername || 'Unknown' },
        create: {
          steamid: data.authorSteamid,
          username: data.authorUsername || 'Unknown',
        },
      })
      authorId = user.id
    }

    if (!authorId) {
      const existingUser = await prisma.user.findFirst()
      if (existingUser) {
        authorId = existingUser.id
      }
      else {
        const createdUser = await prisma.user.create({
          data: {
            steamid: '76561198000000000',
            username: data.authorUsername || 'TrickMaker',
          },
        })
        authorId = createdUser.id
      }
    }

    const trick = await prisma.trick.create({
      data: {
        name: data.name,
        point: Number(data.point),
        startType: Number(data.startType ?? 0),
        mapId: Number(data.mapId),
        authorId: authorId!,
      },
    })

    if (data.triggerIds && data.triggerIds.length > 0) {
      await prisma.route.createMany({
        data: data.triggerIds.map(triggerId => ({
          trickId: trick.id,
          triggerId: Number(triggerId),
        })),
      })
    }

    const list = await this.getList({ mapId: data.mapId })
    return list.find((t: { id: number }) => t.id === trick.id) || trick
  }

  updateTrick = async (id: number, data: {
    name?: string
    point?: number
    startType?: number
    mapId?: number
    authorUsername?: string
    triggerIds?: number[]
  }) => {
    const trick = await prisma.trick.update({
      where: { id: Number(id) },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.point !== undefined ? { point: Number(data.point) } : {}),
        ...(data.startType !== undefined ? { startType: Number(data.startType) } : {}),
        ...(data.mapId !== undefined ? { mapId: Number(data.mapId) } : {}),
      },
      include: {
        User: true,
      },
    })

    if (data.authorUsername && trick.authorId) {
      await prisma.user.update({
        where: { id: trick.authorId },
        data: { username: data.authorUsername },
      }).catch(() => {})
    }

    if (data.triggerIds !== undefined) {
      await prisma.route.deleteMany({
        where: { trickId: Number(id) },
      })
      if (data.triggerIds.length > 0) {
        await prisma.route.createMany({
          data: data.triggerIds.map(triggerId => ({
            trickId: Number(id),
            triggerId: Number(triggerId),
          })),
        })
      }
    }

    const list = await this.getList({ mapId: trick.mapId })
    return list.find((t: { id: number }) => t.id === Number(id)) || trick
  }

  deleteTrick = async (id: number) => {
    await prisma.route.deleteMany({
      where: { trickId: Number(id) },
    }).catch(() => {})

    await prisma.timeWr.deleteMany({
      where: { trickId: Number(id) },
    }).catch(() => {})

    await prisma.speedWr.deleteMany({
      where: { trickId: Number(id) },
    }).catch(() => {})

    return prisma.trick.delete({
      where: { id: Number(id) },
    })
  }

  //* Update
  update = async <T>(payload: IUpdatePayload<T, Prisma.TrickWhereUniqueInput, Prisma.TrickUpdateInput>) => {
    return prisma.trick.update({
      ...payload.query,
      where: payload.where,
      data: payload.data,
    })
  }
}

export const trickService = new TrickService()
export default TrickService
