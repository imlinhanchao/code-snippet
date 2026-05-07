<template>
  <AppLayout>
    <div v-if="loading" class="text-base-content/60">Loading...</div>
    <div v-else-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
    <template v-else-if="user">
      <!-- Profile header -->
      <div class="bg-base-100 rounded-lg border border-base-200 p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start">
        <img :src="`/api/account/avatar/${user.username}`" class="w-20 h-20 rounded-full flex-shrink-0" :alt="user.username" />
        <div class="flex-1">
          <h1 class="text-xl font-bold">{{ user.nickname || user.username }}</h1>
          <p class="text-base-content/60 text-sm">@{{ user.username }}</p>
          <p v-if="user.motto" class="text-base-content/70 text-sm mt-1">{{ user.motto }}</p>
          <div class="flex flex-wrap gap-3 mt-2 text-sm text-base-content/60">
            <span v-if="user.company">🏢 {{ user.company }}</span>
            <span v-if="user.location">📍 {{ user.location }}</span>
            <a v-if="user.url" :href="user.url" target="_blank" class="link link-primary">🔗 {{ user.url }}</a>
          </div>
          <div class="mt-3" v-if="accountStore.account && accountStore.account.username !== user.username">
            <button class="btn btn-sm" :class="isFollowing ? 'btn-outline' : 'btn-primary'" @click="toggleFollow">
              {{ isFollowing ? t('unfollow') : t('follow') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs tabs-bordered mb-4">
        <button class="tab" :class="{ 'tab-active': tab === 'snippets' }" @click="tab = 'snippets'">
          {{ t('snippets') }} ({{ snippets.length }})
        </button>
        <button class="tab" :class="{ 'tab-active': tab === 'stars' }" @click="loadStars(); tab = 'stars'">
          {{ t('star') }} ({{ starredSnippets.length }})
        </button>
        <button class="tab" :class="{ 'tab-active': tab === 'forks' }" @click="loadForks(); tab = 'forks'">
          {{ t('fork') }} ({{ forkedSnippets.length }})
        </button>
      </div>

      <div class="grid gap-3">
        <template v-if="tab === 'snippets'">
          <div v-if="snippets.length === 0" class="text-base-content/60">{{ t('code_wasteland') }}</div>
          <SnippetCard v-for="s in snippets" :key="s.id" :snippet="s" />
        </template>
        <template v-if="tab === 'stars'">
          <div v-if="starredSnippets.length === 0" class="text-base-content/60">{{ t('no_star') }}</div>
          <SnippetCard v-for="s in starredSnippets" :key="s.id" :snippet="s" />
        </template>
        <template v-if="tab === 'forks'">
          <div v-if="forkedSnippets.length === 0" class="text-base-content/60">{{ t('no_fork') }}</div>
          <SnippetCard v-for="s in forkedSnippets" :key="s.id" :snippet="s" />
        </template>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@components/AppLayout.vue'
import SnippetCard from '@components/SnippetCard.vue'
import { usePageContext } from '../../../renderer/usePageContext'
import { useAccountStore } from '@store/useAccountStore'
import { useSnippetStore, type Snippet } from '@store/useSnippetStore'
import { useFavStore } from '@store/useFavStore'
import apiClient from '../../../src/api/client'

const { t } = useI18n()
const pageContext = usePageContext()
const username = pageContext.routeParams?.username as string

const accountStore = useAccountStore()
const snippetStore = useSnippetStore()
const favStore = useFavStore()

const user = ref<any>(null)
const loading = ref(true)
const errorMsg = ref('')
const tab = ref('snippets')
const isFollowing = ref(false)
const snippets = ref<Snippet[]>([])
const starredSnippets = ref<Snippet[]>([])
const forkedSnippets = ref<Snippet[]>([])

onMounted(async () => {
  loading.value = true
  try {
    await accountStore.fetchInfo()
    const rsp = await accountStore.queryUser({ username: [username] })
    if (rsp?.state === 0 && rsp.data?.length) {
      user.value = rsp.data[0]
    } else {
      errorMsg.value = t('not_exist_user')
      return
    }
    // load user snippets
    const snippetRsp = await snippetStore.querySnippets({
      index: 0, count: 30,
      query: { username },
      fields: ['id', 'username', 'description', 'language', 'private', 'create_time', 'codes', 'stars', 'forks', 'comments']
    })
    if (snippetRsp?.state === 0) snippets.value = snippetStore.snippets

    // check following
    if (accountStore.account && accountStore.account.username !== username) {
      const followRsp = await accountStore.getFollowing()
      if (followRsp?.state === 0 && Array.isArray(followRsp.data)) {
        isFollowing.value = followRsp.data.some((u: any) => u.username === username || u === username)
      }
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
})

async function loadStars() {
  if (starredSnippets.value.length) return
  // Query favs for this user, then load the starred snippets
  const rsp = await favStore.queryFavs({ index: 0, count: 30, query: { username } })
  if (rsp?.state === 0 && Array.isArray(rsp.data?.data)) {
    const snippetIds = rsp.data.data.map((f: any) => f.snippet).filter(Boolean)
    if (snippetIds.length > 0) {
      const snippetRsp = await apiClient.post('snippet/query', {
        index: 0, count: 30,
        query: { id: snippetIds },
        fields: ['id', 'username', 'description', 'language', 'private', 'create_time', 'codes', 'stars', 'forks', 'comments']
      })
      if (snippetRsp.data?.state === 0) starredSnippets.value = snippetRsp.data?.data?.data ?? []
    }
  }
}

async function loadForks() {
  if (forkedSnippets.value.length) return
  // Snippets forked by this user have username === this user and fork_from is non-empty
  const rsp = await snippetStore.querySnippets({
    index: 0, count: 30,
    query: { username, fork_from: '!empty' },
    fields: ['id', 'username', 'description', 'language', 'private', 'create_time', 'codes', 'stars', 'forks', 'comments']
  })
  if (rsp?.state === 0) forkedSnippets.value = snippetStore.snippets
}

async function toggleFollow() {
  const rsp = await accountStore.follow(username, !isFollowing.value)
  if (rsp?.state === 0) isFollowing.value = !isFollowing.value
}
</script>
