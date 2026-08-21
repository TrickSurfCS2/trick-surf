<script setup lang="ts">
import type { ToastMessage } from '~/01.shared/types/models/toast'
import { Icon } from '@iconify/vue'

interface Props {
  message: ToastMessage
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove'): void
}>()

const iconMap = {
  success: 'mdi:check-circle',
  error: 'mdi:alert-circle',
  info: 'mdi:information',
  warn: 'mdi:alert',
}
</script>

<template>
  <div class="kit-toast-item" :class="`kit-toast-item--${message.type}`" @click="emit('remove')">
    <Icon :icon="iconMap[message.type]" class="kit-toast-icon" />
    <div class="kit-toast-body">
      <div v-if="message.title" class="kit-toast-title">
        {{ message.title }}
      </div>
      <div class="kit-toast-detail">
        {{ message.detail }}
      </div>
    </div>
    <button type="button" class="kit-toast-close" @click.stop="emit('remove')">
      <Icon icon="mdi:close" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.kit-toast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  color: var(--fg-primary-color);
  box-shadow: var(--s-m);
  width: 100%;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &--success {
    border-left: 4px solid var(--fg-success-color);
    .kit-toast-icon {
      color: var(--fg-success-color);
    }
  }
  &--error {
    border-left: 4px solid var(--fg-error-color);
    .kit-toast-icon {
      color: var(--fg-error-color);
    }
  }
  &--warn {
    border-left: 4px solid var(--fg-warning-color);
    .kit-toast-icon {
      color: var(--fg-warning-color);
    }
  }
  &--info {
    border-left: 4px solid var(--fg-accent-color);
    .kit-toast-icon {
      color: var(--fg-accent-color);
    }
  }
}

.kit-toast-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.kit-toast-body {
  flex: 1;
  min-width: 0;
}

.kit-toast-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.kit-toast-detail {
  font-size: 0.85rem;
  color: var(--fg-secondary-color);
  word-break: break-word;
}

.kit-toast-close {
  background: none;
  border: none;
  color: var(--fg-muted-color);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;

  &:hover {
    color: var(--fg-primary-color);
  }
}
</style>
