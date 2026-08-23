<script setup lang="ts">
import type { TrickItem, TriggerItem } from '~/01.shared/types/models'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { formatDate, getMediaUrl } from '~/01.shared/lib/helpers'
import { KitImage } from '~/02.kit/atoms/kit-image/ui'
import { KitImagePreview } from '~/02.kit/molecules/kit-image-preview/ui'
import { TrickEntity } from '~/03.domain/entities/trick.entity'

interface Props {
  trick: TrickItem
  triggers: TriggerItem[]
  index?: number
}

const props = defineProps<Props>()
const { t } = useI18n()

const isExpanded = ref(false)
const previewImage = ref<string | null>(null)
const isPreviewOpen = ref(false)

const trickEntity = computed(() => new TrickEntity(props.trick, props.index))
const resolvedTriggers = computed(() => {
  if (props.trick.triggers && Array.isArray(props.trick.triggers) && props.trick.triggers.length > 0) {
    return props.trick.triggers
  }

  return trickEntity.value.resolveRouteTriggers(props.triggers)
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function openPreview(imgUrl?: string | null) {
  if (imgUrl) {
    previewImage.value = getMediaUrl(imgUrl)
    isPreviewOpen.value = true
  }
}
</script>

<template>
  <div class="tricks-item" :class="{ 'is-expanded': isExpanded }">
    <div class="tricks-item-main" @click="toggleExpand">
      <div class="col-index">
        {{ trickEntity.index }}
      </div>

      <div class="col-name">
        <span class="trick-name-text">{{ trick.name }}</span>
        <span v-if="trickEntity.isPreStrafe" class="badge-pre-strafe">Pre</span>
      </div>

      <div class="col-points">
        <span class="badge-point">{{ trick.point }}</span>
      </div>

      <div class="col-completes">
        <Icon icon="mdi:account-check-outline" class="mr-1" />
        {{ trickEntity.totalCompletes }}
      </div>

      <div class="col-length">
        {{ trickEntity.trickLength }}
      </div>
    </div>

    <Transition name="slide-down">
      <div v-if="isExpanded" class="tricks-item-details">
        <!-- Route Triggers Gallery -->
        <div v-if="resolvedTriggers.length > 0" class="route-gallery">
          <div
            v-for="(trigger, idx) in resolvedTriggers"
            :key="`${trick.id}-${trigger.id}-${idx}`"
            class="route-trigger-card"
            @click.stop="openPreview(trigger.preview)"
          >
            <div class="route-trigger-header">
              <span class="route-trigger-order">{{ idx + 1 }}</span>
              <span class="route-trigger-name">{{ trigger.name }}</span>
            </div>
            <div class="route-trigger-preview">
              <KitImage :src="getMediaUrl(trigger.preview)" :alt="trigger.name" height="100%" />
            </div>
          </div>
        </div>

        <div v-else class="route-fallback">
          {{ trick.route || t('tricks.route') }}
        </div>

        <!-- Meta Info / Created By -->
        <div class="tricks-meta-footer">
          <div class="meta-author">
            <span class="meta-label">{{ t('tricks.createdBy') }}:</span>
            <span class="meta-val">{{ trick.authorUsername || trick.authorSteamid64 || t('tricks.unknownAuthor') }}</span>
          </div>

          <div class="meta-date">
            <span class="meta-label">{{ t('tricks.added') }}:</span>
            <span class="meta-val">{{ formatDate(trick.createdAt) || '—' }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <KitImagePreview v-model="isPreviewOpen" :src="previewImage" />
  </div>
</template>

<style lang="scss" scoped>
.tricks-item {
  border-radius: var(--r-md, 8px);
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-secondary-color);
  margin-bottom: 8px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--fg-accent-color);
    box-shadow: 0 0 10px rgba(var(--fg-accent-color-rgb, 201, 117, 222), 0.15);
  }

  &.is-expanded {
    border-color: var(--fg-accent-color);
    background-color: var(--bg-secondary-color);
  }
}

.tricks-item-main {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  user-select: none;
}

.col-index {
  width: 60px;
  text-align: center;
  font-weight: 700;
  color: var(--fg-secondary-color);
}

.col-name {
  flex: 2;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trick-name-text {
  font-weight: 600;
  color: var(--fg-accent-color);
  font-size: 1rem;
}

.badge-pre-strafe {
  background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.2));
  color: var(--fg-accent-color);
  border: 1px solid var(--border-accent-color);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--r-xs, 4px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.col-points {
  width: 90px;
  display: flex;
  justify-content: center;
}

.badge-point {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--fg-highlight-color);
  background-color: var(--bg-tertiary-color);
  padding: 2px 8px;
  border-radius: var(--r-sm, 6px);
}

.col-completes {
  width: 110px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--fg-secondary-color);
  font-size: 0.9rem;
}

.col-length {
  width: 90px;
  text-align: right;
  color: var(--fg-secondary-color);
  font-size: 0.9rem;
}

.tricks-item-details {
  padding: 16px;
  border-top: 1px dashed var(--border-secondary-color);
  background-color: var(--bg-primary-color);
}

.route-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.route-trigger-card {
  width: 160px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: var(--r-md, 8px);
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--fg-accent-color);
  }
}

.route-trigger-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background-color: var(--bg-tertiary-color);
}

.route-trigger-order {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--fg-accent-color);
}

.route-trigger-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--fg-primary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-trigger-preview {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.route-fallback {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--fg-secondary-color);
  padding: 8px 0;
}

.tricks-meta-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--fg-muted-color);
  padding-top: 8px;
  border-top: 1px solid var(--border-secondary-color);
}

.meta-label {
  margin-right: 4px;
}

.meta-val {
  color: var(--fg-secondary-color);
  font-weight: 500;
}
</style>
