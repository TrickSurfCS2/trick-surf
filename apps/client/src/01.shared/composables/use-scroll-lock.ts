export function useAppScrollLock() {
  const isLocked = ref(false)

  function lock() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
      isLocked.value = true
    }
  }

  function unlock() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
      isLocked.value = false
    }
  }

  return {
    isLocked,
    lock,
    unlock,
  }
}
