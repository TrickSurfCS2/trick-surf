<script setup lang="ts">
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { TriggersList } from '~/05.modules/triggers'

const tricksStore = useTricksStore()
</script>

<template>
  <div class="view-triggers">
    <TriggersList :triggers="tricksStore.triggers" :is-loading="tricksStore.isLoading" />
  </div>
</template>

<style lang="scss" scoped>
.view-triggers {
  width: 100%;
}
</style>
