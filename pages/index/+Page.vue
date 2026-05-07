<template>
  <AppLayout>
    <div v-if="loading" class="text-base-content/60">Loading...</div>
    <div v-else-if="errorMsg" class="alert alert-error text-sm">{{ errorMsg }}</div>
    <template v-if="accountStore.account">
      <h1 class="text-xl font-bold mb-4">{{ t('home') }}</h1>
      <div v-if="feedItems.length === 0" class="text-base-content/60">{{ t('no_feeds') }}</div>
      <div v-else class="bg-base-100 rounded-lg px-4">
        <FeedItem v-for="item in feedItems" :key="item.id" :activity="item" />
      </div>
    </template>
    <div class="mt-8" v-else>
      <h2 class="text-lg font-semibold mb-3">{{ t('explore') }}</h2>
      <div class="grid gap-3">
        <SnippetCard v-for="snippet in snippets" :key="snippet.id" :snippet="snippet" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AppLayout from '@components/AppLayout.vue'
import FeedItem from '@components/FeedItem.vue'
import SnippetCard from '@components/SnippetCard.vue'

import { useAccountStore } from '@store/useAccountStore'
import { useSnippetStore, type Snippet } from '@store/useSnippetStore'

const { t } = useI18n()
const accountStore = useAccountStore()
const snippetStore = useSnippetStore()

const loading = ref(true)
const errorMsg = ref('')
const feedItems = ref<any[]>([])
const snippets = ref<Snippet[]>([])

onMounted(async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await accountStore.fetchInfo()
    if (accountStore.account) {
      const rsp = await accountStore.getActivities({ count: 20 })
      if (rsp?.state === 0 && Array.isArray(rsp.data)) {
        feedItems.value = rsp.data
      }
    }
    const listRsp = await snippetStore.querySnippets({
      index: 0,
      count: 20,
      query: {},
      fields: ['id', 'username', 'description', 'language', 'private', 'create_time', 'codes', 'stars', 'forks', 'comments']
    })
    if (listRsp?.state === 0) {
      snippets.value = snippetStore.snippets
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
})
</script>
