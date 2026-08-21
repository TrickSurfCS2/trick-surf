import { Elysia, t } from 'elysia'
import { userService } from '../services/user.service'
import { AppError } from '../utils/errors'

export const userController = new Elysia({ prefix: '/api/v1/user' })
  .get('/', async () => {
    return userService.getAll()
  }, {
    detail: {
      tags: ['user'],
      summary: 'Get all users',
    },
  })
  .get('/:id', async ({ params }) => {
    const user = await userService.getByWhere({ where: { id: params.id } })
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND')
    }
    return user
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ['user'],
      summary: 'Get user by id',
    },
  })
  .get('/:id/permisson', async ({ params }) => {
    return userService.getPermissionsByUserId(params.id)
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ['user'],
      summary: 'Get user permissions by user id',
    },
  })
  .get('/:id/permission', async ({ params }) => {
    return userService.getPermissionsByUserId(params.id)
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ['user'],
      summary: 'Get user permissions by user id',
    },
  })
