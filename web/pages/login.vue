<script setup lang="ts">
const { t } = useI18n();
const { data } = await useAsyncData('login-page', () =>
  useApi<{ configured: boolean; user: null | { username: string; nickname: string } }>('/auth/session'),
);

useSeoMeta({
  title: `${t('login_title')} · Code Snippet`,
  description: 'SSR login entry.',
});
</script>

<template>
  <section class="card">
    <div class="page-header">
      <h1>{{ $t('login_title') }}</h1>
      <p class="muted">
        {{ data?.user ? `@${data.user.username}` : 'Session-aware SSR login shell.' }}
      </p>
    </div>
    <p class="muted">
      登录表单与验证码交互后续继续迁移，当前先保证服务端可识别 Session 状态并输出基础文案。
    </p>
  </section>
</template>
