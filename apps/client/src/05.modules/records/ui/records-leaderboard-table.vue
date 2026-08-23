<script setup lang="ts">
import type { RecordSortKey } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { useRecordsStore } from '~/01.shared/store/records.store'

const { t } = useI18n()
const recordsStore = useRecordsStore()
const toast = useToast()

const players = computed(() => recordsStore.filteredLeaderboard)

function onSort(key: RecordSortKey) {
  recordsStore.toggleSort(key)
}

function copySteamId(steamid: string) {
  navigator.clipboard.writeText(steamid).then(() => {
    toast.success(`Copied SteamID: ${steamid}`)
  }).catch(() => {})
}
</script>

<template>
  <div class="records-leaderboard-wrap">
    <!-- Header -->
    <div class="table-header">
      <div class="th-col col-rank" @click="onSort('index')">
        <span>#</span>
      </div>

      <div class="th-col col-player" @click="onSort('name')">
        <span>{{ t('records.table.player') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'name' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-points" @click="onSort('points')">
        <span>{{ t('records.table.points') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'points' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-tricks" @click="onSort('completes')">
        <span>{{ t('records.table.completes') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'completes' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>

      <div class="th-col col-wrs" @click="onSort('wrs')">
        <span>{{ t('records.table.totalWrs') }}</span>
        <Icon
          v-if="recordsStore.sortKey === 'wrs' && recordsStore.sortDir !== 'none'"
          :icon="recordsStore.sortDir === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          class="sort-icon"
        />
      </div>
    </div>

    <!-- Body -->
    <div v-if="players.length > 0" class="table-body">
      <div
        v-for="player in players"
        :key="player.userId"
        class="table-row"
        :class="{
          'is-gold': player.rank === 1,
          'is-silver': player.rank === 2,
          'is-bronze': player.rank === 3,
        }"
      >
        <!-- Rank -->
        <div class="td-col col-rank">
          <span v-if="player.rank === 1" class="rank-medal rank-medal--gold" title="Rank 1 - Gold">
            <Icon icon="mdi:trophy" />
          </span>
          <span v-else-if="player.rank === 2" class="rank-medal rank-medal--silver" title="Rank 2 - Silver">
            <Icon icon="mdi:medal" />
          </span>
          <span v-else-if="player.rank === 3" class="rank-medal rank-medal--bronze" title="Rank 3 - Bronze">
            <Icon icon="mdi:medal-outline" />
          </span>
          <span v-else class="rank-num">{{ player.rank }}</span>
        </div>

        <!-- Player -->
        <div class="td-col col-player">
          <div class="player-avatar">
            <Icon icon="mdi:account-circle" />
          </div>
          <div class="player-info">
            <span class="player-name">{{ player.username }}</span>
            <span
              class="player-steamid"
              :title="`Click to copy: ${player.steamid}`"
              @click.stop="copySteamId(player.steamid)"
            >
              {{ player.steamid }}
              <Icon icon="mdi:content-copy" class="copy-icon" />
            </span>
          </div>
        </div>

        <!-- Points -->
        <div class="td-col col-points">
          <span class="points-val">{{ player.points }}</span>
          <span class="points-label">pts</span>
        </div>

        <!-- Completed Tricks -->
        <div class="td-col col-tricks">
          <div class="tricks-pill">
            <span class="unique-count">{{ player.completedTricksCount }}</span>
            <span class="total-count">/ {{ player.totalCompletesCount }} runs</span>
          </div>
        </div>

        <!-- WRs -->
        <div class="td-col col-wrs">
          <div class="wrs-badges">
            <span
              v-if="player.timeWrCount > 0"
              class="wr-pill wr-pill--time"
              :title="`${player.timeWrCount} Time World Records`"
            >
              <Icon icon="mdi:timer-outline" />
              {{ player.timeWrCount }}
            </span>
            <span
              v-if="player.speedWrCount > 0"
              class="wr-pill wr-pill--speed"
              :title="`${player.speedWrCount} Speed World Records`"
            >
              <Icon icon="mdi:speedometer" />
              {{ player.speedWrCount }}
            </span>
            <span v-if="player.timeWrCount === 0 && player.speedWrCount === 0" class="wr-none">
              —
            </span>
          </div>
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
.records-leaderboard-wrap {
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
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    background-color: var(--bg-tertiary-color);
  }

  &.is-gold {
    border-color: rgba(234, 179, 8, 0.4);
    background: linear-gradient(90deg, rgba(234, 179, 8, 0.08) 0%, var(--bg-secondary-color) 100%);
  }

  &.is-silver {
    border-color: rgba(148, 163, 184, 0.4);
    background: linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0%, var(--bg-secondary-color) 100%);
  }

  &.is-bronze {
    border-color: rgba(217, 119, 6, 0.4);
    background: linear-gradient(90deg, rgba(217, 119, 6, 0.08) 0%, var(--bg-secondary-color) 100%);
  }
}

.td-col {
  display: flex;
  align-items: center;
}

.col-rank {
  width: 50px;
  justify-content: center;
}

.rank-num {
  font-weight: 700;
  color: var(--fg-secondary-color);
  font-size: 0.9rem;
}

.rank-medal {
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &--gold {
    color: #fbbf24;
  }
  &--silver {
    color: #cbd5e1;
  }
  &--bronze {
    color: #d97706;
  }
}

.col-player {
  flex: 3;
  min-width: 180px;
  gap: 10px;
}

.player-avatar {
  font-size: 1.8rem;
  color: var(--fg-secondary-color);
  display: flex;
  align-items: center;
}

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--fg-primary-color);
}

.player-steamid {
  font-size: 0.75rem;
  color: var(--fg-muted-color);
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: copy;

  &:hover {
    color: var(--fg-accent-color);
  }
}

.copy-icon {
  font-size: 0.7rem;
  opacity: 0.7;
}

.col-points {
  width: 120px;
  justify-content: flex-end;
  gap: 4px;
}

.points-val {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--fg-highlight-color);
}

.points-label {
  font-size: 0.75rem;
  color: var(--fg-muted-color);
}

.col-tricks {
  width: 140px;
  justify-content: flex-end;
}

.tricks-pill {
  display: flex;
  align-items: baseline;
  gap: 4px;
  background-color: var(--bg-primary-color);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-secondary-color);
}

.unique-count {
  font-weight: 700;
  color: var(--fg-primary-color);
  font-size: 0.9rem;
}

.total-count {
  font-size: 0.75rem;
  color: var(--fg-muted-color);
}

.col-wrs {
  width: 140px;
  justify-content: flex-end;
}

.wrs-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wr-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;

  &--time {
    background-color: rgba(6, 182, 212, 0.15);
    color: #22d3ee;
    border: 1px solid rgba(6, 182, 212, 0.3);
  }

  &--speed {
    background-color: rgba(234, 179, 8, 0.15);
    color: #facc15;
    border: 1px solid rgba(234, 179, 8, 0.3);
  }
}

.wr-none {
  color: var(--fg-muted-color);
  font-size: 0.85rem;
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
