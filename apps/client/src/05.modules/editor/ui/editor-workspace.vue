<script setup lang="ts">
import type { TrickItem, TriggerItem } from '~/01.shared/types/models'
import type { SelectOption } from '~/02.kit/molecules/kit-select/ui'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { formatDate, getMediaUrl } from '~/01.shared/lib/helpers'
import { useMapStore } from '~/01.shared/store/map.store'
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitImage } from '~/02.kit/atoms/kit-image/ui'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'
import { KitPageLoader } from '~/02.kit/atoms/kit-page-loader/ui'
import { KitSelect } from '~/02.kit/molecules/kit-select/ui'
import KitDialog from '~/02.kit/organisms/kit-dialog/ui/kit-dialog.vue'
import ImportExportDialog from './import-export-dialog.vue'
import RouteStudio from './route-studio.vue'
import TrickEditorDialog from './trick-editor-dialog.vue'
import TriggerEditorDialog from './trigger-editor-dialog.vue'
import TriggersManager from './triggers-manager.vue'

const { t } = useI18n()
const toast = useToast()
const mapStore = useMapStore()
const tricksStore = useTricksStore()

const currentTab = ref<'tricks' | 'triggers' | 'studio'>('tricks')
const searchQuery = ref('')
const selectedModeFilter = ref<'all' | 'pre' | 'unlimited'>('all')
const sortBy = ref<'index' | 'name' | 'point' | 'trickLength'>('index')

// Dialog states
const isTrickDialogOpen = ref(false)
const editingTrick = ref<TrickItem | null>(null)
const initialRouteForNewTrick = ref<number[]>([])

const isTriggerDialogOpen = ref(false)
const editingTrigger = ref<TriggerItem | null>(null)

const isImportExportDialogOpen = ref(false)

// Stats
const totalTricksCount = computed(() => tricksStore.tricks.length)
const totalTriggersCount = computed(() => tricksStore.triggers.length)
const preStrafeTricksCount = computed(() => tricksStore.tricks.filter(t => t.startType === 1).length)
const unlimitedTricksCount = computed(() => tricksStore.tricks.filter(t => (t.startType ?? 0) === 0).length)
const avgRouteLength = computed(() => {
  if (tricksStore.tricks.length === 0)
    return 0
  const sum = tricksStore.tricks.reduce((acc, t) => acc + (t.triggers?.length || t.trickLength || 0), 0)

  return (sum / tricksStore.tricks.length).toFixed(1)
})
const totalPointsPool = computed(() => {
  return tricksStore.tricks.reduce((acc, t) => acc + (t.point || 0), 0)
})

function getTrickSortValue(trick: TrickItem, sortKey: string): number | string {
  if (sortKey === 'name')
    return trick.name
  if (sortKey === 'point')
    return trick.point || 0
  if (sortKey === 'trickLength')
    return trick.triggers?.length || trick.trickLength || 0

  return trick.index ?? trick.id
}

function compareTricks(a: TrickItem, b: TrickItem, sortKey: string): number {
  const valA = getTrickSortValue(a, sortKey)
  const valB = getTrickSortValue(b, sortKey)

  if (typeof valA === 'string' && typeof valB === 'string')
    return valA.localeCompare(valB)

  if (sortKey === 'point' || sortKey === 'trickLength')
    return Number(valB) - Number(valA)

  return Number(valA) - Number(valB)
}

// Filtered & Sorted Tricks
const displayedTricks = computed(() => {
  let list = [...tricksStore.tricks]

  // Mode filter
  if (selectedModeFilter.value === 'pre') {
    list = list.filter(t => t.startType === 1)
  }
  else if (selectedModeFilter.value === 'unlimited') {
    list = list.filter(t => (t.startType ?? 0) === 0)
  }

  // Search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(t =>
      t.name.toLowerCase().includes(q)
      || String(t.index ?? '').includes(q)
      || (t.authorUsername && t.authorUsername.toLowerCase().includes(q)))
  }

  // Sort
  list.sort((a, b) => compareTricks(a, b, sortBy.value))

  return list
})

const sortOptions = computed<SelectOption[]>(() => [
  { label: t('editor.sort.index'), value: 'index', icon: 'mdi:numeric' },
  { label: t('editor.sort.name'), value: 'name', icon: 'mdi:sort-alphabetical-ascending' },
  { label: t('editor.sort.points'), value: 'point', icon: 'mdi:star' },
  { label: t('editor.sort.length'), value: 'trickLength', icon: 'mdi:routes' },
])

// Delete Confirmation states
const trickToDelete = ref<TrickItem | null>(null)
const triggerToDelete = ref<TriggerItem | null>(null)
const isDeleteTrickModalOpen = ref(false)
const isDeleteTriggerModalOpen = ref(false)
const isDeleting = ref(false)

// Handlers
function openCreateTrick(prefilledRoute?: number[]) {
  editingTrick.value = null
  initialRouteForNewTrick.value = prefilledRoute || []
  isTrickDialogOpen.value = true
}

function openEditTrick(trick: TrickItem) {
  editingTrick.value = trick
  initialRouteForNewTrick.value = []
  isTrickDialogOpen.value = true
}

async function duplicateTrick(trickId: number) {
  try {
    const dup = await tricksStore.duplicateTrick(trickId)
    if (dup) {
      toast.success(t('editor.trick.duplicateSuccess'))
    }
  }
  catch {
    toast.error('Failed to duplicate trick')
  }
}

function requestDeleteTrick(trick: TrickItem) {
  trickToDelete.value = trick
  isDeleteTrickModalOpen.value = true
}

async function executeDeleteTrick() {
  if (!trickToDelete.value)
    return
  isDeleting.value = true
  try {
    await tricksStore.deleteTrick(trickToDelete.value.id)
    toast.success(t('editor.trick.deleteSuccess'))
    isDeleteTrickModalOpen.value = false
    trickToDelete.value = null
  }
  catch {
    toast.error('Failed to delete trick')
  }
  finally {
    isDeleting.value = false
  }
}

function openCreateTrigger() {
  editingTrigger.value = null
  isTriggerDialogOpen.value = true
}

function openEditTrigger(trigger: TriggerItem) {
  editingTrigger.value = trigger
  isTriggerDialogOpen.value = true
}

function requestDeleteTrigger(trigger: TriggerItem) {
  triggerToDelete.value = trigger
  isDeleteTriggerModalOpen.value = true
}

async function executeDeleteTrigger() {
  if (!triggerToDelete.value)
    return
  isDeleting.value = true
  try {
    await tricksStore.deleteTrigger(triggerToDelete.value.id)
    toast.success(t('editor.trigger.deleteSuccess'))
    isDeleteTriggerModalOpen.value = false
    triggerToDelete.value = null
  }
  catch {
    toast.error('Failed to delete trigger')
  }
  finally {
    isDeleting.value = false
  }
}

function handleRouteStudioCreate(routeIds: number[]) {
  openCreateTrick(routeIds)
}
</script>

<template>
  <div class="editor-workspace">
    <!-- Top Stats Banner -->
    <div class="stats-overview-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--purple">
          <Icon icon="mdi:target-variant" />
        </div>
        <div class="stat-details">
          <span class="stat-label">{{ t('editor.stats.totalTricks') }}</span>
          <span class="stat-number">{{ totalTricksCount }}</span>
          <span class="stat-sub">{{ t('editor.stats.totalTricksSub', { pre: preStrafeTricksCount, unl: unlimitedTricksCount }) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <Icon icon="mdi:map-marker-multiple" />
        </div>
        <div class="stat-details">
          <span class="stat-label">{{ t('editor.stats.totalTriggers') }}</span>
          <span class="stat-number">{{ totalTriggersCount }}</span>
          <span class="stat-sub">{{ t('editor.stats.totalTriggersSub') }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--amber">
          <Icon icon="mdi:routes" />
        </div>
        <div class="stat-details">
          <span class="stat-label">{{ t('editor.stats.avgLength') }}</span>
          <span class="stat-number">{{ avgRouteLength }}</span>
          <span class="stat-sub">{{ t('editor.stats.avgLengthSub') }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <Icon icon="mdi:star-four-points" />
        </div>
        <div class="stat-details">
          <span class="stat-label">{{ t('editor.stats.pointsPool') }}</span>
          <span class="stat-number">{{ totalPointsPool }}</span>
          <span class="stat-sub">{{ t('editor.stats.pointsPoolSub') }}</span>
        </div>
      </div>
    </div>

    <!-- Workspace Header & Mode Tabs -->
    <div class="workspace-nav-bar">
      <div class="tabs-group">
        <button
          type="button"
          class="ws-tab-btn"
          :class="{ 'is-active': currentTab === 'tricks' }"
          @click="currentTab = 'tricks'"
        >
          <Icon icon="mdi:script-text-outline" />
          <span>{{ t('editor.tabs.tricks') }} ({{ totalTricksCount }})</span>
        </button>

        <button
          type="button"
          class="ws-tab-btn"
          :class="{ 'is-active': currentTab === 'triggers' }"
          @click="currentTab = 'triggers'"
        >
          <Icon icon="mdi:map-marker-outline" />
          <span>{{ t('editor.tabs.triggers') }} ({{ totalTriggersCount }})</span>
        </button>

        <button
          type="button"
          class="ws-tab-btn"
          :class="{ 'is-active': currentTab === 'studio' }"
          @click="currentTab = 'studio'"
        >
          <Icon icon="mdi:vector-polyline" />
          <span>{{ t('editor.tabs.routeBuilder') }}</span>
        </button>
      </div>

      <div class="quick-header-actions">
        <KitBtn
          variant="tonal"
          prepend-icon="mdi:database-sync-outline"
          @click="isImportExportDialogOpen = true"
        >
          {{ t('editor.tabs.importExport') }}
        </KitBtn>

        <KitBtn
          v-if="currentTab === 'triggers'"
          color="accent"
          prepend-icon="mdi:plus"
          @click="openCreateTrigger"
        >
          {{ t('editor.actions.newTrigger') }}
        </KitBtn>

        <KitBtn
          v-else
          color="accent"
          prepend-icon="mdi:plus"
          @click="openCreateTrick()"
        >
          {{ t('editor.actions.newTrick') }}
        </KitBtn>
      </div>
    </div>

    <!-- TAB 1: TRICKS MANAGEMENT -->
    <div v-if="currentTab === 'tricks'" class="tab-content">
      <!-- Toolbar & Filters -->
      <div class="tricks-manager-toolbar">
        <div class="search-input-wrap">
          <KitInput
            v-model="searchQuery"
            prepend-icon="mdi:magnify"
            :placeholder="t('editor.workspace.searchPlaceholder')"
            clearable
          />
        </div>

        <div class="toolbar-right-controls">
          <div class="mode-filter-pills">
            <button
              type="button"
              class="filter-pill"
              :class="{ 'is-selected': selectedModeFilter === 'all' }"
              @click="selectedModeFilter = 'all'"
            >
              {{ t('editor.actions.filterAll') }}
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ 'is-selected': selectedModeFilter === 'unlimited' }"
              @click="selectedModeFilter = 'unlimited'"
            >
              Unlimited
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ 'is-selected': selectedModeFilter === 'pre' }"
              @click="selectedModeFilter = 'pre'"
            >
              Pre-Strafe
            </button>
          </div>

          <div class="sort-selector-wrap">
            <KitSelect
              v-model="sortBy"
              :options="sortOptions"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <KitPageLoader v-if="tricksStore.isLoading" :text="t('editor.workspace.loading')" />

      <!-- Tricks List -->
      <div v-else-if="displayedTricks.length > 0" class="tricks-cards-list">
        <div
          v-for="(trick, idx) in displayedTricks"
          :key="trick.id"
          class="trick-editor-card"
        >
          <div class="card-main-row">
            <!-- Index & Mode Badge -->
            <div class="card-index-box">
              <span class="trick-idx">#{{ trick.index ?? (idx + 1) }}</span>
              <span v-if="trick.startType === 1" class="badge-pre">Pre</span>
            </div>

            <!-- Trick Title & Author -->
            <div class="card-title-col">
              <div class="trick-name-line">
                <span class="trick-name">{{ trick.name }}</span>
              </div>
              <div class="trick-author-line">
                <Icon icon="mdi:account-outline" />
                <span>{{ trick.authorUsername || trick.authorSteamid64 || 'Mapper' }}</span>
                <span class="dot-sep">•</span>
                <Icon icon="mdi:calendar-outline" />
                <span>{{ formatDate(trick.createdAt) || 'Recently' }}</span>
              </div>
            </div>

            <!-- Points Badge -->
            <div class="card-points-col">
              <span class="badge-points">{{ trick.point }} pts</span>
            </div>

            <!-- Action Buttons -->
            <div class="card-actions-col">
              <KitBtn
                size="sm"
                variant="tonal"
                prepend-icon="mdi:pencil-outline"
                @click="openEditTrick(trick)"
              >
                {{ t('editor.actions.edit') }}
              </KitBtn>

              <KitBtn
                size="sm"
                variant="outlined"
                icon="mdi:content-copy"
                :title="t('editor.actions.duplicate')"
                @click="duplicateTrick(trick.id)"
              />

              <KitBtn
                size="sm"
                variant="text"
                color="error"
                icon="mdi:trash-can-outline"
                :title="t('editor.actions.delete')"
                @click="requestDeleteTrick(trick)"
              />
            </div>
          </div>

          <!-- Route Sequence Visualization Chips -->
          <div v-if="trick.triggers && trick.triggers.length > 0" class="card-route-row">
            <div class="route-chips-chain">
              <template v-for="(trigger, tIdx) in trick.triggers" :key="`${trick.id}-${trigger.id}-${tIdx}`">
                <div class="route-chip">
                  <div class="chip-img">
                    <KitImage
                      v-if="trigger.preview"
                      :src="getMediaUrl(trigger.preview)"
                      :alt="trigger.name"
                      height="100%"
                    />
                    <Icon v-else icon="mdi:map-marker" />
                  </div>
                  <span class="chip-step-num">{{ tIdx + 1 }}.</span>
                  <span class="chip-name">{{ trigger.name }}</span>
                </div>

                <Icon
                  v-if="tIdx < trick.triggers.length - 1"
                  icon="mdi:chevron-right"
                  class="chip-arrow"
                />
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="tricks-empty-card">
        <Icon icon="mdi:script-text-outline" class="empty-icon" />
        <p>{{ t('editor.workspace.noTricksFound') }}</p>
        <KitBtn color="accent" prepend-icon="mdi:plus" @click="openCreateTrick()">
          {{ t('editor.actions.newTrick') }}
        </KitBtn>
      </div>
    </div>

    <!-- TAB 2: TRIGGERS MANAGEMENT -->
    <div v-else-if="currentTab === 'triggers'" class="tab-content">
      <TriggersManager
        :map-id="mapStore.selectedMap?.id || 1"
        @create-trigger="openCreateTrigger"
        @edit-trigger="openEditTrigger"
        @delete-trigger="requestDeleteTrigger"
      />
    </div>

    <!-- TAB 3: ROUTE STUDIO -->
    <div v-else-if="currentTab === 'studio'" class="tab-content">
      <RouteStudio
        :map-id="mapStore.selectedMap?.id || 1"
        @create-trick-with-route="handleRouteStudioCreate"
      />
    </div>

    <!-- TRICK EDITOR MODAL -->
    <TrickEditorDialog
      v-model="isTrickDialogOpen"
      :trick="editingTrick"
      :map-id="mapStore.selectedMap?.id || 1"
      :available-triggers="tricksStore.triggers"
    />

    <!-- TRIGGER EDITOR MODAL -->
    <TriggerEditorDialog
      v-model="isTriggerDialogOpen"
      :trigger="editingTrigger"
      :map-id="mapStore.selectedMap?.id || 1"
    />

    <!-- IMPORT/EXPORT MODAL -->
    <ImportExportDialog
      v-model="isImportExportDialogOpen"
      :map-name="mapStore.selectedMap?.name || 'map'"
    />

    <!-- Trick Delete Confirm Dialog -->
    <KitDialog
      v-model="isDeleteTrickModalOpen"
      :title="t('editor.workspace.deleteTrickTitle')"
      width="420px"
      :z-index="1200"
    >
      <div class="confirm-dialog-content">
        <Icon icon="mdi:alert-circle-outline" class="confirm-icon" />
        <p class="confirm-message">
          {{ t('editor.trick.deleteConfirm', { name: trickToDelete?.name || '' }) }}
        </p>
      </div>
      <template #footer="{ close }">
        <KitBtn color="secondary" @click="close">
          {{ t('editor.actions.cancel') }}
        </KitBtn>
        <KitBtn color="error" :loading="isDeleting" @click="executeDeleteTrick">
          {{ t('editor.actions.delete') }}
        </KitBtn>
      </template>
    </KitDialog>

    <!-- Trigger Delete Confirm Dialog -->
    <KitDialog
      v-model="isDeleteTriggerModalOpen"
      :title="t('editor.workspace.deleteTriggerTitle')"
      width="440px"
      :z-index="1200"
    >
      <div class="confirm-dialog-content">
        <Icon icon="mdi:alert-circle-outline" class="confirm-icon" />
        <div class="confirm-text">
          <p class="confirm-message">
            {{ t('editor.trigger.deleteConfirm', { name: triggerToDelete?.name || '' }) }}
          </p>
          <p v-if="triggerToDelete && tricksStore.getTriggerUsageCount(triggerToDelete.id) > 0" class="confirm-warning">
            {{ t('editor.trigger.deleteWarning', { count: tricksStore.getTriggerUsageCount(triggerToDelete.id) }) }}
          </p>
        </div>
      </div>
      <template #footer="{ close }">
        <KitBtn color="secondary" @click="close">
          {{ t('editor.actions.cancel') }}
        </KitBtn>
        <KitBtn color="error" :loading="isDeleting" @click="executeDeleteTrigger">
          {{ t('editor.actions.delete') }}
        </KitBtn>
      </template>
    </KitDialog>
  </div>
</template>

<style lang="scss" scoped>
.editor-workspace {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @include media-down(md) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-down(xs) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 10px;
  box-shadow: var(--s-s);
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;

  &--purple {
    background-color: rgba(201, 117, 222, 0.15);
    color: var(--fg-accent-color);
    border: 1px solid rgba(201, 117, 222, 0.3);
  }

  &--blue {
    background-color: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }

  &--amber {
    background-color: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  &--green {
    background-color: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--fg-muted-color);
}

.stat-number {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--fg-primary-color);
  line-height: 1.2;
}

.stat-sub {
  font-size: 0.7rem;
  color: var(--fg-secondary-color);
}

.workspace-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border-primary-color);
  padding-bottom: 12px;
  flex-wrap: wrap;
}

.tabs-group {
  display: flex;
  gap: 8px;
}

.ws-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--border-secondary-color);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--fg-secondary-color);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--fg-primary-color);
    background-color: var(--bg-hover-color);
  }

  &.is-active {
    background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.15));
    border-color: var(--fg-accent-color);
    color: var(--fg-accent-color);
    font-weight: 700;
  }
}

.quick-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tricks-manager-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input-wrap {
  flex: 1;
  min-width: 240px;
  max-width: 380px;
}

.toolbar-right-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.mode-filter-pills {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--bg-secondary-color);
  padding: 3px;
  border-radius: 6px;
  border: 1px solid var(--border-primary-color);
  height: 38px;
  box-sizing: border-box;
}

.filter-pill {
  background: none;
  border: none;
  color: var(--fg-secondary-color);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0 12px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: var(--fg-primary-color);
  }

  &.is-selected {
    background-color: var(--fg-accent-color);
    color: var(--fg-inverted-color);
  }
}

.sort-selector-wrap {
  min-width: 200px;
}

.tricks-cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trick-editor-card {
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.card-main-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.card-index-box {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 30px;
}

.trick-idx {
  font-weight: 800;
  font-size: 1rem;
  color: var(--fg-muted-color);
}

.badge-pre {
  font-size: 0.65rem;
  font-weight: 700;
  background-color: rgba(201, 117, 222, 0.15);
  border: 1px solid var(--border-accent-color);
  color: var(--fg-accent-color);
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
}

.card-title-col {
  flex: 2;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trick-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--fg-primary-color);
}

.trick-author-line {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--fg-muted-color);

  .dot-sep {
    color: var(--border-primary-color);
  }
}

.card-points-col {
  min-width: 90px;
  display: flex;
  justify-content: center;
}

.badge-points {
  font-size: 0.85rem;
  font-weight: 700;
  background-color: var(--bg-tertiary-color);
  color: var(--fg-highlight-color, #fbbf24);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-secondary-color);
}

.card-actions-col {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-route-row {
  border-top: 1px dashed var(--border-secondary-color);
  padding-top: 8px;
}

.route-chips-chain {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.route-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--bg-tertiary-color);
  border: 1px solid var(--border-secondary-color);
  padding: 3px 8px 3px 4px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.chip-img {
  width: 20px;
  height: 20px;
  aspect-ratio: 1 / 1;
  border-radius: 3px;
  overflow: hidden;
  background-color: var(--bg-primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--fg-muted-color);
  flex-shrink: 0;
}

.chip-step-num {
  font-weight: 800;
  color: var(--fg-accent-color);
}

.chip-name {
  font-weight: 600;
  color: var(--fg-primary-color);
}

.chip-arrow {
  font-size: 0.9rem;
  color: var(--fg-muted-color);
}

.tricks-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  gap: 12px;
  background-color: var(--bg-secondary-color);
  border: 1px dashed var(--border-primary-color);
  border-radius: 12px;
  color: var(--fg-secondary-color);

  .empty-icon {
    font-size: 3rem;
    color: var(--fg-muted-color);
  }
}
</style>
