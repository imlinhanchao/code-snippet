import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../src/api/client'

export interface Account {
  id: string
  username: string
  nickname: string
  email: string
  company: string
  location: string
  url: string
  motto: string
  avatar: string
  verify: boolean
  lastlogin: number
}

export interface Activity {
  id: string
  type: string
  username: string
  target: string
  content: string
  create_time: number
  readed: boolean
}

export const useAccountStore = defineStore('account', () => {
  const account = ref<Account | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!account.value)

  async function fetchInfo() {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.get('account/info')
      const rsp = res.data
      if (rsp.state === 0) {
        account.value = rsp.data
      } else {
        account.value = null
      }
      return rsp
    } catch {
      account.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(username: string, passwd: string, captcha: string) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.post('account/login', { username, passwd, captcha })
      const rsp = res.data
      if (rsp.state === 0) {
        account.value = rsp.data
      }
      return rsp
    } catch (e: any) {
      error.value = e?.message || 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await apiClient.get('account/logout')
    } finally {
      account.value = null
    }
  }

  async function register(data: { username: string; passwd: string; email?: string; captcha: string }) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.post('account/create', data)
      return res.data
    } catch (e: any) {
      error.value = e?.message || 'Registration failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(data: Partial<Account> & { passwd?: string; oldpasswd?: string }) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.post('account/update', data)
      const rsp = res.data
      if (rsp.state === 0 && account.value) {
        account.value = { ...account.value, ...rsp.data }
      }
      return rsp
    } catch (e: any) {
      error.value = e?.message || 'Update failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function queryUser(query: { username?: string[] }) {
    const res = await apiClient.post('account/query', query)
    return res.data
  }

  async function follow(target: string, doFollow = true) {
    const res = await apiClient.post('account/follow', { target, follow: doFollow })
    return res.data
  }

  async function getFollowing() {
    const res = await apiClient.post('account/following', {})
    return res.data
  }

  async function getFollowers() {
    const res = await apiClient.post('account/follower', {})
    return res.data
  }

  async function getActivities(params: { lastTime?: number; count?: number; type?: string }) {
    const res = await apiClient.post('account/activities', params)
    return res.data
  }

  async function markReaded(data: { id?: string }) {
    const res = await apiClient.post('account/makereaded', data)
    return res.data
  }

  async function sendVerify(username: string, email: string) {
    const res = await apiClient.post('account/sendverify', { username, email })
    return res.data
  }

  async function verifyEmail(username: string, token: string) {
    const res = await apiClient.post('account/verify', { username, token })
    return res.data
  }

  function avatarUrl(username: string) {
    return `/api/account/avatar/${username}`
  }

  return {
    account,
    loading,
    error,
    isLoggedIn,
    fetchInfo,
    login,
    logout,
    register,
    update,
    queryUser,
    follow,
    getFollowing,
    getFollowers,
    getActivities,
    markReaded,
    sendVerify,
    verifyEmail,
    avatarUrl
  }
})
