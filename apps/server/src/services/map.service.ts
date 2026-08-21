import prisma from '#/prisma'

export class MapService {
  //* Read
  getAll = async () => prisma.map.findMany()
}

export const mapService = new MapService()
export default MapService
