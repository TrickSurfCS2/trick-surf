import type { UserItem } from '~/01.shared/types/models'

export class UserEntity {
  id: string
  login: string
  role: string

  constructor(data: UserItem) {
    this.id = data.id
    this.login = data.login
    this.role = data.role
  }

  get isAdmin(): boolean {
    return this.role === 'ROLE_ADMIN'
  }
}
