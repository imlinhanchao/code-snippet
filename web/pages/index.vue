<script setup lang="ts">
const { t } = useI18n();
const { data } = await useAsyncData('home-page', () =>
  useApi<{
    site: { name: string; domain: string };
    snippets: Array<Record<string, unknown>>;
  }>('/snippets/home'),
);

useSeoMeta({
  title: `${t('home_title')} · ${data.value?.site.name || 'Code Snippet'}`,
  description: `Discover and share code snippets on ${data.value?.site.name || 'Code Snippet'}.`,
});
</script>

<template>
  <div>
    <div class="hero" style="margin-bottom: 24px;">
      <h1>{{ data?.site.name || 'Code Snippet' }}</h1>
      <p>Discover and share reusable code snippets. Find solutions, learn from others, and build faster.</p>
    </div>

    <div class="page-header">
      <h1>{{ t('home_title') }}</h1>
    </div>

    <div v-if="(data?.snippets.length ?? 0) > 0" class="grid">
      <SnippetCard
        v-for="snippet in data?.snippets || []"
        :key="String(snippet.id)"
        :snippet="snippet as never"
      />
    </div>
    <div v-else class="empty-state">
      <p>{{ t('snippet_empty') }}</p>
    </div>
  </div>
</template>

