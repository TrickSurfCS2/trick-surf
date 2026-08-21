<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'

const router = useRouter()
</script>

<template>
  <div class="view-not-found">
    <Icon icon="mdi:map-marker-question-outline" class="not-found-icon" />
    <h1 class="not-found-code">
      404
    </h1>
    <p class="not-found-msg">
      Page Not Found
    </p>
    <KitBtn size="md" color="accent" @click="router.push('/')">
      Back to Home
    </KitBtn>
  </div>
</template>

<style lang="scss" scoped>
.view-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  gap: 16px;
  text-align: center;
  margin: 0 auto;

  .not-found-icon {
    font-size: 72px;
    color: var(--fg-accent-color);
  }

  .not-found-code {
    font-size: 3rem;
    font-weight: 800;
    color: var(--fg-primary-color);
  }

  .not-found-msg {
    font-size: 1.1rem;
    color: var(--fg-secondary-color);
    margin-bottom: 8px;
  }
}
</style>
