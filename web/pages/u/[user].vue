<script setup lang="ts">
const route = useRoute();
const { t } = useI18n();
const { data } = await useAsyncData(`user-${route.params.user}`, () =>
  useApi<{
    profile: {
      username: string;
      nickname: string;
      company: string;
      location: string;
      url: string;
      motto: string;
      verify: boolean;
    };
    stats: {
      snippets: number;
      stars: number;
      comments: number;
    };
  }>(`/accounts/${route.params.user}/summary`),
);

useSeoMeta({
  title: `${data.value?.profile.nickname || t('user_title')} · Code Snippet`,
  description: data.value?.profile.motto || 'SSR user profile',
});
</script>

<template>
  <section class="grid">
    <article class="card">
      <header class="page-header">
        <h1>{{ data?.profile.nickname }}</h1>
        <p class="muted">@{{ data?.profile.username }}</p>
      </header>
      <div class="meta-list">
        <span>{{ data?.profile.company || '—' }}</span>
        <span>{{ data?.profile.location || '—' }}</span>
        <a v-if="data?.profile.url" :href="data.profile.url" target="_blank" rel="noreferrer">
          {{ data.profile.url }}
        </a>
      </div>
      <p class="muted">{{ data?.profile.motto || '—' }}</p>
    </article>

    <div class="grid" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
      <div class="card">
        <strong>{{ data?.stats.snippets || 0 }}</strong>
        <p class="muted">Snippets</p>
      </div>
      <div class="card">
        <strong>{{ data?.stats.stars || 0 }}</strong>
        <p class="muted">{{ $t('snippet_stars') }}</p>
      </div>
      <div class="card">
        <strong>{{ data?.stats.comments || 0 }}</strong>
        <p class="muted">{{ $t('snippet_comments') }}</p>
      </div>
    </div>
  </section>
</template>
