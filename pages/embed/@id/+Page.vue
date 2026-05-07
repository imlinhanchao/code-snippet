<template>
  <div class="min-h-screen bg-base-300 flex flex-col">
    <div v-if="loading" class="flex-1 flex items-center justify-center text-base-content/60">Loading...</div>
    <div v-else-if="errorMsg" class="flex-1 flex items-center justify-center">
      <div class="alert alert-error max-w-sm">{{ errorMsg }}</div>
    </div>
    <template v-else-if="snippet">
      <!-- Tab bar -->
      <div class="tabs tabs-bordered bg-base-100 px-2 border-b border-base-200 flex-shrink-0">
        <button
          v-for="(code, i) in snippet.codes"
          :key="code.id"
          class="tab tab-sm font-mono text-xs"
          :class="{ 'tab-active': activeTab === i }"
          @click="activeTab = i"
        >
          {{ code.filename }}
        </button>
      </div>
      <!-- Code view -->
      <div class="flex-1 overflow-auto">
        <CodeRender
          v-if="snippet.codes[activeTab]"
          :code="snippet.codes[activeTab]"
          :header="false"
          :only-source="false"
        />
        <div v-else class="p-4 text-base-content/50">{{ t('embed_no_codes') }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import CodeRender from '@components/CodeRender.vue'
import { usePageContext } from '../../../renderer/usePageContext'
import { useSnippetStore, type Snippet } from '@store/useSnippetStore'

const { t } = useI18n()
const pageContext = usePageContext()
const id = pageContext.routeParams?.id as string

const snippetStore = useSnippetStore()
const snippet = ref<Snippet | null>(null)
const loading = ref(true)
const errorMsg = ref('')
const activeTab = ref(0)

onMounted(async () => {
  loading.value = true
  try {
    const data = await snippetStore.getSnippet(id)
    snippet.value = data
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load snippet'
  } finally {
    loading.value = false
  }
})
</script>
