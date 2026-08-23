<script setup lang="ts">
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { Icon } from '@iconify/vue'
import { onClickOutside } from '@vueuse/core'

export interface SelectOption {
  label: string
  value: string | number
  icon?: string
}

interface Props {
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select...',
  disabled: false,
})

const modelValue = defineModel<string | number>({ default: '' })
const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

const { x, y, strategy } = useFloating(triggerRef, dropdownRef, {
  placement: 'bottom-start',
  whileElementsMounted: autoUpdate,
  middleware: [offset(4), flip(), shift({ padding: 8 })],
  open: isOpen,
})

onClickOutside(dropdownRef, () => {
  isOpen.value = false
}, { ignore: [triggerRef] })

const selectedOption = computed(() => props.options.find(o => o.value === modelValue.value))

function select(option: SelectOption) {
  modelValue.value = option.value
  isOpen.value = false
}
</script>

<template>
  <div class="kit-select-wrapper" :class="{ 'is-disabled': disabled, 'is-open': isOpen }">
    <button
      ref="triggerRef"
      type="button"
      class="kit-select-trigger"
      :disabled="disabled"
      @click="isOpen = !isOpen"
    >
      <span class="kit-select-label">
        <Icon v-if="selectedOption?.icon" :icon="selectedOption.icon" class="kit-select-icon" />
        <span class="kit-select-text">{{ selectedOption?.label || placeholder }}</span>
      </span>
      <Icon icon="mdi:chevron-down" class="kit-select-arrow" :class="{ 'is-rotated': isOpen }" />
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="kit-select-dropdown"
          :style="{
            position: strategy,
            top: `${y ?? 0}px`,
            left: `${x ?? 0}px`,
          }"
        >
          <div
            v-for="option in options"
            :key="option.value"
            class="kit-select-item"
            :class="{ 'is-selected': option.value === modelValue }"
            @click="select(option)"
          >
            <Icon v-if="option.icon" :icon="option.icon" class="kit-select-icon" />
            <span>{{ option.label }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.kit-select-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
}

.kit-select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  color: var(--fg-primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
  min-height: 38px;
  box-sizing: border-box;

  &:hover {
    border-color: var(--fg-accent-color);
  }
}

.kit-select-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: left;
}

.kit-select-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kit-select-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.kit-select-arrow {
  transition: transform 0.2s ease;
  font-size: 1.25rem;
  color: var(--fg-secondary-color);
  flex-shrink: 0;

  &.is-rotated {
    transform: rotate(180deg);
  }
}

.kit-select-dropdown {
  z-index: var(--z-dropdown, 1200);
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 8px;
  box-shadow: var(--s-m);
  padding: 4px;
  min-width: 180px;
  max-height: 250px;
  overflow-y: auto;
}

.kit-select-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--fg-primary-color);
  white-space: nowrap;

  &:hover {
    background-color: var(--bg-hover-color);
    color: var(--fg-accent-color);
  }

  &.is-selected {
    background-color: var(--bg-accent-overlay-color);
    color: var(--fg-accent-color);
    font-weight: 600;
  }
}
</style>
