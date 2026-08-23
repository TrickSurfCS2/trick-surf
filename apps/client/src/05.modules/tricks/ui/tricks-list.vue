<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMapStore } from '~/01.shared/store/map.store'
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitInput } from '~/02.kit/atoms/kit-input/ui'
import { KitPageLoader } from '~/02.kit/atoms/kit-page-loader/ui'
import TricksHeader from './tricks-header.vue'
import TricksItem from './tricks-item.vue'

const tricksStore = useTricksStore()
const mapStore = useMapStore()
const router = useRouter()
const { t } = useI18n()

const search = ref('')

watch(search, (val) => {
  tricksStore.setSearch(val)
})

function navigateToEditor() {
  const mapName = mapStore.selectedMap?.name || 'surf_ski_2_go'
  router.push(`/${mapName}/editor`)
}
</script>

<template>
  <div class="tricks-list-module">
    <div class="tricks-toolbar">
      <div class="search-wrap">
        <KitInput
          v-model="search"
          prepend-icon="mdi:magnify"
          placeholder="Search trick name or #index..."
          clearable
        />
      </div>
      <KitBtn
        color="accent"
        size="md"
        prepend-icon="mdi:pencil-ruler"
        @click="navigateToEditor"
      >
        {{ t('editor.title') }}
      </KitBtn>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
}

.search-wrap {
  flex: 1;
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
