<script setup lang="ts">
import type { CreateTrickDto, TrickItem, TriggerItem, UpdateTrickDto } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { getMediaUrl } from '~/01.shared/lib/helpers'
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitImage } from '~/02.kit/atoms/kit-image/ui'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'
import { KitDialog } from '~/02.kit/organisms/kit-dialog/ui'
import RouteBuilder from './route-builder.vue'

interface Props {
  trick?: TrickItem | null
  mapId: number
  availableTriggers: TriggerItem[]
}

const props = withDefaults(defineProps<Props>(), {
  trick: null,
})

const emit = defineEmits<{
  (e: 'saved', trick: TrickItem): void
  (e: 'deleted', trickId: number): void
}>()

const isOpen = defineModel<boolean>({ default: false })
const { t } = useI18n()
const toast = useToast()
const tricksStore = useTricksStore()

const isEdit = computed(() => !!props.trick)

// Form state
const name = ref('')
const point = ref(50)
const startType = ref(0)
const authorUsername = ref('')
const triggerIds = ref<number[]>([])

const isSubmitting = ref(false)
const validationError = ref<string | null>(null)
const isDeleteConfirmOpen = ref(false)
const POINT_PRESETS = [10, 25, 50, 100, 250, 500]

const previewTriggers = computed(() => {
  const triggerMap = new Map(props.availableTriggers.map(t => [t.id, t]))

  return triggerIds.value.map(id => triggerMap.get(id)).filter(Boolean) as TriggerItem[]
})

function initForm() {
  if (props.trick) {
    name.value = props.trick.name || ''
    point.value = props.trick.point ?? 50
    startType.value = props.trick.startType ?? 0
    authorUsername.value = props.trick.authorUsername || ''
    triggerIds.value = (props.trick.triggers || []).map(t => t.id)
  }
  else {
    name.value = ''
    point.value = 50
    startType.value = 0
    authorUsername.value = 'Mapper'
    triggerIds.value = []
  }

  validationError.value = null
}

watch(() => [isOpen.value, props.trick], () => {
  if (isOpen.value) {
    initForm()
  }
}, { immediate: true })

function setPresetPoints(val: number) {
  point.value = val
}

function autoGenerateName() {
  if (triggerIds.value.length === 0)
    return

  const triggerMap = new Map(props.availableTriggers.map(t => [t.id, t]))
  const firstTrigger = triggerMap.get(triggerIds.value[0])?.name || 'Start'
  const lastTrigger = triggerMap.get(triggerIds.value[triggerIds.value.length - 1])?.name || 'End'

  if (triggerIds.value.length === 1) {
    name.value = `${firstTrigger} Zone`
  }
  else {
    name.value = `${firstTrigger} to ${lastTrigger}`
  }
}

async function handleSave() {
  validationError.value = null

  if (!name.value.trim()) {
    validationError.value = 'Please enter a trick name.'

    return
  }

  if (point.value < 1) {
    validationError.value = 'Points must be at least 1.'

    return
  }

  if (triggerIds.value.length === 0) {
    validationError.value = t('editor.trick.routeEmpty')

    return
  }

  isSubmitting.value = true

  try {
    if (isEdit.value && props.trick) {
      const dto: UpdateTrickDto = {
        name: name.value.trim(),
        point: point.value,
        startType: startType.value,
        authorUsername: authorUsername.value.trim() || 'Anonymous',
        triggerIds: triggerIds.value,
      }
      const updated = await tricksStore.updateTrick(props.trick.id, dto)
      toast.success(t('editor.trick.saveSuccess'))
      emit('saved', updated)
    }
    else {
      const dto: CreateTrickDto = {
        name: name.value.trim(),
        point: point.value,
        startType: startType.value,
        mapId: props.mapId,
        authorUsername: authorUsername.value.trim() || 'Anonymous',
        triggerIds: triggerIds.value,
      }
      const created = await tricksStore.createTrick(dto)
      toast.success(t('editor.trick.saveSuccess'))
      emit('saved', created)
    }

    isOpen.value = false
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save trick'
    toast.error(msg)
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleDuplicate() {
  if (!props.trick)
    return
  isSubmitting.value = true
  try {
    const duplicated = await tricksStore.duplicateTrick(props.trick.id)
    if (duplicated) {
      toast.success(t('editor.trick.duplicateSuccess'))
      emit('saved', duplicated)
      isOpen.value = false
    }
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to duplicate trick'
    toast.error(msg)
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!props.trick)
    return
  isSubmitting.value = true
  try {
    await tricksStore.deleteTrick(props.trick.id)
    toast.success(t('editor.trick.deleteSuccess'))
    emit('deleted', props.trick.id)
    isDeleteConfirmOpen.value = false
    isOpen.value = false
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete trick'
    toast.error(msg)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <KitDialog
    v-model="isOpen"
    :title="isEdit ? t('editor.trick.editTitle') : t('editor.trick.createTitle')"
    width="740px"
  >
    <div class="trick-editor-form">
      <!-- Validation Alert -->
      <div v-if="validationError" class="alert-error">
        <Icon icon="mdi:alert-circle" />
        <span>{{ validationError }}</span>
      </div>

      <!-- Main Fields Grid -->
      <div class="form-grid">
        <!-- Trick Name Field with Auto-Name Button -->
        <div class="form-group span-full">
          <div class="label-row">
            <label class="form-label">{{ t('editor.trick.nameLabel') }} <span class="required">*</span></label>
            <button
              type="button"
              class="btn-magic-name"
              :disabled="triggerIds.length === 0"
              :title="t('editor.actions.autoName')"
              @click="autoGenerateName"
            >
              <Icon icon="mdi:wand" />
              <span>{{ t('editor.actions.autoName') }}</span>
            </button>
          </div>
          <KitInput
            v-model="name"
            :placeholder="t('editor.trick.namePlaceholder')"
            clearable
          />
        </div>

        <!-- Points Field with Quick Presets -->
        <div class="form-group span-half">
          <label class="form-label">{{ t('editor.trick.pointsLabel') }} <span class="required">*</span></label>
          <KitInput
            v-model="point"
            type="number"
            min="1"
            max="10000"
            prepend-icon="mdi:star-circle-outline"
          />
          <div class="point-presets">
            <button
              v-for="p in POINT_PRESETS"
              :key="p"
              type="button"
              class="preset-chip"
              :class="{ 'is-selected': point === p }"
              @click="setPresetPoints(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <!-- Start Type (Mode) -->
        <div class="form-group span-half">
          <label class="form-label">{{ t('editor.trick.startTypeLabel') }}</label>
          <div class="segmented-control">
            <button
              type="button"
              class="segment-item"
              :class="{ 'is-active': startType === 0 }"
              @click="startType = 0"
            >
              <Icon icon="mdi:speedometer" />
              <span class="segment-title">Unlimited</span>
            </button>

            <button
              type="button"
              class="segment-item"
              :class="{ 'is-active': startType === 1 }"
              @click="startType = 1"
            >
              <Icon icon="mdi:target-variant" />
              <span class="segment-title">Pre-Strafe (≤405)</span>
            </button>
          </div>
        </div>

        <!-- Author Username -->
        <div class="form-group span-full">
          <label class="form-label">{{ t('editor.trick.authorLabel') }}</label>
          <KitInput
            v-model="authorUsername"
            prepend-icon="mdi:account-outline"
            :placeholder="t('editor.trick.authorPlaceholder')"
            clearable
          />
        </div>
      </div>

      <!-- Route Builder Section -->
      <div class="route-section">
        <div class="section-divider">
          <span class="divider-title">
            <Icon icon="mdi:map-marker-path" />
            {{ t('editor.trick.routeSection') }}
          </span>
        </div>

        <RouteBuilder
          v-model="triggerIds"
          :available-triggers="availableTriggers"
        />
      </div>

      <!-- Live Summary Preview -->
      <div class="live-preview-box">
        <div class="preview-header">
          <Icon icon="mdi:eye-outline" />
          <span>{{ t('editor.trick.preview') }}</span>
        </div>
        <div class="preview-card">
          <div class="preview-title-row">
            <span class="preview-name">{{ name || 'Untitled Trick' }}</span>
            <span v-if="startType === 1" class="badge-pre">Pre-Strafe</span>
            <span class="badge-pts">{{ point }} pts</span>
          </div>
          <div class="preview-meta">
            <span>By: {{ authorUsername || 'Anonymous' }}</span>
            <span>Length: {{ triggerIds.length }}</span>
          </div>

          <!-- Visual Route Sequence in Preview -->
          <div v-if="previewTriggers.length > 0" class="preview-route-chain">
            <template v-for="(trig, pIdx) in previewTriggers" :key="`prev-${trig.id}-${pIdx}`">
              <div class="preview-route-chip">
                <div class="preview-chip-thumb">
                  <KitImage
                    v-if="trig.preview"
                    :src="getMediaUrl(trig.preview)"
                    :alt="trig.name"
                    height="100%"
                  />
                  <Icon v-else icon="mdi:map-marker" />
                </div>
                <span class="preview-chip-num">{{ pIdx + 1 }}.</span>
                <span class="preview-chip-name">{{ trig.name }}</span>
              </div>
              <Icon
                v-if="pIdx < previewTriggers.length - 1"
                icon="mdi:chevron-right"
                class="preview-route-arrow"
              />
            </template>
          </div>
          <div v-else class="preview-route-empty">
            <span>{{ t('editor.trick.routeEmpty') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Footer Actions -->
    <template #footer="{ close }">
      <div class="modal-footer-actions">
        <div class="left-actions">
          <KitBtn
            v-if="isEdit"
            variant="text"
            color="error"
            prepend-icon="mdi:delete-outline"
            :disabled="isSubmitting"
            @click="isDeleteConfirmOpen = true"
          >
            {{ t('editor.actions.delete') }}
          </KitBtn>
        </div>

        <div class="right-actions">
          <KitBtn
            v-if="isEdit"
            variant="outlined"
            prepend-icon="mdi:content-copy"
            :disabled="isSubmitting"
            @click="handleDuplicate"
          >
            {{ t('editor.actions.duplicate') }}
          </KitBtn>

          <KitBtn
            color="secondary"
            :disabled="isSubmitting"
            @click="close"
          >
            {{ t('editor.actions.cancel') }}
          </KitBtn>

          <KitBtn
            color="accent"
            :loading="isSubmitting"
            prepend-icon="mdi:check"
            @click="handleSave"
          >
            {{ isEdit ? t('editor.actions.save') : t('editor.actions.create') }}
          </KitBtn>
        </div>
      </div>
    </template>
  </KitDialog>

  <!-- Delete Confirmation Sub-Dialog -->
  <KitDialog
    v-model="isDeleteConfirmOpen"
    title="Delete Trick"
    width="420px"
    :z-index="1200"
  >
    <div class="confirm-dialog-content">
      <Icon icon="mdi:alert-circle-outline" class="confirm-icon" />
      <p class="confirm-message">
        {{ t('editor.trick.deleteConfirm', { name: props.trick?.name || name || 'this trick' }) }}
      </p>
    </div>
    <template #footer="{ close }">
      <KitBtn color="secondary" @click="close">
        {{ t('editor.actions.cancel') }}
      </KitBtn>
      <KitBtn color="error" :loading="isSubmitting" @click="confirmDelete">
        {{ t('editor.actions.delete') }}
      </KitBtn>
    </template>
  </KitDialog>
</template>

<style lang="scss" scoped>
.trick-editor-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid var(--fg-error-color, #ef4444);
  color: var(--fg-error-color, #ef4444);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.span-full {
  grid-column: span 2;
}

.span-half {
  grid-column: span 1;

  @include media-down(sm) {
    grid-column: span 2;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--fg-secondary-color);

  .required {
    color: var(--fg-accent-color);
  }
}

.btn-magic-name {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--fg-accent-color);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.15));
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.point-presets {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.preset-chip {
  background-color: var(--bg-tertiary-color);
  border: 1px solid var(--border-secondary-color);
  color: var(--fg-secondary-color);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    color: var(--fg-primary-color);
  }

  &.is-selected {
    background-color: var(--fg-accent-color);
    border-color: var(--fg-accent-color);
    color: var(--fg-inverted-color);
  }
}

.segmented-control {
  display: flex;
  gap: 6px;
  width: 100%;
}

.segment-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  box-sizing: border-box;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 6px;
  cursor: pointer;
  color: var(--fg-secondary-color);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    background-color: var(--bg-tertiary-color);
    color: var(--fg-primary-color);
  }

  &.is-active {
    background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.15));
    border-color: var(--fg-accent-color);
    color: var(--fg-accent-color);
    font-weight: 700;
  }

  .segment-title {
    font-size: 0.85rem;
    line-height: 1;
  }
}

.route-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--border-primary-color);
  padding-bottom: 6px;
}

.divider-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--fg-primary-color);
}

.live-preview-box {
  background-color: var(--bg-primary-color);
  border: 1px dashed var(--border-primary-color);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--fg-muted-color);
}

.preview-card {
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--fg-accent-color);
}

.badge-pre {
  font-size: 0.65rem;
  font-weight: 700;
  background-color: rgba(201, 117, 222, 0.2);
  color: var(--fg-accent-color);
  border: 1px solid var(--border-accent-color);
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge-pts {
  font-size: 0.75rem;
  font-weight: 700;
  background-color: var(--bg-tertiary-color);
  color: var(--fg-highlight-color, #fbbf24);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--fg-muted-color);
}

.preview-route-chain {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 6px;
  border-top: 1px dashed var(--border-secondary-color);
}

.preview-route-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: var(--bg-tertiary-color);
  border: 1px solid var(--border-secondary-color);
  padding: 2px 6px 2px 3px;
  border-radius: 4px;
  font-size: 0.72rem;
}

.preview-chip-thumb {
  width: 18px;
  height: 18px;
  aspect-ratio: 1 / 1;
  border-radius: 3px;
  overflow: hidden;
  background-color: var(--bg-primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--fg-muted-color);
  flex-shrink: 0;
}

.preview-chip-num {
  font-weight: 800;
  color: var(--fg-accent-color);
}

.preview-chip-name {
  font-weight: 600;
  color: var(--fg-primary-color);
}

.preview-route-arrow {
  font-size: 0.8rem;
  color: var(--fg-muted-color);
}

.preview-route-empty {
  font-size: 0.72rem;
  color: var(--fg-muted-color);
  font-style: italic;
  padding-top: 4px;
  border-top: 1px dashed var(--border-secondary-color);
}

.modal-footer-actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.right-actions,
.left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-dialog-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.confirm-icon {
  font-size: 2.2rem;
  color: var(--fg-error-color, #ef4444);
  flex-shrink: 0;
}

.confirm-message {
  font-size: 0.9rem;
  color: var(--fg-primary-color);
  line-height: 1.4;
}
</style>
