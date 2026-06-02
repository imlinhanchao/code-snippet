<script setup lang="ts">
const { t } = useI18n();
const { data } = await useAsyncData('login-page', () =>
  useApi<{ configured: boolean; user: null | { username: string; nickname: string } }>('/auth/session'),
);

useSeoMeta({
  title: `${t('login_title')} · Code Snippet`,
  description: 'Sign in to Code Snippet.',
});
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1>{{ t('login_title') }}</h1>
      <div v-if="data?.user">
        <p class="muted" style="text-align:center;margin-bottom:20px;">
          {{ t('nav_user') }}: <strong>@{{ data.user.username }}</strong>
        </p>
        <NuxtLink :to="`/u/${data.user.username}`" class="button primary" style="width:100%;justify-content:center;">
          {{ t('nav_user') }}
        </NuxtLink>
      </div>
      <form v-else @submit.prevent>
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" type="text" placeholder="Enter your username" autocomplete="username" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" placeholder="Enter your password" autocomplete="current-password" />
        </div>
        <button type="submit" class="form-submit">{{ t('login_title') }}</button>
      </form>
    </div>
  </div>
</template>

