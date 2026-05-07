<template>
  <main class="min-h-screen bg-base-200">
    <NavBar />
    <section class="max-w-md mx-auto px-4 py-10">
      <div class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body">
          <h1 class="card-title">{{ t('register') }}</h1>
          <label class="form-control w-full">
            <span class="label-text mb-1">Username</span>
            <input v-model.trim="username" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full mt-3">
            <span class="label-text mb-1">{{ t('email') }}</span>
            <input v-model.trim="email" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full mt-3">
            <span class="label-text mb-1">{{ t('new_passwd') }}</span>
            <input v-model="passwd" type="password" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full mt-3">
            <span class="label-text mb-1">Captcha</span>
            <div class="join w-full">
              <input v-model.trim="captcha" class="input input-bordered join-item flex-1" />
              <img :src="captchaUrl" class="join-item h-12 w-32 object-cover cursor-pointer" @click="refreshCaptcha" />
            </div>
          </label>
          <p v-if="errorMsg" class="text-error text-sm mt-3">{{ errorMsg }}</p>
          <button class="btn btn-primary mt-4" :disabled="loading" @click="onRegister">
            {{ loading ? '...' : t('register') }}
          </button>
          <a href="/login" class="link link-primary mt-3">{{ t('login') }}</a>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NavBar from '@components/NavBar.vue'
import { useAccountStore } from '@store/useAccountStore'

const { t } = useI18n()
const accountStore = useAccountStore()

const username = ref('')
const email = ref('')
const passwd = ref('')
const captcha = ref('')
const rand = ref(Date.now())
const errorMsg = ref('')
const loading = ref(false)

const captchaUrl = computed(() => `/api/lib/captcha?r=${rand.value}`)

function refreshCaptcha() {
  rand.value = Date.now()
}

async function onRegister() {
  errorMsg.value = ''
  loading.value = true
  try {
    const rsp = await accountStore.register({
      username: username.value,
      passwd: passwd.value,
      email: email.value,
      captcha: captcha.value
    })
    if (rsp?.state === 0) {
      window.location.href = '/login'
      return
    }
    errorMsg.value = rsp?.msg || 'Register failed'
    refreshCaptcha()
  } catch (e: any) {
    errorMsg.value = e?.message || 'Register failed'
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}
</script>
