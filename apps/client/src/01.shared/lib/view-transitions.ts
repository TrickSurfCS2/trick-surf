import type { Router } from 'vue-router'

export function isViewTransitionSupported(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

export function setupViewTransitions(router: Router) {
  if (!isViewTransitionSupported())
    return

  router.beforeResolve((to, from) => {
    if (to.path === from.path)
      return

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve()
      })
    })
  })
}
