<script setup lang="ts">
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitDialog } from '~/02.kit/organisms/kit-dialog/ui'

interface Props {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Confirm',
  message: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
const visible = defineModel<boolean>({ default: false })

function onConfirm() {
  emit('confirm')
  visible.value = false
}

function onCancel() {
  emit('cancel')
  visible.value = false
}
</script>

<template>
  <KitDialog v-model="visible" :title="title" width="400px">
    <p>{{ message }}</p>
    <template #footer>
      <KitBtn size="sm" variant="text" @click="onCancel">
        {{ cancelText }}
      </KitBtn>
      <KitBtn size="sm" color="accent" @click="onConfirm">
        {{ confirmText }}
      </KitBtn>
    </template>
  </KitDialog>
</template>
