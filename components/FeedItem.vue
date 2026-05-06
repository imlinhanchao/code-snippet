<template>
  <div class="flex items-start gap-3 py-3 border-b border-base-200">
    <img :src="`/api/account/avatar/${activity.username}`" class="w-8 h-8 rounded-full shrink-0" />
    <div class="min-w-0 flex-1">
      <div class="text-sm">
        <a :href="`/u/${activity.username}`" class="font-semibold hover:text-primary">{{ activity.username }}</a>
        <span class="text-base-content/60 mx-1">{{ actionText }}</span>
        <template v-if="snippetData">
          <a :href="`/s/${snippetData.id}`" class="font-medium hover:text-primary">
            {{ snippetData.username }} / {{ snippetData.codes?.[0]?.filename || snippetData.title }}
          </a>
        </template>
        <template v-else-if="activity.description && activity.type === 5">
          <a :href="`/u/${activity.description}`" class="font-semibold hover:text-primary">{{ activity.description }}</a>
        </template>
      </div>
      <div class="text-xs text-base-content/40 mt-1">{{ formatTime(activity.create_time) }}</div>
    </div>
    <div v-if="!activity.readed && activity.notice" class="badge badge-primary badge-xs shrink-0 mt-1"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  activity: {
    id: string
    username: string
    type: number
    snippet: any
    source: any
    target: string
    notice: string
    readed: boolean
    description: string
    create_time: number
  }
}>()

const { t } = useI18n()

const snippetData = computed(() => {
  if (!props.activity.snippet) return null
  if (typeof props.activity.snippet === 'object') return props.activity.snippet
  return null
})

const actionText = computed(() => {
  switch (props.activity.type) {
    case 0: return t('created_snippet')
    case 1: return t('stared_snippet')
    case 2: return t('forked_snippet')
    case 3: return t('reply_your_comment')
    case 4: return t('comment_your_snippet')
    case 5: return t('followed')
    default: return ''
  }
})

function formatTime(ts: number) {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleString()
}
</script>
