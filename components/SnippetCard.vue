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
          <router-link :to="`/s/${snippet.id}`" v-if="snippet.codes.length > 1">
            <p :title="$t('more')" class="more">
              <Icon type="ios-more"></Icon>
            </p>
          </router-link>
        </CodeRender>
      </div>
      <div class="flex items-center gap-4 mt-2 text-xs text-base-content/50">
        <span>{{ formatTime(snippet.create_time) }}</span>
        <span v-if="snippet.stars !== undefined">⭐ {{ snippet.stars }}</span>
        <span v-if="snippet.forks !== undefined">🍴 {{ snippet.forks }}</span>
        <span v-if="snippet.comments !== undefined">💬 {{ snippet.comments }}</span>
        <span v-if="snippet.codes">📄 {{ snippet.codes.length }} {{ t('files') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
