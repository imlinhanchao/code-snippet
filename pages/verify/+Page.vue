<template>
  <AppLayout>
    <div class="max-w-md mx-auto py-12 text-center">
      <div v-if="verifying" class="flex flex-col items-center gap-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="text-base-content/60">{{ t('verifying') }}</p>
      </div>
      <div v-else-if="success" class="flex flex-col items-center gap-4">
        <div class="text-success text-5xl">✓</div>
        <p class="text-lg font-semibold">{{ t('verify_success') }}</p>
        <a href="/" class="btn btn-primary">{{ t('go_home') }}</a>
      </div>
      <div v-else class="flex flex-col items-center gap-4">
        <div class="text-error text-5xl">✗</div>
        <p class="text-lg font-semibold">{{ t('verify_fail') }}</p>
        <p class="text-sm text-base-content/60">{{ errorMsg }}</p>
        <a href="/" class="btn btn-outline">{{ t('go_home') }}</a>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@components/AppLayout.vue'
import { useAccountStore } from '@store/useAccountStore'

const { t } = useI18n()
const accountStore = useAccountStore()

const verifying = ref(true)
const success = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  verifying.value = true
  try {
    const params = new URLSearchParams(window.location.search)
    const username = params.get('username') ?? ''
    const token = params.get('token') ?? ''
    if (!username || !token) {
      errorMsg.value = 'Missing verification parameters.'
      verifying.value = false
      return
    }
    const rsp = await accountStore.verifyEmail(username, token)
    if (rsp?.state === 0) {
      success.value = true
      setTimeout(() => { window.location.href = '/' }, 2000)
    } else {
      errorMsg.value = rsp?.msg || 'Verification failed'
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Verification failed'
  } finally {
    verifying.value = false
  }
})
</script>
