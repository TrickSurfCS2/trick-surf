<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'

interface Props {
  error?: Error | null
}

defineProps<Props>()
const router = useRouter()
</script>

<template>
  <div class="error-boundary">
    <Icon icon="mdi:alert-octagon" class="error-icon" />
    <h2>Something went wrong</h2>
    <p v-if="error">
      {{ error.message }}
    </p>
    <KitBtn size="md" color="accent" @click="router.push('/')">
      Go to Homepage
    </KitBtn>
  </div>
</template>

<style lang="scss" scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
  text-align: center;

  .error-icon {
    font-size: 64px;
    color: var(--fg-error-color);
  }

  h2 {
    font-size: 1.5rem;
    color: var(--fg-primary-color);
  }

  p {
    color: var(--fg-secondary-color);
  }
}
</style>
