<script setup lang="ts">
import type { TriggerItem } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { getMediaUrl } from '~/01.shared/lib/helpers'
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitImage } from '~/02.kit/atoms/kit-image/ui'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'
import { KitImagePreview } from '~/02.kit/molecules/kit-image-preview/ui'

interface Props {
  mapId: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'createTrigger'): void
  (e: 'editTrigger', trigger: TriggerItem): void
  (e: 'deleteTrigger', trigger: TriggerItem): void
}>()

const { t } = useI18n()
const toast = useToast()
const tricksStore = useTricksStore()

const searchQuery = ref('')
const selectedPreviewImage = ref<string | null>(null)
const isImagePreviewOpen = ref(false)

const filteredTriggers = computed(() => {
  if (!searchQuery.value.trim())
    return tricksStore.triggers

  const q = searchQuery.value.toLowerCase().trim()

  return tricksStore.triggers.filter(t =>
    t.name.toLowerCase().includes(q)
    || (t.fullName && t.fullName.toLowerCase().includes(q)))
})

function openImagePreview(previewUrl?: string | null) {
  if (previewUrl) {
    selectedPreviewImage.value = getMediaUrl(previewUrl)
    isImagePreviewOpen.value = true
  }
}

function copyCoords(coords?: number[]) {
  if (!coords || coords.length === 0)
    return
  const text = `setpos ${coords.join(' ')}`
  navigator.clipboard.writeText(text)
  toast.info(t('editor.trigger.coordsCopied'))
}
</script>

<template>
  <div class="triggers-manager">
    <!-- Toolbar -->
    <div class="manager-toolbar">
      <div class="search-box">
        <KitInput
          v-model="searchQuery"
          prepend-icon="mdi:magnify"
          :placeholder="t('editor.trigger.searchPlaceholder')"
          clearable
        />
      </div>
    </div>

    <!-- Triggers Grid -->
    <div v-if="filteredTriggers.length > 0" class="triggers-grid">
      <div
        v-for="trigger in filteredTriggers"
        :key="trigger.id"
        class="trigger-item-card"
      >
        <!-- Thumbnail Preview -->
        <div class="card-preview" @click="openImagePreview(trigger.preview)">
          <KitImage
            v-if="trigger.preview"
            :src="getMediaUrl(trigger.preview)"
            :alt="trigger.name"
            height="100%"
          />
          <div v-else class="preview-fallback">
            <Icon icon="mdi:map-marker-outline" />
          </div>

          <div v-if="trigger.preview" class="preview-zoom-hint">
            <Icon icon="mdi:magnify-plus-outline" />
          </div>
        </div>

        <!-- Info Body -->
        <div class="card-body">
          <div class="card-title-row">
            <h4 class="trigger-name">
              {{ trigger.name }}
            </h4>
            <span
              class="usage-badge"
              :class="{ 'is-used': tricksStore.getTriggerUsageCount(trigger.id) > 0 }"
              :title="t('editor.trigger.usedInCount', { count: tricksStore.getTriggerUsageCount(trigger.id) })"
            >
              <Icon icon="mdi:routes" />
              {{ tricksStore.getTriggerUsageCount(trigger.id) }}
            </span>
          </div>

          <p v-if="trigger.fullName" class="trigger-fullname">
            {{ trigger.fullName }}
          </p>

          <!-- Coordinates Pill -->
          <div
            v-if="trigger.coords && trigger.coords.length > 0"
            class="coords-pill"
            :title="t('editor.trigger.copyCoordsHint')"
            @click="copyCoords(trigger.coords)"
          >
            <Icon icon="mdi:crosshairs-gps" />
            <span>{{ trigger.coords.map(c => Math.round(c)).join(', ') }}</span>
            <Icon icon="mdi:content-copy" class="copy-icon" />
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="card-footer">
          <KitBtn
            size="xs"
            variant="text"
            prepend-icon="mdi:pencil-outline"
            @click="emit('editTrigger', trigger)"
          >
            {{ t('editor.actions.edit') }}
          </KitBtn>

          <KitBtn
            size="xs"
            variant="text"
            color="error"
            icon="mdi:trash-can-outline"
            @click="emit('deleteTrigger', trigger)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="triggers-empty">
      <Icon icon="mdi:map-marker-off-outline" class="empty-icon" />
      <p>{{ t('editor.trigger.noTriggers') }}</p>
      <KitBtn
        color="accent"
        prepend-icon="mdi:plus"
        @click="emit('createTrigger')"
      >
        {{ t('editor.actions.newTrigger') }}
      </KitBtn>
    </div>

    <KitImagePreview v-model="isImagePreviewOpen" :src="selectedPreviewImage" />
  </div>
</template>

<style lang="scss" scoped>
.triggers-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.manager-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  max-width: 360px;
}

.triggers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.trigger-item-card {
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    transform: translateY(-2px);
  }
}

.card-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: var(--bg-tertiary-color);
  overflow: hidden;
  cursor: pointer;

  &:hover .preview-zoom-hint {
    opacity: 1;
  }
}

.preview-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-muted-color);
  font-size: 2.5rem;
}

.preview-zoom-hint {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card-body {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.trigger-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--fg-primary-color);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.usage-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--bg-tertiary-color);
  color: var(--fg-muted-color);
  border: 1px solid var(--border-secondary-color);

  &.is-used {
    background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.15));
    border-color: var(--border-accent-color);
    color: var(--fg-accent-color);
  }
}

.trigger-fullname {
  font-size: 0.8rem;
  color: var(--fg-secondary-color);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.coords-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', monospace;
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 4px;
  padding: 3px 8px;
  color: var(--fg-muted-color);
  cursor: pointer;
  width: fit-content;
  margin-top: 4px;
  transition: all 0.15s ease;

  &:hover {
    color: var(--fg-accent-color);
    border-color: var(--fg-accent-color);

    .copy-icon {
      color: var(--fg-accent-color);
    }
  }

  .copy-icon {
    font-size: 0.8rem;
    opacity: 0.7;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid var(--border-secondary-color);
  background-color: var(--bg-tertiary-color);
}

.triggers-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  gap: 12px;
  color: var(--fg-secondary-color);
  text-align: center;

  .empty-icon {
    font-size: 3rem;
    color: var(--fg-muted-color);
  }
}
</style>
