import { useToastStore } from '~/01.shared/store/toast.store'

export function useToast() {
  const toastStore = useToastStore()

  return {
    success: toastStore.success,
    error: toastStore.error,
    info: toastStore.info,
    warn: toastStore.warn,
  }
}
