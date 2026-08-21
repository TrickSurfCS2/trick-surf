export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warn'
  detail: string
  title?: string
  expire: number
  swipeToClose?: boolean
}

export interface ToastOptions {
  title?: string
  expire?: number
  swipeToClose?: boolean
}
