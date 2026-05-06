<template>
  <div class="navbar bg-base-100 border-b border-base-200 sticky top-0 z-50">
    <div class="navbar-start">
      <a href="/" class="btn btn-ghost text-xl font-bold">
        <span class="text-primary">&lt;/&gt;</span> Code Snippet
      </a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-1">
        <li><a href="/explore" class="btn btn-ghost btn-sm">{{ t('explore') }}</a></li>
        <li v-if="account"><a href="/" class="btn btn-ghost btn-sm">{{ t('feed') }}</a></li>
      </ul>
    </div>
    <div class="navbar-end gap-2">
      <a href="/editor" class="btn btn-primary btn-sm hidden sm:flex" v-if="account">
        {{ t('new_snippet') }}
      </a>
      <div v-if="account" class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-8 rounded-full">
            <img :src="`/api/account/avatar/${account.username}`" :alt="account.nickname" />
          </div>
        </label>
        <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li><a :href="`/u/${account.username}`">{{ t('profile') }}</a></li>
          <li><a href="/setting">{{ t('setting') }}</a></li>
          <li><a href="/editor">{{ t('new_snippet') }}</a></li>
          <li><button @click="onLogout">{{ t('logout') }}</button></li>
        </ul>
      </div>
      <div v-else class="flex gap-2">
        <a href="/login" class="btn btn-ghost btn-sm">{{ t('login') }}</a>
        <a href="/register" class="btn btn-primary btn-sm">{{ t('register') }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccountStore } from '../store/useAccountStore'

const { t } = useI18n()
const accountStore = useAccountStore()
const account = computed(() => accountStore.account)

async function onLogout() {
  await accountStore.logout()
  window.location.href = '/explore'
}
</script>
