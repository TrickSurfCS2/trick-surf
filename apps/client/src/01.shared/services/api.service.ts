import type {
  GetTrickListParams,
  GetTriggerParams,
  MapItem,
  TrickItem,
  TriggerItem,
  UserItem,
} from '~/01.shared/types/models'
import { ofetch } from 'ofetch'
import { i18n } from '~/00.plugins/i18n'
import { API_URL } from '~/01.shared/lib/env'

declare module 'ofetch' {
  interface FetchOptions {
    silentErrors?: boolean
  }
}

export const BASE_API_URL = API_URL

export interface ApiProviders {
  getToken?: () => string | null
  onUnauthorized?: () => void
  onError?: (message: string) => void
}

const providers: Required<ApiProviders> = {
  getToken: () => (typeof localStorage !== 'undefined' ? localStorage.getItem('trick_surf_token') : null),
  onUnauthorized: () => {},
  onError: () => {},
}

export function configureApi(overrides: ApiProviders) {
  Object.assign(providers, overrides)
}

export const request = ofetch.create({
  baseURL: BASE_API_URL,
  async onRequest({ options }) {
    options.headers = new Headers(options.headers || {})
    const token = providers.getToken()
    if (token)
      options.headers.set('Authorization', `Bearer ${token}`)
  },
  async onResponseError({ response, options }) {
    const data = response._data || {}
    let errMessage = data.message || data.error || `HTTP ${response.status} ${response.statusText}`

    if (response.status === 500)
      errMessage = i18n.global.t('errors.server500')

    if (!options.silentErrors) {
      providers.onError(errMessage)
      if (response.status === 401)
        providers.onUnauthorized()
    }

    const customError = new Error(errMessage) as Error & { status?: number }
    customError.status = response.status
    throw customError
  },
  async onRequestError({ error, options }) {
    let errMessage = error.message
    const isNetworkError = errMessage.includes('Failed to fetch') || errMessage.includes('Network Error')
    if (isNetworkError)
      errMessage = i18n.global.t('errors.network')

    const isAbort = error.name === 'AbortError' || errMessage.toLowerCase().includes('abort')

    if (!options?.silentErrors && !isAbort && !isNetworkError)
      providers.onError(errMessage)

    const finalError = new Error(errMessage)
    if (isAbort)
      finalError.name = 'AbortError'

    throw finalError
  },
})

export const api = {
  auth: {
    refresh: async (refreshToken: string) =>
      request<UserItem>('/api/v2/auth/token/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    me: async () => request<UserItem | null>('/api/v1/auth/me', { silentErrors: true }),
  },
  map: {
    list: async () => request<MapItem[]>('/api/v1/map'),
  },
  trick: {
    list: async (params?: GetTrickListParams) =>
      request<TrickItem[]>('/api/v1/trick/list', {
        query: params,
      }),
  },
  trigger: {
    list: async (params?: GetTriggerParams) =>
      request<TriggerItem[]>('/api/v1/trigger', {
        query: params,
      }),
  },
}
