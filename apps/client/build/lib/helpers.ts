import type { PluginOption } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export function visualizerPlugin(title: string): PluginOption[] {
  const isAnalyze = process.env.ANALYZE === 'true' || process.env.ANALYZE === '1'

  if (isAnalyze) {
    return [
      visualizer({
        open: true,
        title: `Bundle Visualizer - ${title}`,
        filename: `dist/stats-${title}.html`,
        gzipSize: true,
        brotliSize: true,
      }),
    ]
  }

  return []
}
