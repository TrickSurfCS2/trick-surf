<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
})

const modelValue = defineModel<boolean>({ default: false })

function toggle() {
  if (!props.disabled)
    modelValue.value = !modelValue.value
}
</script>

<template>
  <label class="kit-checkbox" :class="{ 'is-disabled': disabled, 'is-checked': modelValue }" @click.prevent="toggle">
    <span class="kit-checkbox-box">
      <Icon v-if="modelValue" icon="mdi:check" class="kit-checkbox-icon" />
    </span>
    <span v-if="label || $slots.default" class="kit-checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style lang="scss" scoped>
.kit-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 8px;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &-box {
    width: 18px;
    height: 18px;
    border: 1.5px solid var(--border-primary-color);
    border-radius: 4px;
    background-color: var(--bg-primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    .is-checked & {
      background-color: var(--fg-accent-color);
      border-color: var(--fg-accent-color);
      color: var(--fg-inverted-color);
    }
  }

  &-icon {
    font-size: 14px;
  }

  &-label {
    font-size: 0.9rem;
    color: var(--fg-primary-color);
  }
}
</style>
