<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useAppScrollLock } from '~/01.shared/composables/use-scroll-lock'

interface Props {
  title?: string
  width?: string
  fullscreen?: boolean
  hideClose?: boolean
}

defineProps<Props>()

const visible = defineModel<boolean>({ default: false })
const { lock, unlock } = useAppScrollLock()

watch(visible, (val) => {
  if (val)
    lock()
  else
    unlock()
})

function close() {
  visible.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="kit-dialog-backdrop" @click="close" />
    </Transition>

    <Transition name="dialog-warp">
      <div
        v-if="visible"
        class="kit-dialog-content"
        :class="{ 'is-fullscreen': fullscreen }"
        :style="{ width, maxWidth: '92vw' }"
        role="dialog"
      >
        <div class="kit-dialog-header">
          <h3 v-if="title" class="kit-dialog-title">
            {{ title }}
          </h3>
          <div v-else class="kit-dialog-title-slot">
            <slot name="title" />
          </div>

          <button
            v-if="!hideClose"
            type="button"
            class="kit-dialog-close"
            aria-label="Close"
            @click="close"
          >
            <Icon icon="mdi:close" />
          </button>
        </div>

        <div class="kit-dialog-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="kit-dialog-footer">
          <slot name="footer" :close="close" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.kit-dialog-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  z-index: var(--z-modal, 1100);
}

.kit-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 12px;
  z-index: calc(var(--z-modal, 1100) + 1);
  display: flex;
  flex-direction: column;
  box-shadow: var(--s-l);
  max-height: 90vh;
  padding: 16px;

  &.is-fullscreen {
    width: 100vw !important;
    height: 100dvh !important;
    max-width: 100vw !important;
    max-height: 100dvh !important;
    border-radius: 0;
    top: 0;
    left: 0;
    transform: none;
  }

  @include media-down(sm) {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100% !important;
    max-width: 100% !important;
    transform: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.kit-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-secondary-color);
}

.kit-dialog-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--fg-primary-color);
}

.kit-dialog-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--fg-secondary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: var(--fg-primary-color);
    background-color: var(--bg-hover-color);
  }
}

.kit-dialog-body {
  flex: 1;
  overflow-y: auto;
  padding-top: 12px;
}

.kit-dialog-footer {
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-warp-enter-active,
.dialog-warp-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.dialog-warp-enter-from,
.dialog-warp-leave-to {
  opacity: 0;
  transform: translate(-50%, -46%) scale(0.95);
}
</style>
