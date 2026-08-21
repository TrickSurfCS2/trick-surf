type BackHandler = () => boolean

const handlers: BackHandler[] = []

export function useBackHandler() {
  function registerBackHandler(handler: BackHandler) {
    handlers.push(handler)

    onUnmounted(() => {
      const idx = handlers.indexOf(handler)
      if (idx !== -1)
        handlers.splice(idx, 1)
    })
  }

  function triggerBack(): boolean {
    for (let i = handlers.length - 1; i >= 0; i--) {
      const handled = handlers[i]()
      if (handled)
        return true
    }

    return false
  }

  return {
    registerBackHandler,
    triggerBack,
  }
}
