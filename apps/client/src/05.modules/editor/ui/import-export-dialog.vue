<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/01.shared/composables/use-toast'
import { useTricksStore } from '~/01.shared/store/tricks.store'
import { KitBtn } from '~/02.kit/atoms/kit-btn/ui'
import { KitDialog } from '~/02.kit/organisms/kit-dialog/ui'

interface Props {
  mapName: string
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>({ default: false })
const { t } = useI18n()
const toast = useToast()
const tricksStore = useTricksStore()

const activeTab = ref<'export' | 'import'>('export')
const importJsonText = ref('')
const isImporting = ref(false)
const importError = ref<string | null>(null)

const exportedJsonString = computed(() => {
  const data = tricksStore.exportData()

  return JSON.stringify(data, null, 2)
})

function copyJson() {
  navigator.clipboard.writeText(exportedJsonString.value)
  toast.success(t('editor.actions.copyJson'))
}

function downloadJson() {
  const blob = new Blob([exportedJsonString.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trick_surf_${props.mapName}_backup.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.success(t('editor.actions.downloadJson'))
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) {
        importJsonText.value = ev.target.result as string
      }
    }

    reader.readAsText(file)
  }
}

async function handleImport() {
  importError.value = null
  if (!importJsonText.value.trim()) {
    importError.value = 'Please paste or select a JSON file.'

    return
  }

  isImporting.value = true

  try {
    const parsed = JSON.parse(importJsonText.value)
    if (!parsed || (typeof parsed !== 'object')) {
      throw new TypeError('Invalid JSON format: root must be an object.')
    }

    await tricksStore.importData(parsed)
    toast.success(t('editor.importExport.importSuccess'))
    importJsonText.value = ''
    isOpen.value = false
  }
  catch (err: unknown) {
    importError.value = err instanceof Error ? err.message : t('editor.importExport.importError')
    toast.error(t('editor.importExport.importError'))
  }
  finally {
    isImporting.value = false
  }
}
</script>

<template>
  <KitDialog
    v-model="isOpen"
    :title="t('editor.importExport.title')"
    width="680px"
  >
    <div class="import-export-dialog-content">
      <!-- Tabs Switcher -->
      <div class="dialog-tabs">
        <button
          type="button"
          class="dialog-tab-btn"
          :class="{ 'is-active': activeTab === 'export' }"
          @click="activeTab = 'export'"
        >
          <Icon icon="mdi:export-variant" />
          <span>{{ t('editor.actions.exportJson') }}</span>
        </button>

        <button
          type="button"
          class="dialog-tab-btn"
          :class="{ 'is-active': activeTab === 'import' }"
          @click="activeTab = 'import'"
        >
          <Icon icon="mdi:import" />
          <span>{{ t('editor.actions.importJson') }}</span>
        </button>
      </div>

      <!-- Tab 1: Export -->
      <div v-if="activeTab === 'export'" class="tab-pane">
        <p class="tab-description">
          {{ t('editor.importExport.exportDesc') }}
        </p>

        <div class="export-stats-bar">
          <span class="stat-pill">
            <Icon icon="mdi:script-text-outline" />
            {{ t('editor.importExport.tricksCount') }}: <strong>{{ tricksStore.tricks.length }}</strong>
          </span>
          <span class="stat-pill">
            <Icon icon="mdi:map-marker-outline" />
            {{ t('editor.importExport.triggersCount') }}: <strong>{{ tricksStore.triggers.length }}</strong>
          </span>
        </div>

        <div class="code-container">
          <pre class="json-code"><code>{{ exportedJsonString }}</code></pre>
        </div>

        <div class="export-actions-row">
          <KitBtn
            variant="tonal"
            prepend-icon="mdi:content-copy"
            @click="copyJson"
          >
            {{ t('editor.actions.copyJson') }}
          </KitBtn>

          <KitBtn
            color="accent"
            prepend-icon="mdi:download"
            @click="downloadJson"
          >
            {{ t('editor.actions.downloadJson') }}
          </KitBtn>
        </div>
      </div>

      <!-- Tab 2: Import -->
      <div v-else class="tab-pane">
        <p class="tab-description">
          {{ t('editor.importExport.importDesc') }}
        </p>

        <div v-if="importError" class="alert-error">
          <Icon icon="mdi:alert-circle" />
          <span>{{ importError }}</span>
        </div>

        <div class="file-upload-row">
          <label class="file-upload-btn">
            <Icon icon="mdi:file-upload-outline" />
            <span>{{ t('editor.importExport.selectFile') }}</span>
            <input
              type="file"
              accept=".json,application/json"
              style="display: none"
              @change="handleFileSelect"
            >
          </label>
        </div>

        <div class="textarea-container">
          <textarea
            v-model="importJsonText"
            class="import-textarea"
            :placeholder="t('editor.importExport.pastePlaceholder')"
            rows="10"
          />
        </div>

        <div class="import-actions-row">
          <KitBtn
            color="accent"
            prepend-icon="mdi:database-import-outline"
            :loading="isImporting"
            :disabled="!importJsonText.trim()"
            @click="handleImport"
          >
            {{ t('editor.actions.importJson') }}
          </KitBtn>
        </div>
      </div>
    </div>

    <template #footer="{ close }">
      <KitBtn color="secondary" @click="close">
        {{ t('editor.actions.cancel') }}
      </KitBtn>
    </template>
  </KitDialog>
</template>

<style lang="scss" scoped>
.import-export-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-primary-color);
  padding-bottom: 8px;
}

.dialog-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;
  color: var(--fg-secondary-color);
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--fg-primary-color);
    background-color: var(--bg-hover-color);
  }

  &.is-active {
    background-color: var(--bg-accent-overlay-color, rgba(201, 117, 222, 0.15));
    border-color: var(--fg-accent-color);
    color: var(--fg-accent-color);
  }
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tab-description {
  font-size: 0.85rem;
  color: var(--fg-secondary-color);
  line-height: 1.4;
}

.export-stats-bar {
  display: flex;
  gap: 8px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  padding: 4px 10px;
  background-color: var(--bg-tertiary-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;
  color: var(--fg-primary-color);
}

.code-container {
  max-height: 260px;
  overflow: auto;
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 8px;
  padding: 12px;
}

.json-code {
  font-family: 'JetBrains Mono', monospace, Consolas;
  font-size: 0.78rem;
  color: var(--fg-secondary-color);
  margin: 0;
  white-space: pre;
}

.export-actions-row,
.import-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.file-upload-row {
  display: flex;
}

.file-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px dashed var(--border-primary-color);
  background-color: var(--bg-secondary-color);
  color: var(--fg-primary-color);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--fg-accent-color);
    color: var(--fg-accent-color);
    background-color: var(--bg-tertiary-color);
  }
}

.import-textarea {
  width: 100%;
  font-family: 'JetBrains Mono', monospace, Consolas;
  font-size: 0.8rem;
  padding: 10px;
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 8px;
  color: var(--fg-primary-color);
  outline: none;
  resize: vertical;

  &:focus {
    border-color: var(--fg-accent-color);
  }
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid var(--fg-error-color, #ef4444);
  color: var(--fg-error-color, #ef4444);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
}
</style>
