<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePwaStore } from '~/01.shared/store/pwa.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'

const pwaStore = usePwaStore()
const { t } = useI18n()
</script>

<template>
  <Transition name="slide-up">
    <div v-if="pwaStore.needRefresh" class="kit-reload-prompt">
      <div class="prompt-text">
        {{ t('kit.pwa.updateAvailable') }}
      </div>
      <KitBtn size="sm" color="accent" @click="pwaStore.reload">
        {{ t('kit.pwa.reload') }}
      </KitBtn>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.kit-reload-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-accent-color);
  border-radius: 8px;
  padding: 12px 16px;
  z-index: var(--z-pwa-prompt, 1600);
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--s-l);

  .prompt-text {
    font-size: 0.875rem;
    color: var(--fg-primary-color);
  }
}
</style>
