export function useTracking() {
  function trackEvent(_name: string, _data?: Record<string, unknown>) {}

  function trackPageview(_path: string, _name?: string) {}

  return {
    trackEvent,
    trackPageview,
  }
}

export function useGlobalTracking() {
  return useTracking()
}
