<template>
  <AppLayout>
    <h1 class="text-xl font-bold mb-4">{{ t('explore') }}</h1>
    <div v-if="loading" class="text-base-content/60">Loading...</div>
    <div v-else-if="errorMsg" class="alert alert-error text-sm">{{ errorMsg }}</div>
    <div v-else-if="snippets.length === 0" class="text-base-content/60">{{ t('code_wasteland') }}</div>
    <div v-else class="grid gap-3">
      <SnippetCard v-for="snippet in snippets" :key="snippet.id" :snippet="snippet" />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@components/AppLayout.vue'
import SnippetCard from '@components/SnippetCard.vue'
import { useSnippetStore, type Snippet } from '@store/useSnippetStore'

const { t } = useI18n()
const snippetStore = useSnippetStore()
const snippets = ref<Snippet[]>([])
const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const rsp = await snippetStore.querySnippets({
      index: 0,
      count: 30,
      query: {},
      fields: ['id', 'username', 'description', 'language', 'private', 'create_time', 'codes', 'stars', 'forks', 'comments']
    })
    if (rsp?.state === 0) snippets.value = snippetStore.snippets
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load snippets'
  } finally {
    loading.value = false
  }
})
</script>
