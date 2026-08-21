<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useNetworkStore } from '~/01.shared/store/network.store'

const networkStore = useNetworkStore()
const { t } = useI18n()
</script>

<template>
  <Transition name="fade">
    <div v-if="!networkStore.isOnline" class="kit-offline-badge">
      <Icon icon="mdi:wifi-off" />
      <span>{{ t('kit.network.offline') }}</span>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.kit-offline-badge {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: var(--z-toast, 1500);
  background-color: var(--fg-error-color);
  color: var(--fg-inverted-color);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: var(--s-m);
}
</style>
