<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useChangeTheme } from '~/01.shared/composables/use-change-theme'
import { useGlobalTracking } from '~/01.shared/composables/use-tracking'
import { useMapStore } from '~/01.shared/store/map.store'
import { useNetworkStore } from '~/01.shared/store/network.store'

import KitNetworkTimeoutDialog from '~/02.kit/organisms/kit-network-timeout-dialog/ui/kit-network-timeout-dialog.vue'
import KitOfflineBadge from '~/02.kit/organisms/kit-offline-badge/ui/kit-offline-badge.vue'
import KitReloadPrompt from '~/02.kit/organisms/kit-reload-prompt/ui/kit-reload-prompt.vue'
import KitToastManager from '~/02.kit/organisms/kit-toast-manager/ui/kit-toast-manager.vue'
import DefaultLayout from '~/06.layouts/default/ui/default.vue'
import EmptyLayout from '~/06.layouts/empty/ui/empty.vue'
import TricksLayout from '~/06.layouts/tricks/ui/tricks-layout.vue'

useChangeTheme()
useGlobalTracking()

const route = useRoute()
const networkStore = useNetworkStore()
const mapStore = useMapStore()
const { locale, t } = useI18n()

onMounted(async () => {
  networkStore.initListeners()
  await mapStore.fetchMaps()
})

const layoutName = computed(() => (route.meta.layout as string) || 'default')

const siteName = 'SurfGxds'
const description = computed(() => t('app.description'))

const titleChunk = computed(() => {
  if (route.params.map) {
    const mapName = String(route.params.map)
    const section = route.name ? t(`routes.${String(route.name)}`) : ''

    return `${mapName} | ${section}`
  }

  if (route.name) {
    const key = `routes.${String(route.name)}`
    const val = t(key)
    if (val && val !== key)
      return val
  }

  return ''
})

useHead({
  title: titleChunk,
  titleTemplate: chunk => (chunk ? `${chunk} | ${siteName}` : `${siteName} - TrickSurf`),
  htmlAttrs: {
    lang: computed(() => locale.value),
  },
  meta: [
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: computed(() => (titleChunk.value ? `${titleChunk.value} | ${siteName}` : siteName)) },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: siteName },
  ],
})
</script>

<template>
  <DefaultLayout>
    <TricksLayout v-if="layoutName === 'tricks'">
      <router-view v-slot="{ Component, route: currentRoute }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="currentRoute.fullPath" />
        </transition>
      </router-view>
    </TricksLayout>

    <router-view v-else-if="layoutName === 'default'" v-slot="{ Component, route: currentRoute }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="currentRoute.fullPath" />
      </transition>
    </router-view>

    <EmptyLayout v-else>
      <router-view v-slot="{ Component, route: currentRoute }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="currentRoute.fullPath" />
        </transition>
      </router-view>
    </EmptyLayout>
  </DefaultLayout>

  <KitReloadPrompt />
  <KitNetworkTimeoutDialog />
  <KitOfflineBadge />
  <KitToastManager />
</template>

<style lang="scss">
/* Root App Styles */
</style>
