<template>
  <AppLayout>
    <div v-if="loading" class="text-base-content/60">Loading...</div>
    <div v-else-if="errorMsg && !snippet" class="alert alert-error">{{ errorMsg }}</div>
    <template v-else-if="snippet">
      <h1 class="text-xl font-bold mb-6">{{ t('edit') }}: {{ snippet.codes?.[0]?.filename }}</h1>
      <div class="bg-base-100 rounded-lg border border-base-200 p-6">
        <div class="grid gap-4 max-w-2xl">
          <!-- Description -->
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('description') }}</span>
            <input v-model.trim="description" class="input input-bordered w-full" />
          </label>
          <!-- Private toggle -->
          <label class="label cursor-pointer justify-start gap-3 w-fit">
            <input type="checkbox" v-model="isPrivate" class="toggle toggle-primary" />
            <span class="label-text">{{ t('private') }}</span>
          </label>

          <!-- Code files -->
          <div class="flex flex-col gap-4">
            <div v-for="(file, i) in files" :key="i" class="border border-base-200 rounded-lg overflow-hidden">
              <div class="flex items-center gap-2 px-3 py-2 bg-base-200">
                <input
                  v-model.trim="file.filename"
                  class="input input-bordered input-xs flex-1 font-mono"
                  placeholder="filename.js"
                />
                <button v-if="files.length > 1" class="btn btn-xs btn-ghost text-error" @click="removeFile(i)">✕</button>
              </div>
              <textarea
                v-model="file.content"
                class="textarea w-full font-mono text-sm rounded-none border-0 border-t border-base-200 min-h-[180px] resize-y focus:outline-none bg-base-100"
                :placeholder="`// ${file.filename || 'code here...'}`"
              />
            </div>
          </div>

          <button class="btn btn-outline btn-sm w-fit" @click="addFile">+ {{ t('add_file') }}</button>

          <p v-if="saveMsg" class="text-sm" :class="saveSuccess ? 'text-success' : 'text-error'">{{ saveMsg }}</p>
          <div class="flex gap-2">
            <button class="btn btn-primary" :disabled="saving" @click="onUpdate">
              {{ saving ? '...' : t('save') }}
            </button>
            <a :href="`/s/${id}`" class="btn btn-ghost">{{ t('cancel') }}</a>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@components/AppLayout.vue'
import { usePageContext } from '../../../renderer/usePageContext'
import { useAccountStore } from '@store/useAccountStore'
import { useSnippetStore, type Snippet, type Code } from '@store/useSnippetStore'

const { t } = useI18n()
const pageContext = usePageContext()
const id = pageContext.routeParams?.id as string

const accountStore = useAccountStore()
const snippetStore = useSnippetStore()

const snippet = ref<Snippet | null>(null)
const loading = ref(true)
const errorMsg = ref('')
const description = ref('')
const isPrivate = ref(false)
const files = ref<Array<{ id: string; filename: string; content: string }>>([])
const saving = ref(false)
const saveMsg = ref('')
const saveSuccess = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await accountStore.fetchInfo()
    if (!accountStore.account) {
      window.location.href = '/login'
      return
    }
    const data = await snippetStore.getSnippet(id)
    if (!data) {
      errorMsg.value = 'Snippet not found'
      return
    }
    snippet.value = data
    if (accountStore.account.username !== data.username) {
      window.location.href = `/s/${id}`
      return
    }
    description.value = data.description ?? ''
    isPrivate.value = data.private ?? false
    files.value = (data.codes ?? []).map(c => ({
      id: c.id,
      filename: c.filename,
      content: c.content
    }))
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load snippet'
  } finally {
    loading.value = false
  }
})

function addFile() {
  files.value.push({ id: '', filename: '', content: '' })
}

function removeFile(i: number) {
  files.value.splice(i, 1)
}

async function onUpdate() {
  saveMsg.value = ''
  saving.value = true
  try {
    const rsp = await snippetStore.updateSnippet({
      id,
      description: description.value,
      private: isPrivate.value,
      codes: files.value.map((f, i) => ({
        id: f.id,
        filename: f.filename.trim() || `file${i + 1}`,
        content: f.content,
        order: i,
        snippet: id,
        input: '',
        command: '',
        execute: false
      }))
    })
    if (rsp?.state === 0) {
      saveMsg.value = t('save_success')
      saveSuccess.value = true
      setTimeout(() => { window.location.href = `/s/${id}` }, 800)
    } else {
      saveMsg.value = rsp?.msg || 'Update failed'
      saveSuccess.value = false
    }
  } catch (e: any) {
    saveMsg.value = e?.message || 'Update failed'
    saveSuccess.value = false
  } finally {
    saving.value = false
  }
}
</script>
