<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { getMediaUrl } from '~/01.shared/lib/helpers'
import { useMapStore } from '~/01.shared/store/map.store'
import { useTricksStore } from '~/01.shared/store/tricks.store'

const route = useRoute()
const router = useRouter()
const mapStore = useMapStore()
const tricksStore = useTricksStore()

const mapParam = computed(() => route.params.map as string | undefined)

watch(() => [mapParam.value, mapStore.maps], ([name]) => {
  mapStore.setMapByName(name as string | undefined)
  const currentMap = mapStore.selectedMap
  if (currentMap?.id && tricksStore.currentMapId !== currentMap.id) {
    tricksStore.fetchTricks(currentMap.id)
  }
}, { immediate: true })

const currentSection = computed(() => {
  const path = route.path
  if (path.includes('/triggers'))
    return 'triggers'
  if (path.includes('/records'))
    return 'records'

  return 'tricks'
})

const FALLBACK_BANNER = '/image/tricks-bg-fallback.gif'
const isImageError = ref(false)

watch(() => mapStore.selectedMap?.preview, () => {
  isImageError.value = false
})

const mapBannerSrc = computed(() => {
  if (isImageError.value || !mapStore.selectedMap?.preview)
    return FALLBACK_BANNER

  return getMediaUrl(mapStore.selectedMap.preview)
})

function onImageError() {
  isImageError.value = true
}

function navigateToSection(section: string) {
  const mapName = mapStore.selectedMap?.name || mapParam.value || 'ski2'
  router.push(`/${mapName}/${section}`)
}
</script>

<template>
  <div class="tricks-layout">
    <!-- Map Banner Header -->
    <div class="tricks-header">
      <img
        :src="mapBannerSrc"
        class="header-back"
        :class="{ 'is-fallback': isImageError || !mapStore.selectedMap?.preview }"
        alt="Map preview"
        @error="onImageError"
      >
      <div class="header-overlay" />
      <h1 class="header-title">
        {{ mapStore.selectedMap?.fullName || mapStore.selectedMap?.name || mapParam }}
      </h1>
    </div>

    <!-- Sections Subnavigation -->
    <div class="tricks-sections">
      <div class="sections-wrapper">
        <button
          type="button"
          class="sections-item"
          :class="{ 'is-active': currentSection === 'tricks' }"
          @click="navigateToSection('tricks')"
        >
          tricks
        </button>
        <span class="sections-sep">|</span>
        <button
          type="button"
          class="sections-item"
          :class="{ 'is-active': currentSection === 'triggers' }"
          @click="navigateToSection('triggers')"
        >
          triggers
        </button>
        <span class="sections-sep">|</span>
        <button
          type="button"
          class="sections-item"
          :class="{ 'is-active': currentSection === 'records' }"
          @click="navigateToSection('records')"
        >
          records
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="tricks-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tricks-layout {
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tricks-header {
  position: relative;
  height: 220px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--bg-primary-color);
}

.header-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(5px) brightness(0.6);
  transform: scale(1.05);

  &.is-fallback {
    filter: blur(1px) brightness(0.5) saturate(1.2);
  }
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(13, 17, 23, 0.4) 0%, var(--bg-primary-color) 100%);
}

.header-title {
  position: relative;
  z-index: 2;
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.tricks-sections {
  height: 42px;
  background-color: var(--bg-secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-content-color);
  border-bottom: 1px solid var(--border-content-color);
  position: sticky;
  top: var(--header-height);
  z-index: 20;
}

.sections-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  max-width: var(--max-content-width);
  width: 100%;
}

.sections-item {
  background: none;
  border: none;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--fg-secondary-color);
  cursor: pointer;
  padding: 8px 12px;
  transition: color 0.2s ease;

  &:hover {
    color: var(--fg-accent-color);
  }

  &.is-active {
    color: var(--fg-accent-color);
    font-weight: 700;
  }
}

.sections-sep {
  color: var(--border-primary-color);
  font-size: 0.8rem;
}

.tricks-content {
  max-width: var(--max-content-width);
  width: 100%;
  margin: 0 auto;
  padding: 24px 16px 48px;
  flex: 1;
}
</style>
