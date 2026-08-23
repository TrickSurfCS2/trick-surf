<script setup lang="ts">
import type { RecordSortKey, TrickRecordSummary } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { useRecordsStore } from '~/01.shared/store/records.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'

const { t } = useI18n()
const recordsStore = useRecordsStore()
const toast = useToast()

const tricks = computed(() => recordsStore.filteredTrickRecords)

function onSort(key: RecordSortKey) {
  recordsStore.toggleSort(key)
}

function openTrick(trick: TrickRecordSummary) {
  recordsStore.openTrickCompletesDialog(trick.trickId)
}

function copySteamId(event: Event, steamid?: string) {
  event.stopPropagation()
  if (!steamid)
    return
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
  <div class="records-tricks-table-wrap">
    <!-- Header -->
    <div class="table-header">
      <div class="th-col col-idx" @click="onSort('index')">
        <span>#</span>
        <Icon
          v-if="recordsStore.sortKey === 'index' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-name" @click="onSort('name')">
        <span>{{ t('records.table.trick') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'name' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-points" @click="onSort('point')">
        <span>{{ t('records.table.points') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'point' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-completes" @click="onSort('completes')">
        <span>{{ t('records.table.completes') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'completes' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-wr" @click="onSort('timeWr')">
        <Icon icon="mdi:timer-outline" class="mr-1 text-cyan" />
        <span>{{ t('records.table.timeWr') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'timeWr' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-wr" @click="onSort('speedWr')">
        <Icon icon="mdi:speedometer" class="mr-1 text-yellow" />
        <span>{{ t('records.table.speedWr') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'speedWr' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-actions">
        <span>{{ t('records.table.viewCompletes') }}</span>
      </div>
    </div>

    <!-- Rows -->
    <div v-if="tricks.length > 0" class="table-body">
      <div
        v-for="(trick, idx) in tricks"
        :key="trick.trickId"
        class="table-row"
        @click="openTrick(trick)"
      >
        <!-- Index -->
        <div class="td-col col-idx">
          <span class="row-index">{{ idx + 1 }}</span>
        </div>

        <!-- Trick Name & Mode -->
        <div class="td-col col-name">
          <span class="trick-name">{{ trick.trickName }}</span>
          <span v-if="trick.trickStartType === 1" class="badge-pre">Pre</span>
        </div>

        <!-- Points -->
        <div class="td-col col-points">
          <span class="badge-point">{{ trick.trickPoint }}</span>
        </div>

        <!-- Total Completes -->
        <div class="td-col col-completes">
          <div class="completes-pill" :class="{ 'is-zero': trick.totalCompletes === 0 }">
            <Icon icon="mdi:account-check-outline" />
            <span>{{ trick.totalCompletes }}</span>
          </div>
        </div>

        <!-- Time WR -->
        <div class="td-col col-wr">
          <div v-if="trick.timeWr" class="wr-badge-box wr-badge-box--time">
            <div class="wr-top-line">
              <span class="wr-val text-cyan">{{ formatTime(trick.timeWr.time) }}</span>
              <span class="wr-sub">({{ trick.timeWr.speed }} u/s)</span>
            </div>
            <div class="wr-user-line" :title="`Click to copy SteamID: ${trick.timeWr.steamid}`" @click="copySteamId($event, trick.timeWr.steamid)">
              <Icon icon="mdi:account" class="user-icon" />
              <span class="wr-user">{{ trick.timeWr.username }}</span>
            </div>
          </div>
          <span v-else class="wr-empty">—</span>
        </div>

        <!-- Speed WR -->
        <div class="td-col col-wr">
          <div v-if="trick.speedWr" class="wr-badge-box wr-badge-box--speed">
            <div class="wr-top-line">
              <span class="wr-val text-yellow">{{ formatSpeed(trick.speedWr.speed) }}</span>
              <span class="wr-sub">({{ formatTime(trick.speedWr.time) }})</span>
            </div>
            <div class="wr-user-line" :title="`Click to copy SteamID: ${trick.speedWr.steamid}`" @click="copySteamId($event, trick.speedWr.steamid)">
              <Icon icon="mdi:account" class="user-icon" />
              <span class="wr-user">{{ trick.speedWr.username }}</span>
            </div>
          </div>
          <span v-else class="wr-empty">—</span>
        </div>

        <!-- Actions -->
        <div class="td-col col-actions" @click.stop="openTrick(trick)">
          <KitBtn
            size="sm"
            variant="tonal"
            color="secondary"
            prepend-icon="mdi:chart-timeline-variant"
          >
            {{ trick.totalCompletes }}
          </KitBtn>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="table-empty">
      <Icon icon="mdi:information-outline" class="empty-icon" />
      <p>{{ t('records.table.noRecords') }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.records-tricks-table-wrap {
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
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--fg-secondary-color);
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--fg-accent-color);
  }
}

.sort-icon {
  font-size: 0.95rem;
  color: var(--fg-accent-color);
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
    transform: translateX(2px);
  }
}

.td-col {
  display: flex;
  align-items: center;
}

.col-idx {
  width: 50px;
  justify-content: center;
}

.row-index {
  font-weight: 700;
  color: var(--fg-secondary-color);
  font-size: 0.85rem;
}

.col-name {
  flex: 2;
  min-width: 140px;
  gap: 8px;
}

.trick-name {
  font-weight: 600;
  color: var(--fg-accent-color);
  font-size: 0.95rem;
}

.badge-pre {
  background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.2));
  color: var(--fg-accent-color);
  border: 1px solid var(--border-accent-color);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 4px;
  text-transform: uppercase;
}

.col-points {
  width: 80px;
  justify-content: center;
}

.badge-point {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--fg-highlight-color);
  background-color: var(--bg-primary-color);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-secondary-color);
}

.col-completes {
  width: 160px;
  justify-content: center;
}

.completes-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fg-primary-color);
  background-color: var(--bg-primary-color);
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid var(--border-secondary-color);

  &.is-zero {
    color: var(--fg-muted-color);
    opacity: 0.6;
  }
}

.col-wr {
  flex: 2;
  min-width: 160px;
  justify-content: flex-start;
}

.wr-badge-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 8px;
  background-color: var(--bg-primary-color);
  border-radius: 6px;
  border: 1px solid var(--border-secondary-color);
  width: 100%;
  max-width: 180px;

  &--time {
    border-left: 3px solid #22d3ee;
  }

  &--speed {
    border-left: 3px solid #facc15;
  }
}

.wr-top-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.wr-val {
  font-weight: 700;
  font-size: 0.85rem;
  font-family: monospace;
}

.wr-sub {
  font-size: 0.7rem;
  color: var(--fg-muted-color);
}

.wr-user-line {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: copy;

  &:hover .wr-user {
    color: var(--fg-accent-color);
    text-decoration: underline;
  }
}

.user-icon {
  font-size: 0.8rem;
  color: var(--fg-muted-color);
}

.wr-user {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--fg-secondary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.wr-empty {
  color: var(--fg-muted-color);
  font-size: 0.85rem;
}

.col-actions {
  width: 90px;
  justify-content: flex-end;
}

.text-cyan {
  color: #22d3ee;
}

.text-yellow {
  color: #facc15;
}

.mr-1 {
  margin-right: 4px;
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
