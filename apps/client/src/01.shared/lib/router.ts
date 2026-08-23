import { createRouter, createWebHistory } from 'vue-router'
import { useTracking } from '~/01.shared/composables/use-tracking'
import { AppRouteNames } from '~/01.shared/constants/routes'
import { setupViewTransitions } from '~/01.shared/lib/view-transitions'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition)
      return savedPosition

    return { top: 0 }
  },

  routes: [
    {
      path: '/',
      name: AppRouteNames.Home,
      component: async () => import('~/07.views/index.vue'),
      meta: { layout: 'default' },
    },
    {
      path: '/faq',
      name: AppRouteNames.Faq,
      component: async () => import('~/07.views/faq.vue'),
      meta: { layout: 'default' },
    },
    {
      path: '/:map/tricks',
      name: AppRouteNames.Tricks,
      component: async () => import('~/07.views/tricks.vue'),
      meta: { layout: 'tricks' },
    },
    {
      path: '/:map/triggers',
      name: AppRouteNames.Triggers,
      component: async () => import('~/07.views/triggers.vue'),
      meta: { layout: 'tricks' },
    },
    {
      path: '/:map/records',
      name: AppRouteNames.Records,
      component: async () => import('~/07.views/records.vue'),
      meta: { layout: 'tricks' },
    },
    {
      path: '/:map/editor',
      name: AppRouteNames.Editor,
      component: async () => import('~/07.views/editor.vue'),
      meta: { layout: 'tricks' },
    },
    {
      path: '/editor',
      redirect: '/surf_ski_2_go/editor',
    },
    {
      path: '/:pathMatch(.*)*',
      name: AppRouteNames.NotFound,
      component: async () => import('~/07.views/not-found.vue'),
      meta: { layout: 'default' },
    },
  ],
})

setupViewTransitions(router)

router.afterEach((to) => {
  const { trackPageview } = useTracking()
  trackPageview(to.fullPath, String(to.name || ''))
})

export default router
