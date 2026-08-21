<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  src?: string | null
  alt?: string
}

withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
})

const isOpen = defineModel<boolean>({ default: false })

function close() {
  isOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen && src" class="kit-image-preview-modal" @click="close">
        <button type="button" class="preview-close-btn" @click="close">
          <Icon icon="mdi:close" />
        </button>
        <img
          :src="src"
          :alt="alt"
          class="preview-img"
          @click.stop
        >
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.kit-image-preview-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: var(--z-modal, 1100);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.preview-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  color: #fff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.preview-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
</style>
