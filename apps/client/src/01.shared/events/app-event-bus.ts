type EventHandler<T = unknown> = (payload: T) => void

export class AppEventBus {
  private listeners = new Map<string, Set<EventHandler<unknown>>>()

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event))
      this.listeners.set(event, new Set())

    this.listeners.get(event)!.add(handler as EventHandler<unknown>)

    return () => this.off(event, handler)
  }

  off<T>(event: string, handler: EventHandler<T>): void {
    const set = this.listeners.get(event)
    if (set) {
      set.delete(handler as EventHandler<unknown>)
      if (set.size === 0)
        this.listeners.delete(event)
    }
  }

  emit<T>(event: string, payload?: T): void {
    const set = this.listeners.get(event)
    if (set) {
      set.forEach((handler) => {
        try {
          handler(payload)
        }
        catch (err) {
          console.error(`[EventBus] Error in handler for event "${event}":`, err)
        }
      })
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const appEventBus = new AppEventBus()
