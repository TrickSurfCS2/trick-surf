<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useRecordsStore } from '~/01.shared/store/records.store'

const { t } = useI18n()
const recordsStore = useRecordsStore()

const stats = computed(() => recordsStore.statsSummary)
</script>

<template>
  <div class="records-stats-grid">
    <!-- Stat 1: Total Completes -->
    <div class="stat-card">
      <div class="stat-icon-wrap stat-icon-wrap--purple">
        <Icon icon="mdi:checkbox-marked-circle-outline" />
      </div>
      <div class="stat-content">
        <div class="stat-val">
          {{ stats.totalCompletes }}
        </div>
        <div class="stat-label">
          {{ t('records.stats.totalCompletes') }}
        </div>
      </div>
    </div>

    <!-- Stat 2: Total Tricks -->
    <div class="stat-card">
      <div class="stat-icon-wrap stat-icon-wrap--cyan">
        <Icon icon="mdi:routes" />
      </div>
      <div class="stat-content">
        <div class="stat-val">
          {{ stats.totalTricks }}
        </div>
        <div class="stat-label">
          {{ t('records.stats.totalTricks') }}
        </div>
      </div>
    </div>

    <!-- Stat 3: Active Players -->
    <div class="stat-card">
      <div class="stat-icon-wrap stat-icon-wrap--yellow">
        <Icon icon="mdi:account-group-outline" />
      </div>
      <div class="stat-content">
        <div class="stat-val">
          {{ stats.totalPlayers }}
        </div>
        <div class="stat-label">
          {{ t('records.stats.activePlayers') }}
        </div>
      </div>
    </div>

    <!-- Stat 4: Top Points Player -->
    <div v-if="stats.topPointsPlayer" class="stat-card stat-card--highlight">
      <div class="stat-icon-wrap stat-icon-wrap--gold">
        <Icon icon="mdi:trophy-award" />
      </div>
      <div class="stat-content">
        <div class="stat-val stat-val--player">
          {{ stats.topPointsPlayer.username }}
        </div>
        <div class="stat-label">
          {{ t('records.stats.topPlayer') }} ({{ stats.topPointsPlayer.points }} pts)
        </div>
      </div>
    </div>

    <!-- Stat 5: Top WR Holder -->
    <div v-if="stats.topWrPlayer" class="stat-card stat-card--highlight">
      <div class="stat-icon-wrap stat-icon-wrap--accent">
        <Icon icon="mdi:crown-outline" />
      </div>
      <div class="stat-content">
        <div class="stat-val stat-val--player">
          {{ stats.topWrPlayer.username }}
        </div>
        <div class="stat-label">
          {{ t('records.stats.topWrHolder') }} ({{ stats.topWrPlayer.timeWrCount + stats.topWrPlayer.speedWrCount }} WRs)
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.records-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  width: 100%;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: var(--r-md, 8px);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--border-accent-color);
    background-color: var(--bg-tertiary-color);
  }

  &--highlight {
    border-color: rgba(234, 179, 8, 0.3);
    background: linear-gradient(135deg, var(--bg-secondary-color) 0%, rgba(234, 179, 8, 0.05) 100%);
  }
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;

  &--purple {
    background-color: rgba(168, 85, 247, 0.15);
    color: #c084fc;
  }

  &--cyan {
    background-color: rgba(6, 182, 212, 0.15);
    color: #22d3ee;
  }

  &--yellow {
    background-color: rgba(234, 179, 8, 0.15);
    color: #facc15;
  }

  &--gold {
    background-color: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }

  &--accent {
    background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.2));
    color: var(--fg-accent-color);
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--fg-primary-color);
  line-height: 1.2;

  &--player {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--fg-accent-color);
  }
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--fg-secondary-color);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
