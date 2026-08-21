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
        twr."time" as "timeWR",
        twr_user."steamid" as "steamidTimeWR",
        twr_user."username" as "usernameTimeWR",
        twr."id" as "completeIdTimeWR",
        swr."speed" as "speedWR",
        swr_user."username" as "usernameSpeedWR",
        swr_user."steamid" as "steamidSpeedWR",
        swr."id" as "completeIdSpeedWR"
      FROM public."trick" as t
      LEFT JOIN 
        public."complete" twr ON twr."id" = 
          (SELECT twri."completeId" FROM public."time_wr" as twri WHERE twri."trickId" = ${trickId})
      LEFT JOIN 
        public."complete" swr ON swr."id" = 
          (SELECT swri."completeId" FROM public."speed_wr" as swri WHERE swri."trickId" = ${trickId})
      LEFT JOIN 
        public."user" twr_user ON twr."userId" = twr_user."id"
      LEFT JOIN 
        public."user" swr_user ON swr."userId" = swr_user."id"
      WHERE t."id" = ${trickId};
    `

    return result[0] ?? null
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
