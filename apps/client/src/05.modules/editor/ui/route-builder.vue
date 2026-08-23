<script setup lang="ts">
import type { TriggerItem } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { getMediaUrl } from '~/01.shared/lib/helpers'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitImage } from '~/02.kit/atoms/kit-image/ui'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'

interface Props {
  modelValue: number[]
  availableTriggers: TriggerItem[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const { t } = useI18n()
const triggerSearch = ref('')

const routeTriggers = computed(() => {
  const triggerMap = new Map(props.availableTriggers.map(t => [t.id, t]))

  return props.modelValue.map((id, index) => {
    const found = triggerMap.get(id)

    return {
      stepIndex: index + 1,
      triggerId: id,
      trigger: found || {
        id,
        name: `Unknown #${id}`,
        fullName: null,
        preview: null,
        coords: [],
      },
    }
  })
})

const filteredAvailableTriggers = computed(() => {
  if (!triggerSearch.value.trim())
    return props.availableTriggers

  const q = triggerSearch.value.toLowerCase().trim()

  return props.availableTriggers.filter(trig =>
    trig.name.toLowerCase().includes(q)
    || (trig.fullName && trig.fullName.toLowerCase().includes(q)))
})

function addTrigger(triggerId: number) {
  const updated = [...props.modelValue, triggerId]
  emit('update:modelValue', updated)
}

function removeStep(index: number) {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}

function moveStepUp(index: number) {
  if (index <= 0)
    return
  const updated = [...props.modelValue]
  const temp = updated[index]
  updated[index] = updated[index - 1]
  updated[index - 1] = temp
  emit('update:modelValue', updated)
}

function moveStepDown(index: number) {
  if (index >= props.modelValue.length - 1)
    return
  const updated = [...props.modelValue]
  const temp = updated[index]
  updated[index] = updated[index + 1]
  updated[index + 1] = temp
  emit('update:modelValue', updated)
}

function duplicateStep(index: number) {
  const updated = [...props.modelValue]
  updated.splice(index + 1, 0, updated[index])
  emit('update:modelValue', updated)
}

function reverseRoute() {
  const updated = [...props.modelValue].reverse()
  emit('update:modelValue', updated)
}

function clearRoute() {
  emit('update:modelValue', [])
}
</script>

<template>
  <div class="route-builder">
    <!-- Builder Header & Quick Stats -->
    <div class="builder-header">
      <div class="header-left">
        <div class="route-badge-count">
          <Icon icon="mdi:routes" />
          <span>{{ t('editor.builder.triggersCount', { count: modelValue.length }, modelValue.length) }}</span>
        </div>
      </div>

      <div class="header-actions">
        <KitBtn
          v-if="modelValue.length > 1"
          size="xs"
          variant="tonal"
          prepend-icon="mdi:swap-horizontal"
          :title="t('editor.actions.reverseRoute')"
          @click="reverseRoute"
        >
          {{ t('editor.actions.reverseRoute') }}
        </KitBtn>

        <KitBtn
          v-if="modelValue.length > 0"
          size="xs"
          variant="text"
          color="error"
          prepend-icon="mdi:trash-can-outline"
          :title="t('editor.actions.clearRoute')"
          @click="clearRoute"
        >
          {{ t('editor.actions.clearRoute') }}
        </KitBtn>
      </div>
    </div>

    <!-- Sequence Steps List -->
    <div v-if="routeTriggers.length > 0" class="steps-timeline">
      <div
        v-for="(item, idx) in routeTriggers"
        :key="`${item.triggerId}-${idx}`"
        class="timeline-item"
      >
        <div class="step-card">
          <!-- Step Role Badge -->
          <div
            class="step-badge"
            :class="{
              'is-start': idx === 0,
              'is-finish': idx === routeTriggers.length - 1 && routeTriggers.length > 1,
            }"
          >
            <span class="step-num">{{ idx + 1 }}</span>
          </div>

          <!-- Trigger Preview Thumbnail -->
          <div class="step-preview">
            <KitImage
              v-if="item.trigger.preview"
              :src="getMediaUrl(item.trigger.preview)"
              :alt="item.trigger.name"
              height="100%"
            />
            <div v-else class="step-preview-placeholder">
              <Icon icon="mdi:map-marker-outline" />
            </div>
          </div>

          <!-- Trigger Details -->
          <div class="step-info">
            <div class="step-name">
              {{ item.trigger.name }}
            </div>
            <div v-if="item.trigger.fullName" class="step-fullname">
              {{ item.trigger.fullName }}
            </div>
            <div v-if="item.trigger.coords && item.trigger.coords.length > 0" class="step-coords">
              [ {{ item.trigger.coords.map(c => Math.round(c)).join(', ') }} ]
            </div>
          </div>

          <!-- Step Reordering & Actions -->
          <div class="step-controls">
            <button
              type="button"
              class="ctrl-btn"
              :disabled="idx === 0"
              title="Move Up"
              @click="moveStepUp(idx)"
            >
              <Icon icon="mdi:arrow-up" />
            </button>
            <button
              type="button"
              class="ctrl-btn"
              :disabled="idx === routeTriggers.length - 1"
              title="Move Down"
              @click="moveStepDown(idx)"
            >
              <Icon icon="mdi:arrow-down" />
            </button>
            <button
              type="button"
              class="ctrl-btn"
              title="Duplicate Step"
              @click="duplicateStep(idx)"
            >
              <Icon icon="mdi:content-copy" />
            </button>
            <button
              type="button"
              class="ctrl-btn ctrl-btn--danger"
              title="Remove Step"
              @click="removeStep(idx)"
            >
              <Icon icon="mdi:close" />
            </button>
          </div>
        </div>

        <!-- Connector Arrow -->
        <div v-if="idx < routeTriggers.length - 1" class="timeline-connector">
          <Icon icon="mdi:arrow-down" class="connector-icon" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="route-empty-state">
      <Icon icon="mdi:map-marker-path" class="empty-icon" />
      <p class="empty-text">
        {{ t('editor.trick.routeEmpty') }}
      </p>
    </div>

    <!-- Add Checkpoint Section -->
    <div class="add-trigger-section">
      <div class="add-section-bar">
        <span class="add-section-title">
          <Icon icon="mdi:plus-circle-outline" />
          {{ t('editor.actions.addStep') }}
        </span>
      </div>

      <!-- Quick Palette Filter -->
      <div class="palette-filter">
        <KitInput
          v-model="triggerSearch"
          size="sm"
          prepend-icon="mdi:magnify"
          :placeholder="t('editor.builder.filterPlaceholder')"
          clearable
        />
      </div>

      <!-- Quick Palette Grid -->
      <div class="palette-grid">
        <button
          v-for="trigger in filteredAvailableTriggers"
          :key="trigger.id"
          type="button"
          class="palette-item"
          @click="addTrigger(trigger.id)"
        >
          <div class="palette-preview">
            <KitImage
              v-if="trigger.preview"
              :src="getMediaUrl(trigger.preview)"
              :alt="trigger.name"
              height="100%"
            />
            <Icon v-else icon="mdi:map-marker" class="palette-placeholder-icon" />
          </div>
          <div class="palette-info">
            <span class="palette-name">{{ trigger.name }}</span>
            <span v-if="trigger.fullName" class="palette-desc">{{ trigger.fullName }}</span>
          </div>
          <Icon icon="mdi:plus" class="palette-add-icon" />
        </button>
      </div>

      <div v-if="filteredAvailableTriggers.length === 0" class="palette-empty">
        <p>{{ t('editor.builder.noTriggersFound') }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.route-builder {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-secondary-color);
}

.route-badge-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--fg-accent-color);
  background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.15));
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-accent-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 4px;
}

.step-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: var(--bg-tertiary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;
  flex-shrink: 0;

  .step-num {
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--fg-primary-color);
    line-height: 1;
  }

  &.is-start {
    border-color: var(--fg-success-color, #10b981);
    background-color: rgba(16, 185, 129, 0.12);

    .step-num {
      color: var(--fg-success-color, #10b981);
    }
  }

  &.is-finish {
    border-color: var(--fg-accent-color);
    background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.15));

    .step-num {
      color: var(--fg-accent-color);
    }
  }
}

.step-preview {
  width: 44px;
  height: 44px;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-secondary-color);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-preview-placeholder {
  color: var(--fg-muted-color);
  font-size: 1.25rem;
}

.step-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--fg-primary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-fullname {
  font-size: 0.75rem;
  color: var(--fg-secondary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-coords {
  font-size: 0.7rem;
  color: var(--fg-muted-color);
  font-family: monospace;
}

.step-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ctrl-btn {
  background: none;
  border: 1px solid var(--border-secondary-color);
  color: var(--fg-secondary-color);
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    color: var(--fg-accent-color);
    border-color: var(--fg-accent-color);
    background-color: var(--bg-hover-color);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &--danger:hover:not(:disabled) {
    color: var(--fg-error-color, #ef4444);
    border-color: var(--fg-error-color, #ef4444);
    background-color: rgba(239, 68, 68, 0.1);
  }
}

.timeline-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  color: var(--fg-accent-color);
  opacity: 0.7;

  .connector-icon {
    font-size: 1rem;
    animation: pulse-arrow 2s infinite ease-in-out;
  }
}

@keyframes pulse-arrow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

.route-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background-color: var(--bg-primary-color);
  border: 2px dashed var(--border-primary-color);
  border-radius: 8px;
  text-align: center;
  gap: 8px;

  .empty-icon {
    font-size: 2.5rem;
    color: var(--fg-muted-color);
  }

  .empty-text {
    font-size: 0.85rem;
    color: var(--fg-secondary-color);
    max-width: 320px;
  }
}

.add-trigger-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 8px;
}

.add-section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--fg-primary-color);
}

.palette-filter {
  width: 100%;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    background-color: var(--bg-tertiary-color);

    .palette-add-icon {
      color: var(--fg-accent-color);
    }
  }
}

.palette-preview {
  width: 32px;
  height: 32px;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--bg-secondary-color);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.palette-placeholder-icon {
  font-size: 1rem;
  color: var(--fg-muted-color);
}

.palette-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.palette-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--fg-primary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette-desc {
  font-size: 0.65rem;
  color: var(--fg-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette-add-icon {
  font-size: 1.1rem;
  color: var(--fg-muted-color);
  transition: all 0.15s ease;
}

.palette-empty {
  text-align: center;
  padding: 16px;
  color: var(--fg-muted-color);
  font-size: 0.8rem;
}
</style>
