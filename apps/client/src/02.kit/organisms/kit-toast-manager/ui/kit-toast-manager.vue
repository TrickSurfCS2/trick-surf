<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '~/01.shared/store/toast.store'
import { KitToast } from '~/02.kit/molecules/kit-toast/ui'

const toastStore = useToastStore()
const { messages } = storeToRefs(toastStore)
const { remove } = toastStore
</script>

<template>
  <TransitionGroup
    tag="div"
    class="kit-toast-manager"
    name="toast-list"
  >
    <KitToast
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
      @remove="remove(msg.id)"
    />
  </TransitionGroup>
</template>

<style lang="scss" scoped>
.kit-toast-manager {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: var(--z-toast, 1500);
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 360px;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
