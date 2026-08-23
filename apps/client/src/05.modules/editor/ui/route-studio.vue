<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import RouteBuilder from './route-builder.vue'

interface Props {
  mapId: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'createTrickWithRoute', routeIds: number[]): void
}>()

const { t } = useI18n()
const toast = useToast()
const tricksStore = useTricksStore()

const activeRoute = ref<number[]>([])

function saveAsTrick() {
  if (activeRoute.value.length === 0) {
    toast.error(t('editor.studio.emptyRoute'))

    return
  }

  emit('createTrickWithRoute', [...activeRoute.value])
}

function clearRoute() {
  activeRoute.value = []
}
</script>

<template>
  <div class="route-studio">
    <div class="studio-header-card">
      <div class="studio-title-block">
        <div class="studio-icon-circle">
          <Icon icon="mdi:vector-polyline" />
        </div>
        <div>
          <h3 class="studio-title">
            {{ t('editor.studio.title') }}
          </h3>
          <p class="studio-subtitle">
            {{ t('editor.studio.desc') }}
          </p>
        </div>
      </div>

      <div class="studio-actions">
        <KitBtn
          v-if="activeRoute.length > 0"
          color="secondary"
          prepend-icon="mdi:trash-can-outline"
          @click="clearRoute"
        >
          {{ t('editor.actions.clear') }}
        </KitBtn>

        <KitBtn
          color="accent"
          size="lg"
          prepend-icon="mdi:creation"
          :disabled="activeRoute.length === 0"
          @click="saveAsTrick"
        >
          {{ t('editor.studio.saveAsTrick') }}
        </KitBtn>
      </div>
    </div>

    <!-- Active Route Workbench -->
    <div class="studio-workbench">
      <RouteBuilder
        v-model="activeRoute"
        :available-triggers="tricksStore.triggers"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.route-studio {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.studio-header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 12px;
  flex-wrap: wrap;
}

.studio-title-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.studio-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.15));
  border: 1px solid var(--border-accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--fg-accent-color);
  flex-shrink: 0;
}

.studio-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--fg-primary-color);
  margin: 0;
}

.studio-subtitle {
  font-size: 0.85rem;
  color: var(--fg-secondary-color);
  margin: 4px 0 0;
}

.studio-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.studio-workbench {
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 12px;
  padding: 20px;
}
</style>
