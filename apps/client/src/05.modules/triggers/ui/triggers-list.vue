<script setup lang="ts">
import type { TriggerItem } from '~/01.shared/types/models'
import { useI18n } from 'vue-i18n'
import { KitImage } from '~/02.kit/atoms/kit-image/ui'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'
import { KitPageLoader } from '~/02.kit/atoms/kit-page-loader/ui'
import { KitImagePreview } from '~/02.kit/molecules/kit-image-preview/ui'
import { TriggerEntity } from '~/03.domain/entities/trigger.entity'

interface Props {
  triggers: TriggerItem[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const { t } = useI18n()
const searchQuery = ref('')
const selectedPreview = ref<string | null>(null)
const isPreviewOpen = ref(false)

const triggerEntities = computed(() =>
  props.triggers.map(t => new TriggerEntity(t)))

const filteredTriggers = computed(() => {
  if (!searchQuery.value.trim())
    return triggerEntities.value

  const q = searchQuery.value.toLowerCase().trim()

  return triggerEntities.value.filter(t => t.name.toLowerCase().includes(q))
})

function openPreview(imgUrl: string | null) {
  if (imgUrl) {
    selectedPreview.value = imgUrl
    isPreviewOpen.value = true
  }
}
</script>

<template>
  <div class="triggers-list-module">
    <div class="triggers-toolbar">
      <KitInput
        v-model="searchQuery"
        prepend-icon="mdi:magnify"
        :placeholder="t('triggers.search')"
        clearable
      />
    </div>

    <KitPageLoader v-if="isLoading" :text="t('triggers.loading')" />

    <div v-else-if="filteredTriggers.length > 0" class="triggers-grid">
      <div
        v-for="trigger in filteredTriggers"
        :key="trigger.id"
        class="trigger-card"
        @click="openPreview(trigger.preview)"
      >
        <div class="trigger-card-inner">
          <div class="trigger-title">
            {{ trigger.name }}
          </div>
          <div class="trigger-image-wrapper">
            <KitImage :src="trigger.preview" :alt="trigger.name" height="100%" />
          </div>
          <div v-if="trigger.coordinatesLabel" class="trigger-coords">
            {{ trigger.coordinatesLabel }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="triggers-empty">
      <p>{{ t('triggers.noTriggers') }}</p>
    </div>

    <KitImagePreview v-model="isPreviewOpen" :src="selectedPreview" />
  </div>
</template>

<style lang="scss" scoped>
.triggers-list-module {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.triggers-toolbar {
  max-width: 400px;
}

.triggers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  width: 100%;
}

.trigger-card {
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: var(--r-md, 10px);
  overflow: hidden;
  box-shadow: var(--s-s);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    box-shadow: 0 0 10px rgba(var(--fg-accent-color-rgb, 201, 117, 222), 0.2);
    transform: translateY(-2px);
  }
}

.trigger-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  gap: 8px;
}

.trigger-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--fg-primary-color);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.trigger-image-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
}

.trigger-coords {
  font-size: 0.75rem;
  color: var(--fg-muted-color);
  font-family: monospace;
}

.triggers-empty {
  text-align: center;
  padding: 48px;
  color: var(--fg-secondary-color);
}
</style>
