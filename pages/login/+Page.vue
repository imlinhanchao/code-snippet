<template>
  <main class="min-h-screen bg-base-200">
    <NavBar />
    <section class="max-w-md mx-auto px-4 py-10">
      <div class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body">
          <h1 class="card-title">{{ t('login') }}</h1>
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('empty_username') }}</span>
            <input v-model.trim="username" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full mt-3">
            <span class="label-text mb-1">{{ t('empty_passwd') }}</span>
            <input v-model="passwd" type="password" class="input input-bordered w-full" />
          </label>
          <p v-if="errorMsg" class="text-error text-sm mt-3">{{ errorMsg }}</p>
          <button class="btn btn-primary mt-4" :disabled="loading" @click="onLogin">
            {{ loading ? '...' : t('login') }}
          </button>
          <a href="/register" class="link link-primary mt-3">{{ t('register') }}</a>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NavBar from '@components/NavBar.vue'
import { useAccountStore } from '@store/useAccountStore'

const { t } = useI18n()
const accountStore = useAccountStore()

const username = ref('')
const passwd = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function onLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    const rsp = await accountStore.login(username.value, passwd.value)
    if (rsp?.state === 0) {
      window.location.href = '/'
      return
    }
    errorMsg.value = rsp?.msg || 'Login failed'
  } catch (e: any) {
    errorMsg.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
