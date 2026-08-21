<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  src?: string | null
  alt?: string
  fallbackSrc?: string
  width?: string | number
  height?: string | number
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  preview?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isLoaded = ref(false)
const isError = ref(false)

function handleLoad() {
  isLoaded.value = true
  isError.value = false
}

function handleError() {
  isLoaded.value = true
  isError.value = true
}
</script>

<template>
  <div
    class="kit-image-container"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    }"
    @click="emit('click', $event)"
  >
    <img
      v-if="src && !isError"
      :src="src"
      :alt="alt"
      :style="{ objectFit }"
      class="kit-image-img"
      :class="{ 'is-loaded': isLoaded }"
      loading="lazy"
      @load="handleLoad"
      @error="handleError"
    >
    <div v-else class="kit-image-placeholder">
      <Icon icon="mdi:image-broken-variant" class="placeholder-icon" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.kit-image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--bg-tertiary-color);
  border-radius: inherit;
}

.kit-image-img {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.is-loaded {
    opacity: 1;
  }
}

.kit-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--fg-muted-color);

  .placeholder-icon {
    font-size: 2rem;
  }
}
</style>
