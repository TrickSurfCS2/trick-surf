<script setup lang="ts">
import type { TrickSortKey } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useTricksStore } from '~/01.shared/store/tricks.store'

const tricksStore = useTricksStore()
const { t } = useI18n()

function onSort(key: TrickSortKey) {
  tricksStore.toggleSort(key)
}
</script>

<template>
  <div class="tricks-list-header">
    <div class="header-col col-index" @click="onSort('index')">
      <span>#</span>
      <div v-if="tricksStore.sortedSettings.index !== 'none'" class="sort-indicator">
        <Icon :icon="tricksStore.sortedSettings.index === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
      </div>
    </div>

    <div class="header-col col-name" @click="onSort('name')">
      <span>{{ t('tricks.name') }}</span>
      <div v-if="tricksStore.sortedSettings.name !== 'none'" class="sort-indicator">
        <Icon :icon="tricksStore.sortedSettings.name === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
      </div>
    </div>

    <div class="header-col col-points" @click="onSort('point')">
      <span>{{ t('tricks.points') }}</span>
      <div v-if="tricksStore.sortedSettings.point !== 'none'" class="sort-indicator">
        <Icon :icon="tricksStore.sortedSettings.point === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
      </div>
    </div>

    <div class="header-col col-completes" @click="onSort('totalCompletes')">
      <span>{{ t('tricks.completes') }}</span>
      <div v-if="tricksStore.sortedSettings.totalCompletes !== 'none'" class="sort-indicator">
        <Icon :icon="tricksStore.sortedSettings.totalCompletes === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
      </div>
    </div>

    <div class="header-col col-length" @click="onSort('trickLength')">
      <span>{{ t('tricks.length') }}</span>
      <div v-if="tricksStore.sortedSettings.trickLength !== 'none'" class="sort-indicator">
        <Icon :icon="tricksStore.sortedSettings.trickLength === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tricks-list-header {
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid var(--border-content-color);
  position: sticky;
  top: var(--header-height);
  background-color: var(--bg-primary-color);
  backdrop-filter: blur(8px);
  z-index: 10;
  padding: 8px 12px;
  user-select: none;
}

.header-col {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--fg-secondary-color);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--fg-accent-color);
  }

  &.col-index {
    width: 60px;
    justify-content: center;
  }

  &.col-name {
    flex: 2;
    min-width: 120px;
  }

  &.col-points {
    width: 90px;
    justify-content: center;
  }

  &.col-completes {
    width: 110px;
    justify-content: flex-end;
  }

  &.col-length {
    width: 90px;
    justify-content: flex-end;
  }
}

.sort-indicator {
  font-size: 1rem;
  color: var(--fg-accent-color);
}
</style>
