import type { ToastMessage, ToastOptions } from '~/01.shared/types/models/toast'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useToastStore = defineStore('toast', () => {
  const messages = ref<ToastMessage[]>([])

  function add(message: Omit<Partial<ToastMessage>, 'id'>) {
    const id = uuidv4()
    const defaults: ToastMessage = {
      id,
      type: 'info',
      detail: '',
      expire: 5000,
      swipeToClose: true,
    }

    const finalMessage: ToastMessage = { ...defaults, ...message }
    messages.value.push(finalMessage)

    if (finalMessage.expire > 0) {
      setTimeout(() => {
        remove(id)
      }, finalMessage.expire)
    }
  }

  function remove(id: string) {
    const index = messages.value.findIndex(m => m.id === id)
    if (index !== -1)
      messages.value.splice(index, 1)
  }

  function success(detail: string, options: ToastOptions = {}) {
    add({ type: 'success', detail, ...options })
  }

  function error(detail: string, options: ToastOptions = {}) {
    add({ type: 'error', detail, ...options })
  }

  function info(detail: string, options: ToastOptions = {}) {
    add({ type: 'info', detail, ...options })
  }

  function warn(detail: string, options: ToastOptions = {}) {
    add({ type: 'warn', detail, ...options })
  }

  return {
    messages,
    add,
    remove,
    success,
    error,
    info,
    warn,
  }
})
