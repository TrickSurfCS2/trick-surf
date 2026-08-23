<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { formatDate } from '~/01.shared/lib/helpers'
import { useRecordsStore } from '~/01.shared/store/records.store'

const { t } = useI18n()
const recordsStore = useRecordsStore()
const toast = useToast()

const recentCompletes = computed(() => recordsStore.filteredRecentCompletes)

function openTrick(trickId: number) {
  recordsStore.openTrickCompletesDialog(trickId)
}

function copySteamId(steamid: string) {
  navigator.clipboard.writeText(steamid).then(() => {
    toast.success(`Copied SteamID: ${steamid}`)
  }).catch(() => {})
}

function formatTime(val?: number) {
  if (val === undefined || val === null)
    return '—'

  return `${val.toFixed(3)}s`
}

function formatSpeed(val?: number) {
  if (val === undefined || val === null)
    return '—'

  return `${val.toLocaleString()} u/s`
}
</script>

<template>
  <div class="records-recent-wrap">
    <div class="table-header">
      <div class="th-col col-date">
        <span>{{ t('records.table.date') }}</span>
      </div>
      <div class="th-col col-player">
        <span>{{ t('records.table.player') }}</span>
      </div>
      <div class="th-col col-trick">
        <span>{{ t('records.table.trick') }}</span>
      </div>
      <div class="th-col col-time">
        <span>{{ t('records.table.time') }}</span>
      </div>
      <div class="th-col col-speed">
        <span>{{ t('records.table.speed') }}</span>
      </div>
    </div>

    <div v-if="recentCompletes.length > 0" class="table-body">
      <div
        v-for="item in recentCompletes"
        :key="item.id"
        class="table-row"
        @click="openTrick(item.trickId)"
      >
        <!-- Date -->
        <div class="td-col col-date">
          <Icon icon="mdi:clock-outline" class="clock-icon" />
          <span>{{ formatDate(item.createdAt) || 'Recent' }}</span>
        </div>

        <!-- Player -->
        <div class="td-col col-player">
          <div class="player-info">
            <span class="player-name">{{ item.username }}</span>
            <span
              class="player-steamid"
              :title="`Click to copy: ${item.steamid}`"
              @click.stop="copySteamId(item.steamid)"
            >
              {{ item.steamid }}
            </span>
          </div>
        </div>

        <!-- Trick -->
        <div class="td-col col-trick">
          <span class="trick-name">{{ item.trickName }}</span>
        </div>

        <!-- Time -->
        <div class="td-col col-time">
          <span class="time-val text-cyan">{{ formatTime(item.time) }}</span>
        </div>

        <!-- Speed -->
        <div class="td-col col-speed">
          <span class="speed-val text-yellow">{{ formatSpeed(item.speed) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="table-empty">
      <Icon icon="mdi:information-outline" class="empty-icon" />
      <p>{{ t('records.table.noCompletes') }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.records-recent-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background-color: var(--bg-primary-color);
  border-bottom: 1px solid var(--border-content-color);
  position: sticky;
  top: var(--header-height);
  z-index: 10;
  backdrop-filter: blur(8px);
  user-select: none;
}

.th-col {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--fg-secondary-color);
}

.table-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: var(--r-md, 8px);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    background-color: var(--bg-tertiary-color);
  }
}

.td-col {
  display: flex;
  align-items: center;
}

.col-date {
  width: 150px;
  font-size: 0.8rem;
  color: var(--fg-muted-color);
  gap: 6px;
}

.clock-icon {
  font-size: 0.85rem;
}

.col-player {
  flex: 2;
  min-width: 140px;
}

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 600;
  color: var(--fg-primary-color);
  font-size: 0.9rem;
}

.player-steamid {
  font-size: 0.75rem;
  color: var(--fg-muted-color);
  font-family: monospace;
  cursor: copy;

  &:hover {
    color: var(--fg-accent-color);
  }
}

.col-trick {
  flex: 3;
  min-width: 160px;
}

.trick-name {
  font-weight: 600;
  color: var(--fg-accent-color);
  font-size: 0.95rem;
}

.col-time {
  width: 110px;
  justify-content: flex-end;
}

.time-val {
  font-weight: 700;
  font-family: monospace;
  font-size: 0.9rem;
}

.col-speed {
  width: 120px;
  justify-content: flex-end;
}

.speed-val {
  font-weight: 700;
  font-family: monospace;
  font-size: 0.9rem;
}

.text-cyan {
  color: #22d3ee;
}

.text-yellow {
  color: #facc15;
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--fg-secondary-color);
  gap: 12px;

  .empty-icon {
    font-size: 2.5rem;
    color: var(--fg-muted-color);
  }
}
</style>
