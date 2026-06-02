<script setup lang="ts">
const { t } = useI18n();
const { data } = await useAsyncData('explore-page', () =>
  useApi<{ snippets: Array<Record<string, unknown>> }>('/snippets/explore'),
);

useSeoMeta({
  title: `${t('explore_title')} · Code Snippet`,
  description: 'Explore public code snippets shared by the community.',
});
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('explore_title') }}</h1>
      <p class="muted">{{ data?.snippets.length || 0 }} snippets</p>
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

