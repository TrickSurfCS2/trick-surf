<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'
import { KitPageLoader } from '~/02.kit/atoms/kit-page-loader/ui'
import TricksHeader from './tricks-header.vue'
import TricksItem from './tricks-item.vue'

const tricksStore = useTricksStore()
const { t } = useI18n()

const search = ref('')

watch(search, (val) => {
  tricksStore.setSearch(val)
})
</script>

<template>
  <div class="tricks-list-module">
    <div class="tricks-toolbar">
      <KitInput
        v-model="search"
        prepend-icon="mdi:magnify"
        placeholder="Search trick name or #index..."
        clearable
      />
    </div>

    <KitPageLoader v-if="tricksStore.isLoading" :text="t('tricks.loading')" />

    <div v-else-if="tricksStore.filteredTricks.length > 0" class="tricks-table">
      <TricksHeader />
      <div class="tricks-body">
        <TricksItem
          v-for="(trick, idx) in tricksStore.filteredTricks"
          :key="trick.id"
          :trick="trick"
          :index="trick.index ?? (idx + 1)"
          :triggers="tricksStore.triggers"
        />
      </div>
    </div>

    <div v-else class="tricks-empty">
      <p>{{ t('tricks.noTricks') }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tricks-list-module {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.tricks-toolbar {
  max-width: 400px;
}

.tricks-table {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tricks-body {
  margin-top: 8px;
}

.tricks-empty {
  text-align: center;
  padding: 48px;
  color: var(--fg-secondary-color);
  font-size: 1rem;
}
</style>
