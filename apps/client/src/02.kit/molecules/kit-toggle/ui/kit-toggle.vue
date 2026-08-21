<script setup lang="ts">
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
  <label class="kit-toggle" :class="{ 'is-active': modelValue, 'is-disabled': disabled }" @click.prevent="toggle">
    <span class="kit-toggle-track">
      <span class="kit-toggle-thumb" />
    </span>
    <span v-if="label || $slots.default" class="kit-toggle-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style lang="scss" scoped>
.kit-toggle {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 8px;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &-track {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background-color: var(--bg-tertiary-color);
    border: 1px solid var(--border-primary-color);
    position: relative;
    transition: all 0.2s ease;

    .is-active & {
      background-color: var(--fg-accent-color);
      border-color: var(--fg-accent-color);
    }
  }

  &-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: var(--fg-primary-color);
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    .is-active & {
      transform: translateX(16px);
      background-color: var(--fg-inverted-color);
    }
  }

  &-label {
    font-size: 0.875rem;
    color: var(--fg-primary-color);
  }
}
</style>
