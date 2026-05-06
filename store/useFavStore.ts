import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../src/api/client'

export interface Fav {
  username: string
  snippet: string
  create_time: number
  update_time: number
}

export const useFavStore = defineStore('fav', () => {
  const favs = ref<Fav[]>([])
  const loading = ref(false)

  async function getFavs(snippetId: string) {
    const res = await apiClient.get(`fav/get/${snippetId}`)
    const rsp = res.data
    if (rsp.state === 0) {
      return rsp.data as Fav[]
    }
    return []
  }

  async function queryFavs(params: {
    index: number
    count: number
    query: Record<string, any>
  }) {
    const res = await apiClient.post('fav/query', params)
    return res.data
  }

  async function addFav(snippetId: string) {
    const res = await apiClient.post('fav/new', { snippet: snippetId })
    return res.data
  }

  async function removeFav(snippetId: string) {
    const res = await apiClient.post('fav/del', { snippet: snippetId })
    return res.data
  }

  return {
    favs,
    loading,
    getFavs,
    queryFavs,
    addFav,
    removeFav
  }
})
