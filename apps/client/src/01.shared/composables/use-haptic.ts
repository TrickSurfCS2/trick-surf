export function useHaptic() {
  const vibrate = (pattern: number | number[] = 50) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern)
      }
      catch {}
    }
  }

  const hapticLight = () => vibrate(10)
  const hapticMedium = () => vibrate(40)
  const hapticHeavy = () => vibrate([50, 100, 50])

  return {
    vibrate,
    hapticLight,
    hapticMedium,
    hapticHeavy,
  }
}
