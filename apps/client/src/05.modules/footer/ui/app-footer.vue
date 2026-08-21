<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<template>
  <footer class="app-footer">
    <div class="footer-wave-container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        class="footer-wave"
      >
        <path
          d="M0,64L24,69.3C48,75,96,85,144,74.7C192,64,240,32,288,48C336,64,384,128,432,170.7C480,213,528,235,576,240C624,245,672,235,720,192C768,149,816,75,864,58.7C912,43,960,85,1008,90.7C1056,96,1104,64,1152,74.7C1200,85,1248,139,1296,138.7C1344,139,1392,85,1416,58.7L1440,32L1440,320L1416,320C1392,320,1344,320,1296,320C1248,320,1200,320,1152,320C1104,320,1056,320,1008,320C960,320,912,320,864,320C816,320,768,320,720,320C672,320,624,320,576,320C528,320,480,320,432,320C384,320,336,320,288,320C240,320,192,320,144,320C96,320,48,320,24,320L0,320Z"
        />
      </svg>
    </div>

    <div class="footer-content">
      <div class="footer-inner">
        <div class="footer-links">
          <a
            href="https://discord.gg/nybZnuAsze"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
          >
            <Icon icon="mdi:discord" /> Discord
          </a>
          <span class="divider">|</span>
          <a
            href="https://vk.com/surfgxds"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
          >
            <Icon icon="mdi:vk" /> VK
          </a>
          <span class="divider">|</span>
          <a
            href="https://github.com/injurka"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
          >
            <Icon icon="mdi:github" /> GitHub
          </a>
          <span class="divider">|</span>
          <a href="steam://connect/194.147.90.131:27015" class="footer-link">
            <Icon icon="mdi:steam" /> Server
          </a>
          <span class="divider">|</span>
          <a
            href="https://www.youtube.com/channel/UCu-39MYQr8I7smURAUeYchw"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
          >
            <Icon icon="mdi:youtube" /> YouTube
          </a>
        </div>
        <div class="footer-copy">
          © 2026 SurfGxds. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  position: relative;
  width: 100%;
  margin-top: auto;
  background: transparent;
}

.footer-wave-container {
  position: relative;
  width: 100%;
  height: 56px;
  overflow: hidden;
  line-height: 0;
  pointer-events: none;
}

.footer-wave {
  display: block;
  width: 100%;
  height: 100%;
  vertical-align: bottom;
  margin-bottom: -1px;
  fill: var(--bg-secondary-color);

  path {
    fill: var(--bg-secondary-color);
  }
}

.footer-content {
  width: 100%;
  background-color: var(--bg-secondary-color);
  padding: 16px 16px 28px;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: var(--max-content-width);
  margin: 0 auto;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.9rem;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--fg-secondary-color);
  transition: color 0.2s ease;

  &:hover {
    color: var(--fg-accent-color);
  }
}

.divider {
  color: var(--border-primary-color);
}

.footer-copy {
  font-size: 0.8rem;
  color: var(--fg-muted-color);
}
</style>
