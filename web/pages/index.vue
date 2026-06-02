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
  description: 'Nuxt SSR migration home feed for Code Snippet.',
});
</script>

<template>
  <section class="grid">
    <div class="hero card">
      <h1>{{ data?.site.name }}</h1>
      <p>
        SSR 首屏先输出站点信息与 Snippet 摘要，编辑器、执行器与 Markdown 重交互模块后续继续按阶段迁移。
      </p>
    </div>

    <div class="page-header">
      <h1>{{ $t('home_title') }}</h1>
      <p>{{ data?.snippets.length || 0 }} snippets</p>
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
