<script setup lang="ts">
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { onClickOutside } from '@vueuse/core'

interface Props {
  placement?: 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom-end',
})

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const { x, y, strategy } = useFloating(triggerRef, menuRef, {
  placement: props.placement,
  whileElementsMounted: autoUpdate,
  middleware: [offset(6), flip(), shift({ padding: 8 })],
  open: isOpen,
})

onClickOutside(menuRef, () => {
  isOpen.value = false
}, { ignore: [triggerRef] })

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

defineExpose({
  open: () => (isOpen.value = true),
  close,
  toggle,
})
</script>

<template>
  <div class="kit-dropdown-wrapper">
    <div ref="triggerRef" class="kit-dropdown-trigger" @click="toggle">
      <slot name="trigger" :is-open="isOpen" />
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen"
          ref="menuRef"
          class="kit-dropdown-menu"
          :style="{
            position: strategy,
            top: `${y ?? 0}px`,
            left: `${x ?? 0}px`,
          }"
          @click="close"
        >
          <slot :close="close" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.kit-dropdown-wrapper {
  display: inline-flex;
}

.kit-dropdown-trigger {
  display: inline-flex;
  cursor: pointer;
}

.kit-dropdown-menu {
  z-index: var(--z-dropdown, 1200);
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 8px;
  box-shadow: var(--s-m);
  padding: 6px;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
