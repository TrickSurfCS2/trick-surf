import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useToastStore } from './toast.store'

describe('toast.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds and removes toasts', () => {
    const store = useToastStore()
    expect(store.messages).toHaveLength(0)

    store.success('Success message')
    expect(store.messages).toHaveLength(1)
    expect(store.messages[0].type).toBe('success')
    expect(store.messages[0].detail).toBe('Success message')

    const id = store.messages[0].id
    store.remove(id)
    expect(store.messages).toHaveLength(0)
  })
})
