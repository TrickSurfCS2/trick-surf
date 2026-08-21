<script setup lang="ts">
import { AppFooter } from '~/05.modules/footer'
import { AppHeader } from '~/05.modules/header'
import { AppDrawer } from '~/05.modules/navigation'

const isDrawerOpen = ref(false)

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}
</script>

<template>
  <div class="layout-default">
    <AppHeader @toggle-drawer="toggleDrawer" />
    <AppDrawer v-model="isDrawerOpen" />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}
</style>
