<script setup lang="ts">
const { t } = useI18n();
const { data } = await useBootstrap();
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <nav>
        <NuxtLink to="/">{{ t('nav_home') }}</NuxtLink>
        <NuxtLink to="/explore">{{ t('nav_explore') }}</NuxtLink>
        <NuxtLink to="/login">{{ t('nav_login') }}</NuxtLink>
        <NuxtLink v-if="data?.session.user" :to="`/u/${data.session.user.username}`">
          {{ t('nav_user') }}
        </NuxtLink>
      </nav>
      <div class="toolbar">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </header>
    <main class="container">
      <SetupGate v-if="!data?.status.configured" />
      <slot v-else />
    </main>
  </div>
</template>
