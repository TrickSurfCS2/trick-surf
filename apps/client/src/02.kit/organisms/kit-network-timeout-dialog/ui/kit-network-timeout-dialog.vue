<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useNetworkStore } from '~/01.shared/store/network.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitDialog } from '~/02.kit/organisms/kit-dialog/ui'

const networkStore = useNetworkStore()
const { t } = useI18n()
</script>

<template>
  <KitDialog v-model="networkStore.isNetworkTimeoutModalOpen" :title="t('kit.network.timeout')" width="400px">
    <p>{{ t('kit.network.timeout') }}</p>
    <template #footer="{ close }">
      <KitBtn size="sm" variant="outlined" @click="close">
        {{ t('kit.dialog.close') }}
      </KitBtn>
    </template>
  </KitDialog>
</template>
