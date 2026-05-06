import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../src/api/client'

export interface Code {
  id: string
  filename: string
  content: string
  snippet: string
  order: number
  input: string
  command: string
  execute: boolean
}

export interface Snippet {
  id: string
  title: string
  description: string
  language: string
  input: string
  command: string
  execute: boolean
  private: boolean
  username: string
  fork_from: string
  create_time: number
  update_time: number
  codes: Code[]
  stars?: number
  stared?: boolean
  forks?: number
  comments?: number
  fork?: Snippet
}

export const useSnippetStore = defineStore('snippet', () => {
  const currentSnippet = ref<Snippet | null>(null)
  const snippets = ref<Snippet[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)

  async function getSnippet(id: string) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.get(`snippet/get/${id}`)
      const rsp = res.data
      if (rsp.state === 0) {
        currentSnippet.value = rsp.data
        return rsp.data as Snippet
      }
      return null
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch snippet'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function querySnippets(params: {
    index: number
    count: number
    query?: Record<string, any>
    fields?: string[]
  }) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.post('snippet/query', params)
      const rsp = res.data
      if (rsp.state === 0) {
        snippets.value = rsp.data?.data || []
        total.value = rsp.data?.total || 0
      }
      return rsp
    } catch (e: any) {
      error.value = e?.message || 'Failed to query snippets'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createSnippet(data: Partial<Snippet> & { codes: Code[] }) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.post('snippet/new', data)
      return res.data
    } catch (e: any) {
      error.value = e?.message || 'Failed to create snippet'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateSnippet(data: Partial<Snippet> & { id: string; codes: Code[] }) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.post('snippet/set', data)
      return res.data
    } catch (e: any) {
      error.value = e?.message || 'Failed to update snippet'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteSnippet(id: string) {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.post('snippet/del', { id })
      return res.data
    } catch (e: any) {
      error.value = e?.message || 'Failed to delete snippet'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function forkSnippet(id: string) {
    const res = await apiClient.post('snippet/fork', { id })
    return res.data
  }

  async function executeSnippet(data: { language: string; codes: { name: string; content: string }[]; input?: string; command?: string }) {
    const res = await apiClient.post('snippet/execute', data)
    return res.data
  }

  async function getChanges(id: string, index = 0, count = 20) {
    const res = await apiClient.get(`snippet/changes?id=${id}&index=${index}&count=${count}`)
    return res.data
  }

  return {
    currentSnippet,
    snippets,
    loading,
    error,
    total,
    getSnippet,
    querySnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    forkSnippet,
    executeSnippet,
    getChanges
  }
})
