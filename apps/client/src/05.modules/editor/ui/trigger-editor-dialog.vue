<script setup lang="ts">
import type { CreateTriggerDto, TriggerItem, UpdateTriggerDto } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { getMediaUrl } from '~/01.shared/lib/helpers'
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitImage } from '~/02.kit/atoms/kit-image/ui'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'
import { KitDialog } from '~/02.kit/organisms/kit-dialog/ui'

interface Props {
  trigger?: TriggerItem | null
  mapId: number
}

const props = withDefaults(defineProps<Props>(), {
  trigger: null,
})

const emit = defineEmits<{
  (e: 'saved', trigger: TriggerItem): void
  (e: 'deleted', triggerId: number): void
}>()

const isOpen = defineModel<boolean>({ default: false })
const { t } = useI18n()
const toast = useToast()
const tricksStore = useTricksStore()

const isEdit = computed(() => !!props.trigger)

// Form state
const name = ref('')
const fullName = ref('')
const preview = ref('')
const coordX = ref<number | null>(null)
const coordY = ref<number | null>(null)
const coordZ = ref<number | null>(null)
const consolePasteInput = ref('')

const isSubmitting = ref(false)
const validationError = ref<string | null>(null)
const isDeleteConfirmOpen = ref(false)

const fileInputRef = ref<HTMLInputElement | null>(null)

// Affected tricks
const usageCount = computed(() => {
  if (!props.trigger)
    return 0

  return tricksStore.getTriggerUsageCount(props.trigger.id)
})

const affectedTrickNames = computed(() => {
  if (!props.trigger)
    return []

  return tricksStore.tricks
    .filter(trick => trick.triggers?.some(trig => trig.id === props.trigger?.id))
    .map(trick => trick.name)
})

function initForm() {
  if (props.trigger) {
    name.value = props.trigger.name || ''
    fullName.value = props.trigger.fullName || ''
    preview.value = props.trigger.preview || ''
    if (props.trigger.coords && props.trigger.coords.length >= 3) {
      coordX.value = props.trigger.coords[0] ?? null
      coordY.value = props.trigger.coords[1] ?? null
      coordZ.value = props.trigger.coords[2] ?? null
    }
    else {
      coordX.value = null
      coordY.value = null
      coordZ.value = null
    }
  }
  else {
    name.value = ''
    fullName.value = ''
    preview.value = ''
    coordX.value = null
    coordY.value = null
    coordZ.value = null
  }

  consolePasteInput.value = ''
  validationError.value = null
}

watch(() => [isOpen.value, props.trigger], () => {
  if (isOpen.value) {
    initForm()
  }
}, { immediate: true })

// Parse CS2 console setpos or coords string
function parseConsoleCoords() {
  const raw = consolePasteInput.value.trim()
  if (!raw)
    return

  // Matches setpos X Y Z or just three floats/ints separated by space or comma
  const numbers = raw.match(/[-+]?\d+(?:\.\d+)?/g)
  if (numbers && numbers.length >= 3) {
    coordX.value = Number.parseFloat(numbers[0])
    coordY.value = Number.parseFloat(numbers[1])
    coordZ.value = Number.parseFloat(numbers[2])
    toast.info(`Coordinates parsed: [${coordX.value}, ${coordY.value}, ${coordZ.value}]`)
    consolePasteInput.value = ''
  }
  else {
    toast.error('Could not find 3 coordinate values in pasted text.')
  }
}

function clearCoords() {
  coordX.value = null
  coordY.value = null
  coordZ.value = null
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        preview.value = e.target.result as string
        toast.info('Image uploaded')
      }
    }

    reader.readAsDataURL(file)
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function buildCoordsArray(): number[] {
  if (coordX.value !== null && coordY.value !== null && coordZ.value !== null) {
    return [coordX.value, coordY.value, coordZ.value]
  }

  return []
}

async function saveExistingTrigger(triggerId: number) {
  const dto: UpdateTriggerDto = {
    name: name.value.trim(),
    fullName: fullName.value.trim() || null,
    preview: preview.value.trim() || null,
    coords: buildCoordsArray(),
    mapId: props.mapId,
  }
  const updated = await tricksStore.updateTrigger(triggerId, dto)
  toast.success(t('editor.trigger.saveSuccess'))
  emit('saved', updated)
}

async function createNewTrigger() {
  const dto: CreateTriggerDto = {
    name: name.value.trim(),
    fullName: fullName.value.trim() || null,
    preview: preview.value.trim() || null,
    coords: buildCoordsArray(),
    mapId: props.mapId,
  }
  const created = await tricksStore.createTrigger(dto)
  toast.success(t('editor.trigger.saveSuccess'))
  emit('saved', created)
}

async function handleSave() {
  validationError.value = null

  if (!name.value.trim()) {
    validationError.value = 'Please enter a trigger name or zone identifier.'

    return
  }

  isSubmitting.value = true

  try {
    if (isEdit.value && props.trigger)
      await saveExistingTrigger(props.trigger.id)
    else
      await createNewTrigger()

    isOpen.value = false
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save trigger'
    toast.error(msg)
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!props.trigger)
    return
  isSubmitting.value = true
  try {
    await tricksStore.deleteTrigger(props.trigger.id)
    toast.success(t('editor.trigger.deleteSuccess'))
    emit('deleted', props.trigger.id)
    isDeleteConfirmOpen.value = false
    isOpen.value = false
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete trigger'
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
    :title="isEdit ? t('editor.trigger.editTitle') : t('editor.trigger.createTitle')"
    width="680px"
  >
    <div class="trigger-editor-form">
      <!-- Validation Alert -->
      <div v-if="validationError" class="alert-error">
        <Icon icon="mdi:alert-circle" />
        <span>{{ validationError }}</span>
      </div>

      <div class="form-grid">
        <!-- Short Identifier / Name -->
        <div class="form-group span-half">
          <label class="form-label">{{ t('editor.trigger.nameLabel') }} <span class="required">*</span></label>
          <KitInput
            v-model="name"
            :placeholder="t('editor.trigger.namePlaceholder')"
            prepend-icon="mdi:tag-outline"
            clearable
          />
        </div>

        <!-- Full Name / Description -->
        <div class="form-group span-half">
          <label class="form-label">{{ t('editor.trigger.fullNameLabel') }}</label>
          <KitInput
            v-model="fullName"
            :placeholder="t('editor.trigger.fullNamePlaceholder')"
            prepend-icon="mdi:format-title"
            clearable
          />
        </div>

        <!-- Preview Image Section -->
        <div class="form-group span-full">
          <label class="form-label">{{ t('editor.trigger.previewLabel') }}</label>
          <div class="image-input-group">
            <KitInput
              v-model="preview"
              :placeholder="t('editor.trigger.previewPlaceholder')"
              prepend-icon="mdi:image-outline"
              clearable
            />
            <KitBtn
              size="md"
              variant="tonal"
              prepend-icon="mdi:upload"
              @click="triggerFileInput"
            >
              {{ t('editor.trigger.uploadImage') }}
            </KitBtn>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileUpload"
            >
          </div>

          <!-- Image Live Thumbnail -->
          <div v-if="preview" class="image-preview-card">
            <div class="preview-img-container">
              <KitImage :src="getMediaUrl(preview)" :alt="name" height="100%" />
            </div>
            <button
              type="button"
              class="btn-remove-preview"
              title="Remove image"
              @click="preview = ''"
            >
              <Icon icon="mdi:close" />
            </button>
          </div>
        </div>

        <!-- Coordinates Section -->
        <div class="form-group span-full">
          <div class="coords-header">
            <label class="form-label">{{ t('editor.trigger.coordsLabel') }}</label>
            <button
              v-if="coordX !== null || coordY !== null || coordZ !== null"
              type="button"
              class="btn-clear-coords"
              @click="clearCoords"
            >
              Clear Coords
            </button>
          </div>

          <div class="coords-row">
            <div class="coord-field">
              <span class="coord-axis">X</span>
              <KitInput
                v-model="coordX"
                type="number"
                step="any"
                placeholder="0.0"
              />
            </div>
            <div class="coord-field">
              <span class="coord-axis">Y</span>
              <KitInput
                v-model="coordY"
                type="number"
                step="any"
                placeholder="0.0"
              />
            </div>
            <div class="coord-field">
              <span class="coord-axis">Z</span>
              <KitInput
                v-model="coordZ"
                type="number"
                step="any"
                placeholder="0.0"
              />
            </div>
          </div>

          <!-- Console Paste Helper -->
          <div class="console-paste-box">
            <span class="paste-hint">{{ t('editor.trigger.pasteConsoleHint') }}</span>
            <div class="paste-input-row">
              <KitInput
                v-model="consolePasteInput"
                size="sm"
                :placeholder="t('editor.trigger.pasteConsolePlaceholder')"
                @keyup.enter="parseConsoleCoords"
              />
              <KitBtn size="sm" variant="tonal" @click="parseConsoleCoords">
                Parse
              </KitBtn>
            </div>
          </div>
        </div>

        <!-- Usage in Tricks summary -->
        <div v-if="isEdit" class="form-group span-full">
          <div class="usage-box">
            <div class="usage-header">
              <Icon icon="mdi:routes" />
              <span>{{ t('editor.trigger.usedInTricks') }} <strong>{{ usageCount }}</strong></span>
            </div>
            <div v-if="affectedTrickNames.length > 0" class="usage-pills">
              <span v-for="tName in affectedTrickNames" :key="tName" class="usage-pill">
                {{ tName }}
              </span>
            </div>
            <div v-else class="usage-empty">
              {{ t('editor.trigger.notUsed') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
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
    title="Delete Trigger"
    width="440px"
    :z-index="1200"
  >
    <div class="confirm-dialog-content">
      <Icon icon="mdi:alert-circle-outline" class="confirm-icon" />
      <div class="confirm-text">
        <p class="confirm-message">
          {{ t('editor.trigger.deleteConfirm', { name: props.trigger?.name || name || 'this trigger' }) }}
        </p>
        <p v-if="usageCount > 0" class="confirm-warning">
          {{ t('editor.trigger.deleteWarning', { count: usageCount }) }}
        </p>
      </div>
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
.trigger-editor-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.image-input-group {
  display: flex;
  gap: 8px;
}

.image-preview-card {
  position: relative;
  width: 180px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-primary-color);
  background-color: var(--bg-tertiary-color);
}

.preview-img-container {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.btn-remove-preview {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--fg-error-color, #ef4444);
  }
}

.coords-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-clear-coords {
  background: none;
  border: none;
  color: var(--fg-muted-color);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: var(--fg-error-color, #ef4444);
  }
}

.coords-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.coord-field {
  position: relative;
  display: flex;
  align-items: center;
}

.coord-axis {
  position: absolute;
  left: 10px;
  z-index: 2;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--fg-accent-color);
  pointer-events: none;
}

:deep(.coord-field .kit-input) {
  padding-left: 26px;
}

.console-paste-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: var(--bg-primary-color);
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-secondary-color);
  margin-top: 4px;
}

.paste-hint {
  font-size: 0.7rem;
  color: var(--fg-muted-color);
  font-family: monospace;
}

.paste-input-row {
  display: flex;
  gap: 6px;
}

.usage-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 8px;
  padding: 10px;
}

.usage-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--fg-secondary-color);
}

.usage-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.usage-pill {
  font-size: 0.75rem;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--fg-primary-color);
}

.usage-empty {
  font-size: 0.75rem;
  color: var(--fg-muted-color);
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
  align-items: flex-start;
  gap: 12px;
  padding: 16px 0;
}

.confirm-icon {
  font-size: 2.2rem;
  color: var(--fg-error-color, #ef4444);
  flex-shrink: 0;
}

.confirm-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.confirm-message {
  font-size: 0.95rem;
  color: var(--fg-primary-color);
  font-weight: 500;
}

.confirm-warning {
  font-size: 0.85rem;
  color: var(--fg-error-color, #ef4444);
  line-height: 1.4;
}
</style>
