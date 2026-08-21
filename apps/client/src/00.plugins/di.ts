import type { InjectionKey } from 'vue'
import { hasInjectionContext, inject } from 'vue'
import { authRepository } from '~/01.shared/repositories/auth.repository'
import { mapRepository } from '~/01.shared/repositories/map.repository'
import { trickRepository } from '~/01.shared/repositories/trick.repository'
import { triggerRepository } from '~/01.shared/repositories/trigger.repository'

export interface Repositories {
  auth: typeof authRepository
  map: typeof mapRepository
  trick: typeof trickRepository
  trigger: typeof triggerRepository
}

export const defaultRepositories: Repositories = {
  auth: authRepository,
  map: mapRepository,
  trick: trickRepository,
  trigger: triggerRepository,
}

export const REPOS_INJECTION_KEY = Symbol('Repositories') as InjectionKey<Repositories>

export function useRepos(): Repositories {
  if (hasInjectionContext())
    return inject(REPOS_INJECTION_KEY, defaultRepositories)

  return defaultRepositories
}
