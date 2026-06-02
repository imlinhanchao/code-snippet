<script setup lang="ts">
const { t } = useI18n();
const { data } = await useAsyncData('explore-page', () =>
  useApi<{ snippets: Array<Record<string, unknown>> }>('/snippets/explore'),
);

useSeoMeta({
  title: `${t('explore_title')} · Code Snippet`,
  description: 'Nuxt SSR migration explore feed.',
});
</script>

<template>
  <section class="grid">
    <div class="page-header">
      <h1>{{ t('explore_title') }}</h1>
      <p>SSR explore feed</p>
    </div>

    <div class="grid">
      <SnippetCard
        v-for="snippet in data?.snippets || []"
        :key="String(snippet.id)"
        :snippet="snippet as never"
      />
    </div>
  </section>
</template>
