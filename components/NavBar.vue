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

      <!-- Language switcher -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-sm">
          {{ currentLangLabel }}
        </label>
        <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-36">
          <li v-for="lang in langs" :key="lang.value">
            <button @click="setLang(lang.value)" :class="{ 'active': locale === lang.value }">{{ lang.label }}</button>
          </li>
        </ul>
      </div>

      <!-- Theme toggle -->
      <button class="btn btn-ghost btn-sm btn-circle" @click="toggleTheme" :title="isDark ? 'Switch to light' : 'Switch to dark'">
        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

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
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccountStore } from '../store/useAccountStore'

const { t, locale } = useI18n()
const accountStore = useAccountStore()
const account = computed(() => accountStore.account)

const isDark = ref(false)

const langs = [
  { value: 'en', label: 'EN' },
  { value: 'zh-chs', label: '中文(简)' },
  { value: 'zh-cht', label: '中文(繁)' }
]

const currentLangLabel = computed(() => langs.find(l => l.value === locale.value)?.label ?? 'EN')

function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme)
  isDark.value = theme === 'halloween'
}

function setLang(lang: string) {
  locale.value = lang
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('app-lang', lang)
  }
}

function toggleTheme() {
  const next = isDark.value ? 'bumblebee' : 'halloween'
  applyTheme(next)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('app-theme', next)
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme') ?? 'bumblebee'
  applyTheme(savedTheme)
})

async function onLogout() {
  await accountStore.logout()
  window.location.href = '/explore'
}
</script>
