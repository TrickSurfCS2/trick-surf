<script setup lang="ts">
import { arrow, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'

interface Props {
  text?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  disabled: false,
})

const referenceRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const arrowRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const {
  x,
  y,
  strategy,
  placement: finalPlacement,
} = useFloating(referenceRef, floatingRef, {
  placement: props.placement,
  whileElementsMounted: autoUpdate,
  middleware: [
    offset(8),
    flip(),
    shift({ padding: 8 }),
    arrow({ element: arrowRef }),
  ],
  open: isVisible,
})

let timeout: ReturnType<typeof setTimeout>

function show() {
  if (props.disabled)
    return
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    isVisible.value = true
  }, 150)
}

function hide() {
  clearTimeout(timeout)
  isVisible.value = false
}

const floatingStyle = computed(() => ({
  position: strategy.value,
  top: `${y.value ?? 0}px`,
  left: `${x.value ?? 0}px`,
}))
</script>

<template>
  <div
    class="kit-tooltip-wrapper"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
  >
    <div ref="referenceRef" class="kit-tooltip-trigger">
      <slot />
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isVisible"
          ref="floatingRef"
          class="kit-tooltip-floating"
          :style="floatingStyle"
          :data-placement="finalPlacement"
        >
          <slot name="content">
            {{ text }}
          </slot>
          <div ref="arrowRef" class="kit-tooltip-arrow" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.kit-tooltip-wrapper {
  display: inline-flex;
}

.kit-tooltip-trigger {
  display: inline-flex;
}

.kit-tooltip-floating {
  z-index: var(--z-tooltip, 1400);
  background-color: var(--bg-tertiary-color);
  color: var(--fg-primary-color);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  box-shadow: var(--s-m);
  pointer-events: none;
  border: 1px solid var(--border-secondary-color);
  max-width: 250px;
  text-align: center;
}

.kit-tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--bg-tertiary-color);
  transform: rotate(45deg);
}
</style>
