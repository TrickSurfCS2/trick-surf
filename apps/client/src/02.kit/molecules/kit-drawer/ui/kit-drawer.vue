<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useAppScrollLock } from '~/01.shared/composables/use-scroll-lock'

interface Props {
  title?: string
  width?: string
  placement?: 'left' | 'right'
}

withDefaults(defineProps<Props>(), {
  title: '',
  width: '320px',
  placement: 'left',
})

const isOpen = defineModel<boolean>({ default: false })
const { lock, unlock } = useAppScrollLock()

watch(isOpen, (val) => {
  if (val)
    lock()
  else
    unlock()
})

function close() {
  isOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="kit-drawer-backdrop" @click="close" />
    </Transition>

    <Transition :name="placement === 'right' ? 'drawer-slide-right' : 'drawer-slide-left'">
      <div
        v-if="isOpen"
        class="kit-drawer-content"
        :class="`is-${placement}`"
        :style="{ width, maxWidth: '85vw' }"
      >
        <div class="kit-drawer-header">
          <h3 class="kit-drawer-title">
            {{ title }}
          </h3>
          <button
            type="button"
            class="kit-drawer-close"
            aria-label="Close drawer"
            @click="close"
          >
            <Icon icon="mdi:close" />
          </button>
        </div>

        <div class="kit-drawer-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="kit-drawer-actions">
          <slot name="footer" />
        </div>

        <!-- Wave on the outer sliding edge of the drawer -->
        <div class="kit-drawer-footer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            class="drawer-wave"
          >
            <path
              d="M0,64L24,69.3C48,75,96,85,144,74.7C192,64,240,32,288,48C336,64,384,128,432,170.7C480,213,528,235,576,240C624,245,672,235,720,192C768,149,816,75,864,58.7C912,43,960,85,1008,90.7C1056,96,1104,64,1152,74.7C1200,85,1248,139,1296,138.7C1344,139,1392,85,1416,58.7L1440,32L1440,320L1416,320C1392,320,1344,320,1296,320C1248,320,1200,320,1152,320C1104,320,1056,320,1008,320C960,320,912,320,864,320C816,320,768,320,720,320C672,320,624,320,576,320C528,320,480,320,432,320C384,320,336,320,288,320C240,320,192,320,144,320C96,320,48,320,24,320L0,320Z"
            />
          </svg>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.kit-drawer-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: var(--z-drawer, 900);
}

.kit-drawer-content {
  position: fixed;
  top: 0;
  bottom: 0;
  background-color: var(--bg-secondary-color);
  z-index: calc(var(--z-drawer, 900) + 1);
  display: flex;
  flex-direction: column;
  box-shadow: var(--s-l);

  &.is-left {
    left: 0;
    right: auto;
  }

  &.is-right {
    right: 0;
    left: auto;
  }
}

.kit-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-secondary-color);
}

.kit-drawer-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--fg-primary-color);
}

.kit-drawer-close {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: var(--fg-secondary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--fg-primary-color);
  }
}

.kit-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.kit-drawer-actions {
  padding: 16px;
  border-top: 1px solid var(--border-secondary-color);
}

// Side edge wave using the exact wave SVG
.kit-drawer-footer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 48px;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 1;

  .is-left & {
    right: -48px;
    left: auto;
  }

  .is-right & {
    left: -48px;
    right: auto;
  }

  .drawer-wave {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vh;
    height: 48px;
    transform-origin: 0 0;
    transform: rotate(90deg) translateY(-48px);
    fill: var(--bg-secondary-color);
    display: block;

    path {
      fill: var(--bg-secondary-color);
    }
  }

  .is-right & .drawer-wave {
    top: 100%;
    transform: rotate(-90deg) translateY(0);
  }
}

.drawer-slide-left-enter-active,
.drawer-slide-left-leave-active,
.drawer-slide-right-enter-active,
.drawer-slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.drawer-slide-left-enter-from,
.drawer-slide-left-leave-to {
  transform: translateX(-100%);
}

.drawer-slide-right-enter-from,
.drawer-slide-right-leave-to {
  transform: translateX(100%);
}
</style>
