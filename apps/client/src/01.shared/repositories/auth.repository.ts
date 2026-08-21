import type { UserItem } from '~/01.shared/types/models'
import { api } from '~/01.shared/services/api.service'

export interface IAuthRepository {
  me: () => Promise<UserItem | null>
  refresh: (token: string) => Promise<UserItem>
}

export class DefaultAuthRepository implements IAuthRepository {
  async me(): Promise<UserItem | null> {
    return api.auth.me()
  }

  async refresh(token: string): Promise<UserItem> {
    return api.auth.refresh(token)
  }
}

export const authRepository: IAuthRepository = new DefaultAuthRepository()
