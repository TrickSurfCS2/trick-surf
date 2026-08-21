<script setup lang="ts">
export interface TabItem {
  id: string | number
  label: string
  icon?: string
}

interface Props {
  tabs: TabItem[]
  modelValue?: string | number
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

function selectTab(id: string | number) {
  emit('update:modelValue', id)
  emit('change', id)
}
</script>

<template>
  <div class="kit-tabs">
    <div class="kit-tabs-wrapper">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="kit-tab-item"
        :class="{ 'is-active': modelValue === tab.id }"
        @click="selectTab(tab.id)"
      >
        <span class="kit-tab-label">{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.kit-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-top: 1px solid var(--border-content-color);
  border-bottom: 1px solid var(--border-content-color);
  background-color: var(--bg-secondary-color);
  height: 38px;

  &-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    max-width: var(--max-content-width);
    width: 100%;
  }
}

.kit-tab-item {
  background: none;
  border: none;
  color: var(--fg-secondary-color);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 8px 12px;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: var(--fg-accent-color);
  }

  &.is-active {
    color: var(--fg-accent-color);
    font-weight: 700;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 10%;
      right: 10%;
      height: 2px;
      background-color: var(--fg-accent-color);
      border-radius: 2px;
    }
  }
}
</style>
