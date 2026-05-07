<template>
  <div class="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow">
    <div class="card-body p-4">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <img :src="`/api/account/avatar/${snippet.username}`" class="w-6 h-6 rounded-full" />
          <a :href="`/u/${snippet.username}`" class="text-sm text-base-content/70 hover:text-primary shrink-0">
            {{ snippet.username }}
          </a>
          <span class="text-base-content/40">/</span>
          <a :href="`/s/${snippet.id}`" class="font-semibold text-sm truncate hover:text-primary">
            {{ firstFilename }}
          </a>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span v-if="snippet.private" class="badge badge-warning badge-xs">{{ t('private') }}</span>
          <span v-if="snippet.language" class="badge badge-ghost badge-xs">{{ snippet.language }}</span>
        </div>
      </div>
      <p v-if="snippet.description" class="text-sm text-base-content/60 mt-1 line-clamp-2">
        {{ snippet.description }}
      </p>
      <div v-if="snippet.codes && snippet.codes.length > 0">
        <CodeRender :code="snippet.codes[0]" :snippet="snippet" class="code" :max-height="200">
          <a :href="`/s/${snippet.id}`" v-if="snippet.codes.length > 1">
            <p :title="$t('more')" class="more">
              <Icon icon="solar:menu-dots-bold"></Icon>
            </p>
          </a>
        </CodeRender>
      </div>
      <div class="flex items-center gap-4 mt-2 text-xs text-base-content/50">
        <span>{{ formatTime(snippet.create_time) }}</span>
        <span v-if="snippet.stars !== undefined" class="inline-flex items-center gap-1"><Icon icon="solar:star-outline" /> {{ snippet.stars }}</span>
        <span v-if="snippet.forks !== undefined" class="inline-flex items-center gap-1"><Icon icon="solar:code-square-outline" /> {{ snippet.forks }}</span>
        <span v-if="snippet.comments !== undefined" class="inline-flex items-center gap-1"><Icon icon="solar:chat-round-dots-outline" /> {{ snippet.comments }}</span>
        <span v-if="snippet.codes" class="inline-flex items-center gap-1"><Icon icon="solar:document-text-outline" /> {{ snippet.codes.length }} {{ t('files') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import type { Snippet } from '../store/useSnippetStore'
import CodeRender from '@components/CodeRender.vue'

const props = defineProps<{ snippet: Snippet }>()
const { t } = useI18n()

const firstFilename = computed(() => props.snippet.codes?.[0]?.filename || props.snippet.title || 'Untitled')

function formatTime(ts: number) {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleDateString()
}
</script>
