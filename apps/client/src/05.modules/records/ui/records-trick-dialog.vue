<script setup lang="ts">
import type { TrickCompleteEntry } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { formatDate } from '~/01.shared/lib/helpers'
import { useRecordsStore } from '~/01.shared/store/records.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitDialog } from '~/02.kit/organisms/kit-dialog/ui'

const { t } = useI18n()
const recordsStore = useRecordsStore()
const toast = useToast()

const sortMode = ref<'time' | 'speed' | 'date'>('time')

const trickData = computed(() => recordsStore.selectedTrickCompletes)

const sortedCompletes = computed<TrickCompleteEntry[]>(() => {
  if (!trickData.value?.completes)
    return []

  const list = [...trickData.value.completes]
  if (sortMode.value === 'time') {
    return list.sort((a, b) => a.time - b.time)
  }

  if (sortMode.value === 'speed') {
    return list.sort((a, b) => b.speed - a.speed)
  }

  if (sortMode.value === 'date') {
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return list
})

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
  <KitDialog
    v-model="recordsStore.isCompletesDialogOpen"
    :title="trickData ? `${t('records.dialog.title', { name: trickData.trickName })}` : 'Trick Records'"
    width="740px"
  >
    <div v-if="recordsStore.isCompletesLoading" class="dialog-loader">
      <Icon icon="mdi:loading" class="spin-icon" />
      <span>Loading trick runs...</span>
    </div>

    <div v-else-if="trickData" class="trick-dialog-content">
      <!-- Trick Summary Header -->
      <div class="trick-meta-box">
        <div class="trick-meta-left">
          <span class="meta-points">{{ trickData.trickPoint }} pts</span>
          <span v-if="trickData.trickStartType === 1" class="badge-pre">Pre-Strafe</span>
          <span v-else class="badge-unl">Unlimited</span>
          <span class="meta-runs">{{ t('records.dialog.totalRuns', { count: trickData.completes.length }) }}</span>
        </div>

        <!-- Sort Filter Buttons -->
        <div class="sort-tabs">
          <button
            type="button"
            class="sort-tab"
            :class="{ 'is-active': sortMode === 'time' }"
            @click="sortMode = 'time'"
          >
            <Icon icon="mdi:timer-outline" />
            <span>{{ t('records.dialog.sortByTime') }}</span>
          </button>
          <button
            type="button"
            class="sort-tab"
            :class="{ 'is-active': sortMode === 'speed' }"
            @click="sortMode = 'speed'"
          >
            <Icon icon="mdi:speedometer" />
            <span>{{ t('records.dialog.sortBySpeed') }}</span>
          </button>
          <button
            type="button"
            class="sort-tab"
            :class="{ 'is-active': sortMode === 'date' }"
            @click="sortMode = 'date'"
          >
            <Icon icon="mdi:calendar-clock" />
            <span>{{ t('records.dialog.sortByDate') }}</span>
          </button>
        </div>
      </div>

      <!-- WR Cards Section -->
      <div class="wr-cards-row">
        <div v-if="trickData.timeWr" class="wr-card wr-card--time">
          <div class="wr-card-header">
            <Icon icon="mdi:crown" class="wr-crown wr-crown--time" />
            <span class="wr-card-title">{{ t('records.table.timeWr') }}</span>
          </div>
          <div class="wr-card-val text-cyan">
            {{ formatTime(trickData.timeWr.time) }}
          </div>
          <div class="wr-card-player" @click="copySteamId(trickData.timeWr.steamid)">
            <Icon icon="mdi:account" />
            <span>{{ trickData.timeWr.username }}</span>
            <span class="wr-card-speed">({{ trickData.timeWr.speed }} u/s)</span>
          </div>
        </div>

        <div v-if="trickData.speedWr" class="wr-card wr-card--speed">
          <div class="wr-card-header">
            <Icon icon="mdi:crown" class="wr-crown wr-crown--speed" />
            <span class="wr-card-title">{{ t('records.table.speedWr') }}</span>
          </div>
          <div class="wr-card-val text-yellow">
            {{ formatSpeed(trickData.speedWr.speed) }}
          </div>
          <div class="wr-card-player" @click="copySteamId(trickData.speedWr.steamid)">
            <Icon icon="mdi:account" />
            <span>{{ trickData.speedWr.username }}</span>
            <span class="wr-card-speed">({{ formatTime(trickData.speedWr.time) }})</span>
          </div>
        </div>
      </div>

      <!-- Runs Table -->
      <div class="runs-table">
        <div class="runs-header">
          <div class="run-th col-rank-time">
            Time #
          </div>
          <div class="run-th col-rank-speed">
            Speed #
          </div>
          <div class="run-th col-player">
            {{ t('records.table.player') }}
          </div>
          <div class="run-th col-time">
            {{ t('records.table.time') }}
          </div>
          <div class="run-th col-speed">
            {{ t('records.table.speed') }}
          </div>
          <div class="run-th col-date">
            {{ t('records.table.date') }}
          </div>
        </div>

        <div v-if="sortedCompletes.length > 0" class="runs-body">
          <div
            v-for="run in sortedCompletes"
            :key="run.id"
            class="run-row"
            :class="{
              'is-wr-time': run.rankByTime === 1,
              'is-wr-speed': run.rankBySpeed === 1,
            }"
          >
            <!-- Rank Time -->
            <div class="run-td col-rank-time">
              <span v-if="run.rankByTime === 1" class="wr-crown-icon text-cyan" title="Time WR">
                <Icon icon="mdi:crown" />
              </span>
              <span v-else class="rank-badge">{{ run.rankByTime }}</span>
            </div>

            <!-- Rank Speed -->
            <div class="run-td col-rank-speed">
              <span v-if="run.rankBySpeed === 1" class="wr-crown-icon text-yellow" title="Speed WR">
                <Icon icon="mdi:crown" />
              </span>
              <span v-else class="rank-badge">{{ run.rankBySpeed }}</span>
            </div>

            <!-- Player -->
            <div class="run-td col-player">
              <div class="player-info" @click="copySteamId(run.steamid)">
                <span class="player-name">{{ run.username }}</span>
                <span class="player-steamid">{{ run.steamid }}</span>
              </div>
            </div>

            <!-- Time -->
            <div class="run-td col-time">
              <span class="val-mono" :class="{ 'text-cyan font-bold': run.rankByTime === 1 }">
                {{ formatTime(run.time) }}
              </span>
            </div>

            <!-- Speed -->
            <div class="run-td col-speed">
              <span class="val-mono" :class="{ 'text-yellow font-bold': run.rankBySpeed === 1 }">
                {{ formatSpeed(run.speed) }}
              </span>
            </div>

            <!-- Date -->
            <div class="run-td col-date">
              <span class="date-text">{{ formatDate(run.createdAt) || 'Recent' }}</span>
            </div>
          </div>
        </div>

        <div v-else class="runs-empty">
          <p>{{ t('records.table.noCompletes') }}</p>
        </div>
      </div>
    </div>

    <template #footer="{ close }">
      <KitBtn color="secondary" @click="close">
        {{ t('kit.dialog.close') }}
      </KitBtn>
    </template>
  </KitDialog>
</template>

<style lang="scss" scoped>
.trick-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.dialog-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: var(--fg-secondary-color);
}

.spin-icon {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.trick-meta-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background-color: var(--bg-primary-color);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-secondary-color);
}

.trick-meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-points {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--fg-highlight-color);
}

.badge-pre {
  background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.2));
  color: var(--fg-accent-color);
  border: 1px solid var(--border-accent-color);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge-unl {
  background-color: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.3);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.meta-runs {
  font-size: 0.8rem;
  color: var(--fg-secondary-color);
  margin-left: 6px;
}

.sort-tabs {
  display: flex;
  gap: 4px;
}

.sort-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: none;
  border: 1px solid transparent;
  color: var(--fg-secondary-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--fg-accent-color);
    background-color: var(--bg-secondary-color);
  }

  &.is-active {
    background-color: var(--bg-secondary-color);
    border-color: var(--border-primary-color);
    color: var(--fg-accent-color);
  }
}

.wr-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.wr-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 8px;

  &--time {
    border-left: 3px solid #22d3ee;
  }

  &--speed {
    border-left: 3px solid #facc15;
  }
}

.wr-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wr-crown {
  font-size: 1.1rem;

  &--time {
    color: #22d3ee;
  }
  &--speed {
    color: #facc15;
  }
}

.wr-card-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--fg-secondary-color);
}

.wr-card-val {
  font-size: 1.3rem;
  font-weight: 800;
  font-family: monospace;
}

.wr-card-player {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--fg-primary-color);
  cursor: copy;

  &:hover {
    color: var(--fg-accent-color);
  }
}

.wr-card-speed {
  font-size: 0.75rem;
  color: var(--fg-muted-color);
}

.runs-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid var(--border-secondary-color);
  border-radius: 8px;
}

.runs-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--bg-primary-color);
  border-bottom: 1px solid var(--border-content-color);
  position: sticky;
  top: 0;
  z-index: 2;
  user-select: none;
}

.run-th {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--fg-secondary-color);
}

.runs-body {
  display: flex;
  flex-direction: column;
}

.run-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-secondary-color);
  transition: background-color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--bg-secondary-color);
  }

  &.is-wr-time {
    background-color: rgba(6, 182, 212, 0.05);
  }

  &.is-wr-speed {
    background-color: rgba(234, 179, 8, 0.05);
  }
}

.run-td {
  display: flex;
  align-items: center;
}

.col-rank-time {
  width: 60px;
  justify-content: center;
}

.col-rank-speed {
  width: 60px;
  justify-content: center;
}

.rank-badge {
  font-size: 0.75rem;
  color: var(--fg-secondary-color);
  font-weight: 600;
}

.wr-crown-icon {
  font-size: 1rem;
}

.col-player {
  flex: 3;
  min-width: 140px;
}

.player-info {
  display: flex;
  flex-direction: column;
  cursor: copy;

  &:hover .player-name {
    color: var(--fg-accent-color);
  }
}

.player-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--fg-primary-color);
}

.player-steamid {
  font-size: 0.7rem;
  color: var(--fg-muted-color);
  font-family: monospace;
}

.col-time {
  width: 100px;
  justify-content: flex-end;
}

.col-speed {
  width: 110px;
  justify-content: flex-end;
}

.col-date {
  width: 110px;
  justify-content: flex-end;
}

.val-mono {
  font-family: monospace;
  font-size: 0.85rem;
}

.font-bold {
  font-weight: 700;
}

.date-text {
  font-size: 0.75rem;
  color: var(--fg-muted-color);
}

.text-cyan {
  color: #22d3ee;
}

.text-yellow {
  color: #facc15;
}

.runs-empty {
  padding: 32px;
  text-align: center;
  color: var(--fg-secondary-color);
}
</style>
