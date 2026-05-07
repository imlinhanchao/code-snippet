<template>
  <AppLayout>
    <div v-if="loading" class="text-base-content/60">Loading...</div>
    <div v-else-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
    <template v-else-if="snippet">
      <!-- Header -->
      <div class="bg-base-100 rounded-lg border border-base-200 p-4 mb-4">
        <div class="flex items-center gap-2 text-lg font-semibold flex-wrap">
          <img :src="`/api/account/avatar/${snippet.username}`" class="w-8 h-8 rounded-full" :alt="snippet.username" />
          <a :href="`/u/${snippet.username}`" class="link link-hover">{{ snippet.username }}</a>
          <span class="text-base-content/40">/</span>
          <span class="font-mono">{{ snippet.codes?.[0]?.filename ?? '' }}</span>
          <span v-if="snippet.private" class="badge badge-warning badge-sm ml-1">{{ t('private') }}</span>
        </div>
        <p v-if="snippet.description" class="text-base-content/70 mt-2 text-sm">{{ snippet.description }}</p>
        <p v-if="snippet.fork" class="text-base-content/50 text-xs mt-1">
          {{ t('fork_from') }}
          <a :href="`/s/${snippet.fork.id}`" class="link link-hover">{{ snippet.fork.username }} / {{ snippet.fork.codes?.[0]?.filename }}</a>
        </p>
        <p v-else class="text-base-content/40 text-xs mt-1">
          {{ t('create_at') }} {{ new Date((snippet.create_time ?? 0) * 1000).toLocaleString() }}
        </p>

        <!-- Actions -->
        <div class="flex items-center gap-2 mt-3 flex-wrap">
          <button class="btn btn-sm" :class="snippet.stared ? 'btn-warning' : 'btn-outline'" @click="onStar">
            ★ {{ t('star') }} <span class="badge badge-sm ml-1">{{ snippet.stars ?? 0 }}</span>
          </button>
          <button class="btn btn-sm btn-outline" @click="onFork">
            ⑂ {{ t('fork') }} <span class="badge badge-sm ml-1">{{ snippet.forks ?? 0 }}</span>
          </button>
          <template v-if="isOwner">
            <a :href="`/editor/${snippet.id}`" class="btn btn-sm btn-outline">{{ t('edit') }}</a>
            <button class="btn btn-sm btn-error btn-outline" @click="onDelete">{{ t('delete') }}</button>
          </template>
        </div>
      </div>

      <!-- Code files -->
      <div class="flex flex-col gap-4 mb-6">
        <CodeRender
          v-for="code in snippet.codes"
          :key="code.id"
          :code="code"
          :snippet="snippet"
        />
      </div>

      <!-- Comments -->
      <div class="bg-base-100 rounded-lg border border-base-200 p-4">
        <h2 class="font-semibold mb-3">{{ t('comment') }} ({{ snippet.comments ?? 0 }})</h2>
        <div v-if="!accountStore.account" class="text-base-content/50 text-sm">
          <a href="/login" class="link link-primary">{{ t('login') }}</a> to comment.
        </div>
        <div v-else class="flex gap-2">
          <textarea v-model="commentText" class="textarea textarea-bordered flex-1 text-sm" rows="3" :placeholder="t('leave_comment')" />
          <button class="btn btn-primary btn-sm self-end" :disabled="commentLoading" @click="onComment">
            {{ t('comment') }}
          </button>
        </div>
        <div v-if="comments.length" class="mt-4 flex flex-col gap-3">
          <div v-for="c in comments" :key="c.id" class="flex gap-3 items-start">
            <img :src="`/api/account/avatar/${c.username}`" class="w-8 h-8 rounded-full flex-shrink-0" :alt="c.username" />
            <div class="flex-1">
              <div class="text-sm font-medium">{{ c.username }}</div>
              <div class="text-sm text-base-content/80 whitespace-pre-wrap">{{ c.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@components/AppLayout.vue'
import CodeRender from '@components/CodeRender.vue'
import { usePageContext } from '../../../renderer/usePageContext'
import { useAccountStore } from '@store/useAccountStore'
import { useSnippetStore, type Snippet } from '@store/useSnippetStore'
import { useCommentStore } from '@store/useCommentStore'
import { useFavStore } from '@store/useFavStore'

const { t } = useI18n()
const pageContext = usePageContext()
const id = pageContext.routeParams?.id as string

const accountStore = useAccountStore()
const snippetStore = useSnippetStore()
const commentStore = useCommentStore()
const favStore = useFavStore()

const snippet = ref<Snippet | null>(null)
const loading = ref(true)
const errorMsg = ref('')
const commentText = ref('')
const commentLoading = ref(false)
const comments = ref<any[]>([])

const isOwner = computed(() => accountStore.account?.username === snippet.value?.username)

onMounted(async () => {
  loading.value = true
  try {
    await accountStore.fetchInfo()
    const data = await snippetStore.getSnippet(id)
    snippet.value = data
    // load comments using comment store
    const commentData = await commentStore.getComments(id)
    comments.value = commentData
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load snippet'
  } finally {
    loading.value = false
  }
})

async function onStar() {
  if (!snippet.value) return
  if (snippet.value.stared) {
    const rsp = await favStore.removeFav(snippet.value.id)
    if (rsp?.state === 0) {
      snippet.value.stared = false
      snippet.value.stars = Math.max(0, (snippet.value.stars ?? 1) - 1)
    }
  } else {
    const rsp = await favStore.addFav(snippet.value.id)
    if (rsp?.state === 0) {
      snippet.value.stared = true
      snippet.value.stars = (snippet.value.stars ?? 0) + 1
    }
  }
}

async function onFork() {
  if (!snippet.value) return
  const rsp = await snippetStore.forkSnippet(snippet.value.id)
  if (rsp?.state === 0) {
    snippet.value.forks = (snippet.value.forks ?? 0) + 1
    window.location.href = `/s/${rsp.data.id}`
  }
}

async function onDelete() {
  if (!snippet.value || !confirm('Delete this snippet?')) return
  const rsp = await snippetStore.deleteSnippet(snippet.value.id)
  if (rsp?.state === 0) window.location.href = '/'
}

async function onComment() {
  if (!commentText.value.trim() || !snippet.value) return
  commentLoading.value = true
  try {
    const rsp = await commentStore.createComment({ snippet: snippet.value.id, content: commentText.value.trim() })
    if (rsp?.state === 0) {
      comments.value.push(rsp.data)
      snippet.value.comments = (snippet.value.comments ?? 0) + 1
      commentText.value = ''
    }
  } finally {
    commentLoading.value = false
  }
}
</script>
