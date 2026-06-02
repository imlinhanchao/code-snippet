<script setup lang="ts">
const route = useRoute();
const { t } = useI18n();
const { data } = await useAsyncData(`embed-${route.params.id}`, () =>
  useApi<{
    snippet: { title: string; language: string; username: string };
    files: Array<{ id: string; filename: string }>;
  }>(`/snippets/${route.params.id}/embed`),
);

useSeoMeta({
  title: `${t('embed_title')} · ${data.value?.snippet.title || 'Code Snippet'}`,
  description: data.value?.snippet.title || 'SSR embed shell',
});
</script>

<template>
  <section class="card">
    <header class="page-header">
      <h1>{{ data?.snippet.title }}</h1>
      <p class="muted">@{{ data?.snippet.username }} · {{ data?.snippet.language }}</p>
    </header>
    <ul class="meta-list">
      <li v-for="file in data?.files || []" :key="file.id">{{ file.filename }}</li>
    </ul>
  </section>
</template>
