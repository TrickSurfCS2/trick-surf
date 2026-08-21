import type { VitePWA } from 'vite-plugin-pwa'

export function pwaCfg(revision: string) {
  return {
    strategies: 'generateSW',
    registerType: 'prompt',
    base: '/',
    scope: '/',
    includeAssets: ['icons/favicon.ico'],
    manifest: {
      name: 'SurfGxds - TrickSurf',
      short_name: 'SurfGxds',
      description: 'Trick Surf CS2 Community & Leaderboards',
      theme_color: '#0d1117',
      background_color: '#0d1117',
      lang: 'en',
      icons: [{
        src: 'icons/favicon.ico',
        sizes: '64x64',
        type: 'image/x-icon',
      }],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,json,css,html,txt,svg,png,ico,webp,woff,woff2,ttf,eot,otf,wasm,glb,hdr}'],
      maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
      additionalManifestEntries: [{
        url: '/',
        revision,
      }],
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  } satisfies Parameters<typeof VitePWA>[0]
}
