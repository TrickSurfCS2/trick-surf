<script setup lang="ts">
interface Props {
  width?: string | number
  height?: string | number
  borderRadius?: string
  circle?: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    class="kit-skeleton"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: circle ? '50%' : borderRadius,
    }"
  />
</template>

<style lang="scss" scoped>
.kit-skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary-color) 25%,
    var(--bg-tertiary-color) 37%,
    var(--bg-secondary-color) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-pulse 1.4s ease infinite;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
