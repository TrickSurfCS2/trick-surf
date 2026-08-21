import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import { compression as Compression } from 'vite-plugin-compression2'
import { VitePWA } from 'vite-plugin-pwa'
import packageJson from '../package.json' with { type: 'json' }
import { autoImportOptionsCfg } from './cfg/auto-import.ts'
import { iconsCfg } from './cfg/icons.ts'
import { pwaCfg } from './cfg/pwa.ts'
import { visualizerPlugin } from './lib/helpers.ts'

const buildDate = new Date()
const buildRevision = buildDate.toISOString()
const appVersion = process.env.VITE_APP_VERSION || packageJson.version

function getVendorChunk(id: string): string | undefined {
  if (/[\\/]node_modules[\\/](?:vue|vue-router|pinia|@vueuse)[\\/]/.test(id))
    return 'vendor-core'
  if (id.includes('three') || id.includes('camera-controls'))
    return 'vendor-three'
  if (id.includes('@floating-ui') || id.includes('@iconify'))
    return 'vendor-ui'

  return 'vendor-others'
}

function getAppChunk(id: string): string | undefined {
  if (id.includes('/05.modules/scene/'))
    return 'app-scene'
  if (id.includes('/05.modules/tricks/'))
    return 'app-tricks'
  if (id.includes('/05.modules/triggers/'))
    return 'app-triggers'
  if (id.includes('/01.shared/locales/'))
    return 'app-locales'
}

export default defineConfig({
  base: '/',
  root: fileURLToPath(new URL('../src', import.meta.url)),
  publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  envDir: fileURLToPath(new URL('../', import.meta.url)),
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },

  resolve: {
    dedupe: ['vue', 'vue-i18n', 'vue-router', 'pinia', 'three'],
    alias: {
      '~': fileURLToPath(new URL('../src', import.meta.url)),
      '#': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },

  optimizeDeps: {
    include: ['vue', 'vue-i18n', 'vue-router', 'pinia', 'three', 'camera-controls', 'three-stdlib'],
  },

  plugins: [
    Vue(),
    AutoImport(autoImportOptionsCfg),
    Compression({
      algorithms: ['gzip'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    Compression({
      algorithms: ['brotliCompress'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    VitePWA(pwaCfg(buildRevision)),
    Icons(iconsCfg),
    ...visualizerPlugin('renderer'),
  ],

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '~/assets/scss/_setup.scss' as *;`,
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:4445',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    cssCodeSplit: true,
    outDir: fileURLToPath(new URL('../dist', import.meta.url)),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules'))
            return getVendorChunk(id)

          return getAppChunk(id)
        },
      },
    },
  },
})
