<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from '~/01.shared/composables/use-toast'
import { useMapStore } from '~/01.shared/store/map.store'
import { KitLogo } from '~/02.kit/atoms/kit-logo/ui'

const router = useRouter()
const { t } = useI18n()
const mapStore = useMapStore()
const toast = useToast()

const SERVER_IP = '194.147.90.131:27015'
const isCopied = ref(false)

onMounted(() => {
  mapStore.fetchMaps()
})

const currentMapName = computed(() => {
  return mapStore.selectedMap?.name || mapStore.maps[0]?.name || 'surf_ski_3_x'
})

function selectMap(name: string) {
  mapStore.setMapByName(name)
}

async function copyServerIp() {
  try {
    await navigator.clipboard.writeText(SERVER_IP)
    isCopied.value = true
    toast.success(t('home.ipCopied'))
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  }
  catch {
    toast.info(`IP: ${SERVER_IP}`)
  }
}

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="view-home">
    <!-- Hero / Header Section -->
    <header class="home-hero">
      <KitLogo />

      <h1 class="home-subtitle">
        {{ t('home.subtitle') }}
      </h1>

      <p class="home-description">
        {{ t('home.description') }}
      </p>

      <!-- Server Quick Connect Pill -->
      <div class="home-server-badge">
        <span class="server-status-dot" />
        <span class="server-ip-label">connect {{ SERVER_IP }}</span>
        <button
          type="button"
          class="server-copy-btn"
          :title="t('home.copyIp')"
          @click="copyServerIp"
        >
          <Icon :icon="isCopied ? 'mdi:check' : 'mdi:content-copy'" />
        </button>
      </div>

      <!-- Quick Map Selector -->
      <div v-if="mapStore.maps.length > 0" class="home-map-selector">
        <span class="map-selector-label">{{ t('home.selectMapHint') }}</span>
        <div class="map-chips">
          <button
            v-for="mapItem in mapStore.maps"
            :key="mapItem.id"
            type="button"
            class="map-chip"
            :class="{ 'is-active': currentMapName === mapItem.name }"
            @click="selectMap(mapItem.name)"
          >
            <Icon icon="mdi:map-marker" class="map-chip-icon" />
            <span>{{ mapItem.fullName || mapItem.name }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Sections Grid -->
    <section class="home-sections-grid" aria-label="Sections">
      <!-- Tricks Card -->
      <article
        class="section-card card-tricks"
        role="button"
        tabindex="0"
        @click="navigateTo(`/${currentMapName}/tricks`)"
        @keydown.enter="navigateTo(`/${currentMapName}/tricks`)"
      >
        <div class="card-glow" />
        <div class="card-header">
          <div class="card-icon-wrapper icon-tricks">
            <Icon icon="mdi:skateboarding" />
          </div>
          <span class="card-badge">{{ t('home.sections.tricks.badge') }}</span>
        </div>
        <div class="card-body">
          <h2 class="card-title">
            {{ t('home.sections.tricks.title') }}
          </h2>
          <p class="card-desc">
            {{ t('home.sections.tricks.desc') }}
          </p>
        </div>
        <div class="card-footer">
          <span class="card-action-text">{{ t('home.sections.tricks.action') }}</span>
          <Icon icon="mdi:arrow-right" class="card-arrow-icon" />
        </div>
      </article>

      <!-- Triggers Card -->
      <article
        class="section-card card-triggers"
        role="button"
        tabindex="0"
        @click="navigateTo(`/${currentMapName}/triggers`)"
        @keydown.enter="navigateTo(`/${currentMapName}/triggers`)"
      >
        <div class="card-glow" />
        <div class="card-header">
          <div class="card-icon-wrapper icon-triggers">
            <Icon icon="mdi:map-marker-path" />
          </div>
          <span class="card-badge">{{ t('home.sections.triggers.badge') }}</span>
        </div>
        <div class="card-body">
          <h2 class="card-title">
            {{ t('home.sections.triggers.title') }}
          </h2>
          <p class="card-desc">
            {{ t('home.sections.triggers.desc') }}
          </p>
        </div>
        <div class="card-footer">
          <span class="card-action-text">{{ t('home.sections.triggers.action') }}</span>
          <Icon icon="mdi:arrow-right" class="card-arrow-icon" />
        </div>
      </article>

      <!-- Records Card -->
      <article
        class="section-card card-records"
        role="button"
        tabindex="0"
        @click="navigateTo(`/${currentMapName}/records`)"
        @keydown.enter="navigateTo(`/${currentMapName}/records`)"
      >
        <div class="card-glow" />
        <div class="card-header">
          <div class="card-icon-wrapper icon-records">
            <Icon icon="mdi:trophy" />
          </div>
          <span class="card-badge">{{ t('home.sections.records.badge') }}</span>
        </div>
        <div class="card-body">
          <h2 class="card-title">
            {{ t('home.sections.records.title') }}
          </h2>
          <p class="card-desc">
            {{ t('home.sections.records.desc') }}
          </p>
        </div>
        <div class="card-footer">
          <span class="card-action-text">{{ t('home.sections.records.action') }}</span>
          <Icon icon="mdi:arrow-right" class="card-arrow-icon" />
        </div>
      </article>

      <!-- Editor Card -->
      <article
        class="section-card card-editor"
        role="button"
        tabindex="0"
        @click="navigateTo(`/${currentMapName}/editor`)"
        @keydown.enter="navigateTo(`/${currentMapName}/editor`)"
      >
        <div class="card-glow" />
        <div class="card-header">
          <div class="card-icon-wrapper icon-editor">
            <Icon icon="mdi:pencil-ruler" />
          </div>
          <span class="card-badge">{{ t('home.sections.editor.badge') }}</span>
        </div>
        <div class="card-body">
          <h2 class="card-title">
            {{ t('home.sections.editor.title') }}
          </h2>
          <p class="card-desc">
            {{ t('home.sections.editor.desc') }}
          </p>
        </div>
        <div class="card-footer">
          <span class="card-action-text">{{ t('home.sections.editor.action') }}</span>
          <Icon icon="mdi:arrow-right" class="card-arrow-icon" />
        </div>
      </article>

      <!-- FAQ Card -->
      <article
        class="section-card card-faq"
        role="button"
        tabindex="0"
        @click="navigateTo('/faq')"
        @keydown.enter="navigateTo('/faq')"
      >
        <div class="card-glow" />
        <div class="card-header">
          <div class="card-icon-wrapper icon-faq">
            <Icon icon="mdi:help-circle-outline" />
          </div>
          <span class="card-badge">{{ t('home.sections.faq.badge') }}</span>
        </div>
        <div class="card-body">
          <h2 class="card-title">
            {{ t('home.sections.faq.title') }}
          </h2>
          <p class="card-desc">
            {{ t('home.sections.faq.desc') }}
          </p>
        </div>
        <div class="card-footer">
          <span class="card-action-text">{{ t('home.sections.faq.action') }}</span>
          <Icon icon="mdi:arrow-right" class="card-arrow-icon" />
        </div>
      </article>

      <!-- Connect to Server Card -->
      <a
        href="steam://connect/194.147.90.131:27015"
        class="section-card card-server"
      >
        <div class="card-glow" />
        <div class="card-header">
          <div class="card-icon-wrapper icon-server">
            <Icon icon="mdi:server" />
          </div>
          <span class="card-badge">{{ t('home.sections.server.badge') }}</span>
        </div>
        <div class="card-body">
          <h2 class="card-title">
            {{ t('home.sections.server.title') }}
          </h2>
          <p class="card-desc">
            {{ t('home.sections.server.desc') }}
          </p>
        </div>
        <div class="card-footer">
          <span class="card-action-text">{{ t('home.sections.server.action') }}</span>
          <Icon icon="mdi:launch" class="card-arrow-icon" />
        </div>
      </a>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.view-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  max-width: var(--max-content-width);
  width: 100%;
  margin: 0 auto;
  padding: 32px 16px 64px;
}

// Hero Header
.home-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 720px;
  gap: 16px;
}

.home-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--fg-primary-color);
  margin: 0;
}

.home-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--fg-secondary-color);
  margin: 0;
  max-width: 600px;
}

// Server Badge
.home-server-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: var(--r-full, 9999px);
  margin-top: 4px;
  box-shadow: var(--s-s);
}

.server-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--fg-success-color, #56d364);
  box-shadow: 0 0 8px var(--fg-success-color, #56d364);
  animation: pulse-dot 2s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.85);
  }
}

.server-ip-label {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fg-primary-color);
  letter-spacing: 0.5px;
}

.server-copy-btn {
  background: none;
  border: none;
  color: var(--fg-secondary-color);
  font-size: 1rem;
  padding: 4px;
  border-radius: var(--r-xs, 4px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--fg-accent-color);
    background-color: var(--bg-hover-color);
  }
}

// Map Selector
.home-map-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.map-selector-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--fg-muted-color);
}

.map-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.map-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: var(--r-sm, 6px);
  color: var(--fg-secondary-color);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-hover-color);
    color: var(--fg-primary-color);
    border-color: var(--border-accent-color);
  }

  &.is-active {
    background-color: var(--bg-accent-overlay-color);
    color: var(--fg-accent-color);
    border-color: var(--border-accent-color);
    font-weight: 600;
  }
}

.map-chip-icon {
  font-size: 0.95rem;
}

// Sections Grid
.home-sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
}

@media (min-width: 1024px) {
  .home-sections-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

// Section Cards
.section-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: var(--r-lg, 14px);
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px);
    border-color: var(--border-accent-color);
    box-shadow: var(--s-m);

    .card-glow {
      opacity: 1;
    }

    .card-arrow-icon {
      transform: translateX(4px);
      color: var(--fg-accent-color);
    }

    .card-title {
      color: var(--fg-accent-color);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--border-focus-color);
    outline-offset: 2px;
  }
}

.card-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle at top right, var(--bg-accent-overlay-color), transparent 70%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--r-md, 10px);
  font-size: 1.5rem;
  background-color: var(--bg-tertiary-color);
  color: var(--fg-accent-color);
  transition: transform 0.2s ease;

  .section-card:hover & {
    transform: scale(1.08);
  }

  &.icon-tricks {
    color: #38bdf8;
    background-color: rgba(56, 189, 248, 0.12);
  }

  &.icon-triggers {
    color: #c084fc;
    background-color: rgba(192, 132, 252, 0.12);
  }

  &.icon-records {
    color: #fbbf24;
    background-color: rgba(251, 191, 36, 0.12);
  }

  &.icon-editor {
    color: #e879f9;
    background-color: rgba(232, 121, 249, 0.12);
  }

  &.icon-faq {
    color: #34d399;
    background-color: rgba(52, 211, 153, 0.12);
  }

  &.icon-server {
    color: #f43f5e;
    background-color: rgba(244, 63, 94, 0.12);
  }
}

.card-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--r-xs, 4px);
  background-color: var(--bg-tertiary-color);
  color: var(--fg-secondary-color);
  letter-spacing: 0.3px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--fg-primary-color);
  margin: 0;
  transition: color 0.2s ease;
}

.card-desc {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--fg-secondary-color);
  margin: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-secondary-color);
}

.card-action-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--fg-primary-color);
}

.card-arrow-icon {
  font-size: 1.15rem;
  color: var(--fg-secondary-color);
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

// Special styling for server card to stand out
.card-server {
  @media (min-width: 1024px) {
    grid-column: span 2;
  }
}
</style>
