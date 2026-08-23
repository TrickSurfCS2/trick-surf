<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMapStore } from '~/01.shared/store/map.store'
import { KitDrawer } from '~/02.kit/molecules/kit-drawer/ui'

const isOpen = defineModel<boolean>({ default: false })
const router = useRouter()
const mapStore = useMapStore()
const { t } = useI18n()

onMounted(() => {
  mapStore.fetchMaps()
})

function navigateTo(path: string) {
  router.push(path)
  isOpen.value = false
}
</script>

<template>
  <KitDrawer v-model="isOpen" title="Navigation">
    <div class="nav-drawer-menu">
      <div class="nav-section">
        <div class="nav-section-title">
          {{ t('nav.selectMap') }}
        </div>
        <ul class="nav-list">
          <li
            v-for="map in mapStore.maps"
            :key="map.id"
            class="nav-item"
            :class="{ 'is-selected': mapStore.selectedMap?.name === map.name }"
            @click="navigateTo(`/${map.name}/tricks`)"
          >
            <Icon icon="mdi:map-marker-path" class="nav-item-icon" />
            <span class="nav-item-text">{{ map.fullName || map.name }}</span>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <ul class="nav-list">
          <li class="nav-item" @click="navigateTo('/')">
            <Icon icon="mdi:home" class="nav-item-icon" />
            <span class="nav-item-text">{{ t('nav.home') }}</span>
          </li>
          <li
            class="nav-item"
            :class="{ 'is-selected': $route.path.includes('/editor') }"
            @click="navigateTo(`/${mapStore.selectedMap?.name || 'surf_ski_2_go'}/editor`)"
          >
            <Icon icon="mdi:pencil-ruler" class="nav-item-icon" />
            <span class="nav-item-text">{{ t('nav.editor') }}</span>
          </li>
          <li class="nav-item" @click="navigateTo('/faq')">
            <Icon icon="mdi:help-circle-outline" class="nav-item-icon" />
            <span class="nav-item-text">{{ t('nav.faq') }}</span>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <a href="steam://connect/194.147.90.131:27015" class="nav-connect-btn">
          <Icon icon="mdi:server" />
          <span>{{ t('nav.connectServer') }}</span>
        </a>
      </div>
    </div>
  </KitDrawer>
</template>

<style lang="scss" scoped>
.nav-drawer-menu {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--fg-muted-color);
  padding: 0 8px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--fg-primary-color);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-hover-color);
    color: var(--fg-accent-color);
  }

  &.is-selected {
    background-color: var(--bg-accent-overlay-color);
    color: var(--fg-accent-color);
    font-weight: 600;
  }
}

.nav-item-icon {
  font-size: 1.25rem;
}

.nav-connect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--fg-accent-color);
  color: var(--fg-inverted-color);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--fg-action-color);
  }
}
</style>
