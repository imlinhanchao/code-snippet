import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../src/api/client'

export interface Comment {
  id: string
  username: string
  content: string
  snippet: string
  reply: string
  create_time: number
  update_time: number
}

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)

  async function getComments(snippetId: string) {
    loading.value = true
    try {
      const res = await apiClient.get(`comment/get/${snippetId}`)
      const rsp = res.data
      if (rsp.state === 0) {
        comments.value = rsp.data || []
        return rsp.data as Comment[]
      }
      return []
    } finally {
      loading.value = false
    }
  }

  async function queryComments(params: {
    index: number
    count: number
    query: Record<string, any>
    order?: any[]
  }) {
    const res = await apiClient.post('comment/query', params)
    return res.data
  }

  async function createComment(data: { content: string; snippet: string; reply?: string }) {
    const res = await apiClient.post('comment/new', data)
    const rsp = res.data
    if (rsp.state === 0 && rsp.data) {
      comments.value.push(rsp.data)
    }
    return rsp
  }

  async function updateComment(data: { id: string; content: string }) {
    const res = await apiClient.post('comment/set', data)
    return res.data
  }

  async function deleteComment(id: string) {
    const res = await apiClient.post('comment/del', { id })
    if (res.data.state === 0) {
      comments.value = comments.value.filter(c => c.id !== id)
    }
    return res.data
  }

  return {
    comments,
    loading,
    getComments,
    queryComments,
    createComment,
    updateComment,
    deleteComment
  }
})
