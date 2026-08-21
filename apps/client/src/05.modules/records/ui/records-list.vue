<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="records-module">
    <div class="records-dev-card">
      <Icon icon="mdi:hammer-wrench" class="records-icon" />
      <h2>{{ t('records.inDevelopment') }}</h2>
      <p>{{ t('records.soon') }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.records-module {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  width: 100%;
}

.records-dev-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
  padding: 40px;
  background-color: var(--bg-secondary-color);
  border: 1px dashed var(--border-primary-color);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;

  .records-icon {
    font-size: 48px;
    color: var(--fg-accent-color);
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--fg-primary-color);
  }

  p {
    color: var(--fg-secondary-color);
    font-size: 0.95rem;
  }
}
</style>
