<script setup lang="ts">
const route = useRoute();
const { t } = useI18n();
const { data } = await useAsyncData(`snippet-${route.params.id}`, () =>
  useApi<{
    snippet: {
      id: string;
      title: string;
      description: string;
      language: string;
      username: string;
    };
    files: Array<{ id: string; filename: string; command: string; execute: boolean }>;
    stats: {
      stars: number;
      comments: number;
    };
  }>(`/snippets/${route.params.id}`),
);

useSeoMeta({
  title: `${data.value?.snippet.title || t('snippet_title')} · Code Snippet`,
  description: data.value?.snippet.description || 'SSR snippet detail',
});
</script>

<template>
  <section class="two-column">
    <div class="grid">
      <article class="card">
        <header class="page-header">
          <h1>{{ data?.snippet.title }}</h1>
          <p class="muted">{{ data?.snippet.description }}</p>
        </header>
        <div class="snippet-meta">
          <NuxtLink :to="`/u/${data?.snippet.username}`">@{{ data?.snippet.username }}</NuxtLink>
          <span>{{ data?.snippet.language }}</span>
          <span>{{ t('snippet_stars') }} {{ data?.stats.stars || 0 }}</span>
          <span>{{ t('snippet_comments') }} {{ data?.stats.comments || 0 }}</span>
        </div>
      </article>

      <article class="card">
        <h2>{{ t('snippet_files') }}</h2>
        <ul class="meta-list">
          <li v-for="file in data?.files || []" :key="file.id">{{ file.filename }}</li>
        </ul>
      </article>
    </div>

    <aside class="grid">
      <div class="card">
        <h2>Client-only modules</h2>
        <p class="muted">Markdown 预览、代码高亮、在线执行器与复杂交互组件保留客户端增强。</p>
      </div>
      <ClientOnly>
        <div class="code-panel">
          <pre>{{ JSON.stringify(data?.files || [], null, 2) }}</pre>
        </div>
      </ClientOnly>
    </aside>
  </section>
</template>
