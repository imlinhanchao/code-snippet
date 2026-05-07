<template>
  <AppLayout>
    <div v-if="!accountStore.account && !authLoading" class="alert alert-warning">
      Please <a href="/login" class="link link-primary">login</a> to create snippets.
    </div>
    <template v-else>
      <h1 class="text-xl font-bold mb-6">{{ t('new_snippet') }}</h1>
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

          <p v-if="errorMsg" class="text-error text-sm">{{ errorMsg }}</p>
          <div class="flex gap-2">
            <button class="btn btn-primary" :disabled="saving" @click="onCreate">
              {{ saving ? '...' : t('create_snippet') }}
            </button>
            <a href="/" class="btn btn-ghost">{{ t('cancel') }}</a>
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
import { useAccountStore } from '@store/useAccountStore'
import { useSnippetStore } from '@store/useSnippetStore'

const { t } = useI18n()
const accountStore = useAccountStore()
const snippetStore = useSnippetStore()

const authLoading = ref(true)
const description = ref('')
const isPrivate = ref(false)
const files = ref([{ filename: 'main.js', content: '' }])
const saving = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  authLoading.value = true
  await accountStore.fetchInfo()
  authLoading.value = false
  if (!accountStore.account) {
    window.location.href = '/login'
  }
})

function addFile() {
  files.value.push({ filename: '', content: '' })
}

function removeFile(i: number) {
  files.value.splice(i, 1)
}

async function onCreate() {
  errorMsg.value = ''
  if (!files.value.some(f => f.filename.trim())) {
    errorMsg.value = 'At least one file with a filename is required.'
    return
  }
  saving.value = true
  try {
    const rsp = await snippetStore.createSnippet({
      description: description.value,
      private: isPrivate.value,
      codes: files.value.map((f, i) => ({
        filename: f.filename.trim() || `file${i + 1}`,
        content: f.content,
        order: i,
        id: '',
        snippet: '',
        input: '',
        command: '',
        execute: false
      }))
    })
    if (rsp?.state === 0) {
      window.location.href = `/s/${rsp.data.id}`
    } else {
      errorMsg.value = rsp?.msg || 'Create failed'
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Create failed'
  } finally {
    saving.value = false
  }
}
</script>
