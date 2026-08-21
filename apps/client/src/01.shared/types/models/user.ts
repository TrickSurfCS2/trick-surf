export enum UserRole {
  User = 'ROLE_USER',
  Admin = 'ROLE_ADMIN',
}

export interface UserItem {
  id: string
  login: string
  role: UserRole | string
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface AuthLoginDto {
  login: string
  password?: string
  refreshToken?: string
}
