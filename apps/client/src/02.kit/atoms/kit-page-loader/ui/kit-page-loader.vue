<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '',
})
</script>

<template>
  <div class="kit-page-loader">
    <Icon icon="mdi:loading" class="kit-page-loader-spinner" />
    <span v-if="text" class="kit-page-loader-text">{{ text }}</span>
  </div>
</template>

<style lang="scss" scoped>
.kit-page-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  gap: 16px;
  color: var(--fg-accent-color);

  &-spinner {
    font-size: 36px;
    animation: spin 1s linear infinite;
  }

  &-text {
    font-size: 0.9rem;
    color: var(--fg-secondary-color);
  }
}
</style>
