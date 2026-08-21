<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useChangeTheme } from '~/01.shared/composables/use-change-theme'
import { ThemesVariant } from '~/01.shared/constants/themes'

const emit = defineEmits<{
  (e: 'toggleDrawer'): void
}>()

const router = useRouter()
const { theme, toggleTheme } = useChangeTheme()

const themeIcons: Record<ThemesVariant, string> = {
  [ThemesVariant.Dark]: 'mdi:weather-night',
  [ThemesVariant.Light]: 'mdi:white-balance-sunny',
}
</script>

<template>
  <header class="app-header">
    <div class="app-header-container">
      <div class="header-left">
        <button
          type="button"
          class="header-icon-btn"
          aria-label="Menu"
          @click="emit('toggleDrawer')"
        >
          <Icon icon="mdi:menu" />
        </button>

        <div class="header-brand" @click="router.push('/')">
          <span class="brand-text">surfgxds</span>
        </div>
      </div>

      <div class="header-right">
        <button
          type="button"
          class="header-icon-btn"
          :title="`Theme: ${theme}`"
          @click="toggleTheme"
        >
          <Icon :icon="themeIcons[theme as ThemesVariant] || 'mdi:palette'" />
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: var(--bg-secondary-color);
  border-bottom: 1px solid var(--border-primary-color);
  backdrop-filter: blur(12px);
  z-index: var(--z-header, 100);
  display: flex;
  align-items: center;
}

.app-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--max-content-width);
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-btn {
  background: none;
  border: none;
  color: var(--fg-primary-color);
  font-size: 1.5rem;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--fg-accent-color);
    background-color: var(--bg-hover-color);
  }
}

.header-brand {
  cursor: pointer;
  user-select: none;

  .brand-text {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--fg-primary-color);
    transition: color 0.2s ease;

    &:hover {
      color: var(--fg-accent-color);
    }
  }
}
</style>
