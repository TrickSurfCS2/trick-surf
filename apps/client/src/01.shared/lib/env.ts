/** Рантайм-конфиг, генерируется entrypoint'ом контейнера при запуске (/configs/app-config.js) */
interface AppRuntimeConfig {
  API_URL?: string
  OTEL_EXPORTER_OTLP_ENDPOINT?: string
  CDN_URL?: string
}

const runtimeConfig = (window as { __APP_CONFIG__?: AppRuntimeConfig }).__APP_CONFIG__

/** Базовый URL API: рантайм-конфиг контейнера → env при сборке */
export const API_URL = runtimeConfig?.API_URL || import.meta.env.VITE_API_URL || ''

/** OTLP-эндпоинт (SigNoz ingester): рантайм-конфиг → env при сборке */
export const OTEL_EXPORTER_OTLP_ENDPOINT = runtimeConfig?.OTEL_EXPORTER_OTLP_ENDPOINT || import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || ''

/** Базовый URL CDN для раздачи ассетов */
export const CDN_URL = runtimeConfig?.CDN_URL || import.meta.env.VITE_CDN_URL || ''

export const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|windows phone|windows mobile|kindle|silk|fennec|mobile|tablet/i.test(navigator.userAgent)
