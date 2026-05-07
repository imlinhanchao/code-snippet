<template>
  <div class="navbar bg-base-100/90 backdrop-blur border-b border-base-200 sticky top-0 z-50">
    <div class="navbar-start">
      <a href="/" class="btn btn-ghost text-xl font-bold gap-2">
        <Icon icon="carbon:code" class="text-primary text-2xl" />
        <span>Code Snippet</span>
      </a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-1">
        <li>
          <a href="/explore" class="btn btn-ghost btn-sm gap-1">
            <Icon icon="solar:compass-outline" />
            {{ t('explore') }}
          </a>
        </li>
        <li v-if="account">
          <a href="/" class="btn btn-ghost btn-sm gap-1">
            <Icon icon="solar:home-smile-outline" />
            {{ t('feed') }}
          </a>
        </li>
      </ul>
    </div>
    <div class="navbar-end gap-2">
      <a href="/editor" class="btn btn-primary btn-sm hidden sm:flex gap-1" v-if="account">
        <Icon icon="solar:add-circle-outline" />
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
        <Icon v-if="isDark" icon="solar:sun-2-outline" class="text-lg" />
        <Icon v-else icon="solar:moon-stars-outline" class="text-lg" />
      </button>

      <div v-if="account" class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-8 rounded-full">
            <img :src="`/api/account/avatar/${account.username}`" :alt="account.nickname" />
          </div>
        </label>
        <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li>
            <a :href="`/u/${account.username}`" class="gap-2">
              <Icon icon="solar:user-circle-outline" />
              {{ t('profile') }}
            </a>
          </li>
          <li>
            <a href="/setting" class="gap-2">
              <Icon icon="solar:settings-outline" />
              {{ t('setting') }}
            </a>
          </li>
          <li>
            <a href="/editor" class="gap-2">
              <Icon icon="solar:add-circle-outline" />
              {{ t('new_snippet') }}
            </a>
          </li>
          <li>
            <button @click="onLogout" class="gap-2">
              <Icon icon="solar:logout-2-outline" />
              {{ t('logout') }}
            </button>
          </li>
        </ul>
      </div>
      <div v-else class="flex gap-2">
        <a href="/login" class="btn btn-ghost btn-sm gap-1">
          <Icon icon="solar:login-2-outline" />
          {{ t('login') }}
        </a>
        <a href="/register" class="btn btn-primary btn-sm gap-1">
          <Icon icon="solar:user-plus-outline" />
          {{ t('register') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
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

function setPrefCookie(key: string, value: string) {
  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`
}

function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme)
  isDark.value = theme === 'halloween'
}

function setLang(lang: string) {
  locale.value = lang
  document.documentElement.lang = lang
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('app-lang', lang)
  }
  setPrefCookie('app-lang', lang)
}

function toggleTheme() {
  const next = isDark.value ? 'bumblebee' : 'halloween'
  applyTheme(next)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('app-theme', next)
  }
  setPrefCookie('app-theme', next)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme') ?? document.documentElement.getAttribute('data-theme') ?? 'bumblebee'
  applyTheme(savedTheme)
})

async function onLogout() {
  await accountStore.logout()
  window.location.href = '/explore'
}
</script>
