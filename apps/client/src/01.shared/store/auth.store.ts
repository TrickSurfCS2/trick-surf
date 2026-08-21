import type { UserItem } from '~/01.shared/types/models'
import { defineStore } from 'pinia'
import { defaultRepositories } from '~/00.plugins/di'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserItem | null>(null)
  const isAuthReady = ref(false)

  const isAuth = computed(() => !!user.value?.login)

  function init() {
    isAuthReady.value = true
  }

  async function checkAuth() {
    try {
      const data = await defaultRepositories.auth.me()
      user.value = data
    }
    catch {
      user.value = null
    }
    finally {
      isAuthReady.value = true
    }
  }

  function logout() {
    user.value = null
    if (typeof localStorage !== 'undefined')
      localStorage.removeItem('trick_surf_token')
  }

  return {
    user,
    isAuthReady,
    isAuth,
    init,
    checkAuth,
    logout,
  }
})
