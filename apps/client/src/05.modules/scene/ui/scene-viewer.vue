<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ThreeSceneEngine } from '../lib/three-scene'

const containerRef = ref<HTMLDivElement | null>(null)
let engine: ThreeSceneEngine | null = null

const loadingProgress = ref(0)
const isLoaded = ref(false)

onMounted(() => {
  if (containerRef.value) {
    engine = new ThreeSceneEngine({
      container: containerRef.value,
      modelUrl: '/models/surf_ski_3_x.glb',
      hdrUrl: '/hdr/sky.hdr',
      onProgress: (progress) => {
        loadingProgress.value = progress
        if (progress >= 100) {
          isLoaded.value = true
        }
      },
    })
  }
})

onUnmounted(() => {
  if (engine) {
    engine.destroy()
    engine = null
  }
})

function rotateLeft() {
  engine?.rotate(Math.PI / 4)
}

function rotateRight() {
  engine?.rotate(-Math.PI / 4)
}

function resetView() {
  engine?.resetCamera()
}
</script>

<template>
  <div class="scene-viewer-wrapper">
    <div ref="containerRef" class="scene-canvas-container" />

    <div v-if="!isLoaded" class="scene-loader-overlay">
      <Icon icon="mdi:loading" class="scene-spin" />
      <span class="scene-progress">{{ loadingProgress }}%</span>
    </div>

    <div class="scene-controls-panel">
      <button
        type="button"
        class="scene-btn"
        title="Rotate Left"
        @click="rotateLeft"
      >
        <Icon icon="mdi:rotate-left" />
      </button>
      <button
        type="button"
        class="scene-btn"
        title="Reset Camera"
        @click="resetView"
      >
        <Icon icon="mdi:camera-retake" />
      </button>
      <button
        type="button"
        class="scene-btn"
        title="Rotate Right"
        @click="rotateRight"
      >
        <Icon icon="mdi:rotate-right" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scene-viewer-wrapper {
  position: relative;
  width: 100%;
  height: 55vh;
  min-height: 380px;
  max-height: 650px;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--bg-primary-color);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4);
}

.scene-canvas-container {
  width: 100%;
  height: 100%;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.scene-loader-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(13, 17, 23, 0.8);
  gap: 12px;
  color: var(--fg-accent-color);
  z-index: 10;
}

.scene-spin {
  font-size: 36px;
  animation: spin 1s linear infinite;
}

.scene-progress {
  font-weight: 600;
  font-size: 0.9rem;
}

.scene-controls-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 5;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  padding: 4px;
  border-radius: 8px;
  box-shadow: var(--s-m);
}

.scene-btn {
  background: none;
  border: none;
  color: var(--fg-secondary-color);
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--fg-accent-color);
    background-color: var(--bg-hover-color);
  }
}
</style>
