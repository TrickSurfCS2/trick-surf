<script setup lang="ts">
import type { RecordTabKey } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useMapStore } from '~/01.shared/store/map.store'
import { useRecordsStore } from '~/01.shared/store/records.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'
import { KitPageLoader } from '~/02.kit/atoms/kit-page-loader/ui'
import RecordsLeaderboardTable from './records-leaderboard-table.vue'
import RecordsRecentTable from './records-recent-table.vue'
import RecordsStatsBar from './records-stats-bar.vue'
import RecordsTrickDialog from './records-trick-dialog.vue'
import RecordsTricksTable from './records-tricks-table.vue'

const { t } = useI18n()
const recordsStore = useRecordsStore()
const mapStore = useMapStore()

const search = ref('')

watch(search, (val) => {
  recordsStore.setSearch(val)
})

watch(() => mapStore.selectedMap?.id, (mapId) => {
  if (mapId) {
    recordsStore.fetchMapRecords(mapId)
  }
}, { immediate: true })

const currentTab = computed({
  get: () => recordsStore.activeTab,
  set: (val: RecordTabKey) => recordsStore.setTab(val),
})

const searchPlaceholder = computed(() => {
  if (recordsStore.activeTab === 'leaderboard')
    return t('records.filters.searchPlayers')
  if (recordsStore.activeTab === 'recent')
    return t('records.filters.searchRecent')

  return t('records.filters.searchTricks')
})

function refreshData() {
  if (mapStore.selectedMap?.id) {
    recordsStore.fetchMapRecords(mapStore.selectedMap.id, true)
  }
}
</script>

<template>
  <div class="records-module">
    <!-- Top Stats Bar -->
    <RecordsStatsBar />

    <!-- Main Toolbar -->
    <div class="records-toolbar">
      <!-- Navigation Tabs -->
      <div class="records-tab-buttons">
        <button
          type="button"
          class="tab-btn"
          :class="{ 'is-active': currentTab === 'tricks' }"
          @click="currentTab = 'tricks'"
        >
          <Icon icon="mdi:routes" />
          <span>{{ t('records.tabs.tricks') }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ 'is-active': currentTab === 'leaderboard' }"
          @click="currentTab = 'leaderboard'"
        >
          <Icon icon="mdi:trophy-outline" />
          <span>{{ t('records.tabs.leaderboard') }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ 'is-active': currentTab === 'recent' }"
          @click="currentTab = 'recent'"
        >
          <Icon icon="mdi:history" />
          <span>{{ t('records.tabs.recent') }}</span>
        </button>
      </div>

      <!-- Right controls: Search & Mode filter & Refresh -->
      <div class="records-controls">
        <!-- Mode Filters (Tricks tab only) -->
        <div v-if="currentTab === 'tricks'" class="mode-filter-group">
          <button
            type="button"
            class="mode-btn"
            :class="{ 'is-active': recordsStore.startTypeFilter === 'all' }"
            @click="recordsStore.setStartTypeFilter('all')"
          >
            {{ t('records.filters.allModes') }}
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ 'is-active': recordsStore.startTypeFilter === 'pre' }"
            @click="recordsStore.setStartTypeFilter('pre')"
          >
            {{ t('records.filters.preStrafe') }}
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ 'is-active': recordsStore.startTypeFilter === 'unlimited' }"
            @click="recordsStore.setStartTypeFilter('unlimited')"
          >
            {{ t('records.filters.unlimited') }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="search-box">
          <KitInput
            v-model="search"
            prepend-icon="mdi:magnify"
            :placeholder="searchPlaceholder"
            clearable
          />
        </div>

        <!-- Refresh Button -->
        <KitBtn
          variant="tonal"
          color="secondary"
          size="md"
          prepend-icon="mdi:refresh"
          :loading="recordsStore.isLoading"
          @click="refreshData"
        />
      </div>
    </div>

    <!-- Content Area -->
    <KitPageLoader v-if="recordsStore.isLoading" :text="t('records.loading')" />

    <div v-else class="records-content-body">
      <!-- Tab 1: Trick WRs Table -->
      <RecordsTricksTable v-if="currentTab === 'tricks'" />

      <!-- Tab 2: Leaderboard Table -->
      <RecordsLeaderboardTable v-else-if="currentTab === 'leaderboard'" />

      <!-- Tab 3: Recent Activity Table -->
      <RecordsRecentTable v-else-if="currentTab === 'recent'" />
    </div>

    <!-- Trick Completes Modal Dialog -->
    <RecordsTrickDialog />
  </div>
</template>

<style lang="scss" scoped>
.records-module {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.records-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.records-tab-buttons {
  display: flex;
  align-items: stretch;
  height: 38px;
  box-sizing: border-box;
  gap: 4px;
  background-color: var(--bg-secondary-color);
  padding: 3px;
  border-radius: var(--r-md, 8px);
  border: 1px solid var(--border-secondary-color);
}

.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 6px;
  padding: 0 14px;
  border-radius: 6px;
  border: none;
  background: none;
  color: var(--fg-secondary-color);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: var(--fg-primary-color);
    background-color: var(--bg-tertiary-color);
  }

  &.is-active {
    background-color: var(--bg-primary-color);
    color: var(--fg-accent-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
}

.records-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mode-filter-group {
  display: flex;
  align-items: stretch;
  height: 38px;
  box-sizing: border-box;
  gap: 2px;
  background-color: var(--bg-secondary-color);
  padding: 3px;
  border-radius: var(--r-md, 8px);
  border: 1px solid var(--border-secondary-color);
}

.mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 5px;
  border: none;
  background: none;
  color: var(--fg-secondary-color);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: var(--fg-primary-color);
  }

  &.is-active {
    background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.2));
    color: var(--fg-accent-color);
  }
}

.search-box {
  width: 280px;
  height: 38px;
  max-width: 100%;
  display: flex;
  align-items: center;
}

.records-content-body {
  width: 100%;
}
</style>
