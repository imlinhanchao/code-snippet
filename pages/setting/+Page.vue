<template>
  <AppLayout>
    <div v-if="!accountStore.account && !loading" class="alert alert-warning">
      Please <a href="/login" class="link link-primary">login</a> to access settings.
    </div>
    <template v-else-if="accountStore.account">
      <h1 class="text-xl font-bold mb-6">{{ t('setting') }}</h1>
      <div class="tabs tabs-bordered mb-6">
        <button class="tab" :class="{ 'tab-active': tab === 'profile' }" @click="tab = 'profile'">{{ t('profile') }}</button>
        <button class="tab" :class="{ 'tab-active': tab === 'security' }" @click="tab = 'security'">{{ t('security') }}</button>
      </div>

      <!-- Profile tab -->
      <div v-if="tab === 'profile'" class="bg-base-100 rounded-lg border border-base-200 p-6">
        <!-- Avatar -->
        <div class="flex items-center gap-4 mb-6">
          <div class="avatar">
            <div class="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img :src="avatarPreview || `/api/account/avatar/${accountStore.account.username}`" alt="avatar" />
            </div>
          </div>
          <div>
            <label class="btn btn-sm btn-outline cursor-pointer">
              Upload Avatar
              <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            </label>
            <p class="text-xs text-base-content/50 mt-1">JPG, PNG, GIF up to 2MB</p>
          </div>
        </div>

        <div class="grid gap-4 max-w-lg">
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('nickname') }}</span>
            <input v-model.trim="profile.nickname" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('company') }}</span>
            <input v-model.trim="profile.company" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('location') }}</span>
            <input v-model.trim="profile.location" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('url') }}</span>
            <input v-model.trim="profile.url" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('motto') }}</span>
            <textarea v-model="profile.motto" class="textarea textarea-bordered w-full" rows="3" />
          </label>
          <p v-if="profileMsg" class="text-sm" :class="profileSuccess ? 'text-success' : 'text-error'">{{ profileMsg }}</p>
          <button class="btn btn-primary w-fit" :disabled="profileLoading" @click="saveProfile">
            {{ profileLoading ? '...' : t('save') }}
          </button>
        </div>
      </div>

      <!-- Security tab -->
      <div v-if="tab === 'security'" class="bg-base-100 rounded-lg border border-base-200 p-6 max-w-lg">
        <h2 class="font-semibold mb-4">{{ t('email') }}</h2>
        <div class="flex items-center gap-2 mb-4">
          <span class="text-sm">{{ accountStore.account.email }}</span>
          <span class="badge" :class="accountStore.account.verify ? 'badge-success' : 'badge-warning'">
            {{ accountStore.account.verify ? t('verified') : t('inverified') }}
          </span>
          <button v-if="!accountStore.account.verify" class="btn btn-xs btn-ghost" :disabled="emailLoading" @click="resendVerify">
            {{ t('resend_email') }}
          </button>
        </div>
        <div class="flex gap-2 mb-6">
          <input v-model.trim="newEmail" class="input input-bordered flex-1 input-sm" :placeholder="t('new_email')" />
          <button class="btn btn-sm btn-primary" :disabled="emailLoading" @click="updateEmail">{{ t('update_email') }}</button>
        </div>

        <h2 class="font-semibold mb-4">{{ t('update_passwd') }}</h2>
        <div class="grid gap-3">
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('old_passwd') }}</span>
            <input v-model="passwd.old" type="password" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('new_passwd') }}</span>
            <input v-model="passwd.value" type="password" class="input input-bordered w-full" />
          </label>
          <label class="form-control w-full">
            <span class="label-text mb-1">{{ t('confirm_passwd') }}</span>
            <input v-model="passwd.confirm" type="password" class="input input-bordered w-full" />
          </label>
          <p v-if="securityMsg" class="text-sm" :class="securitySuccess ? 'text-success' : 'text-error'">{{ securityMsg }}</p>
          <button class="btn btn-primary w-fit" :disabled="securityLoading" @click="updatePasswd">
            {{ securityLoading ? '...' : t('update_passwd') }}
          </button>
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
import apiClient from '../../src/api/client'

const { t } = useI18n()
const accountStore = useAccountStore()

const tab = ref('profile')
const loading = ref(true)
const avatarPreview = ref('')
const avatarFile = ref<File | null>(null)

const profile = ref({ nickname: '', company: '', location: '', url: '', motto: '' })
const profileLoading = ref(false)
const profileMsg = ref('')
const profileSuccess = ref(false)

const newEmail = ref('')
const emailLoading = ref(false)

const passwd = ref({ old: '', value: '', confirm: '' })
const securityLoading = ref(false)
const securityMsg = ref('')
const securitySuccess = ref(false)

onMounted(async () => {
  loading.value = true
  await accountStore.fetchInfo()
  loading.value = false
  if (accountStore.account) {
    const a = accountStore.account
    profile.value = {
      nickname: a.nickname ?? '',
      company: a.company ?? '',
      location: a.location ?? '',
      url: a.url ?? '',
      motto: a.motto ?? ''
    }
  }
})

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function saveProfile() {
  profileLoading.value = true
  profileMsg.value = ''
  try {
    let avatarPath: string | undefined
    // upload avatar via lib/upload if changed
    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('file', avatarFile.value)
      const uploadRsp = await apiClient.post('lib/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (uploadRsp.data?.state === 0 && uploadRsp.data?.data?.length) {
        avatarPath = uploadRsp.data.data[0]
      }
    }
    const payload: any = { ...profile.value }
    if (avatarPath) payload.avatar = avatarPath
    const rsp = await accountStore.update(payload)
    if (rsp?.state === 0) {
      profileMsg.value = t('save_success')
      profileSuccess.value = true
    } else {
      profileMsg.value = rsp?.msg || 'Update failed'
      profileSuccess.value = false
    }
  } catch (e: any) {
    profileMsg.value = e?.message || 'Update failed'
    profileSuccess.value = false
  } finally {
    profileLoading.value = false
  }
}

async function resendVerify() {
  emailLoading.value = true
  try {
    if (accountStore.account) {
      await accountStore.sendVerify(accountStore.account.username, accountStore.account.email)
    }
  } finally {
    emailLoading.value = false
  }
}

async function updateEmail() {
  if (!newEmail.value.trim()) return
  emailLoading.value = true
  try {
    const rsp = await accountStore.update({ email: newEmail.value.trim() })
    if (rsp?.state === 0) newEmail.value = ''
  } finally {
    emailLoading.value = false
  }
}

async function updatePasswd() {
  if (passwd.value.value !== passwd.value.confirm) {
    securityMsg.value = t('passwd_not_match')
    securitySuccess.value = false
    return
  }
  securityLoading.value = true
  securityMsg.value = ''
  try {
    const rsp = await accountStore.update({ oldpasswd: passwd.value.old, passwd: passwd.value.value })
    if (rsp?.state === 0) {
      securityMsg.value = t('passwd_update')
      securitySuccess.value = true
      passwd.value = { old: '', value: '', confirm: '' }
    } else {
      securityMsg.value = rsp?.msg || 'Update failed'
      securitySuccess.value = false
    }
  } catch (e: any) {
    securityMsg.value = e?.message || 'Update failed'
    securitySuccess.value = false
  } finally {
    securityLoading.value = false
  }
}
</script>
