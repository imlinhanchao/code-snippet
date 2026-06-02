<script setup lang="ts">
const { t } = useI18n();

defineProps<{
  snippet: {
    id: string;
    title: string;
    description: string;
    language: string;
    username: string;
    files?: Array<{ filename: string }>;
    stats?: {
      stars: number;
      comments: number;
    };
  };
}>();
</script>

<template>
  <article class="snippet-card">
    <header>
      <NuxtLink :to="`/s/${snippet.id}`">
        <strong>{{ snippet.title }}</strong>
      </NuxtLink>
      <span class="badge">{{ snippet.language }}</span>
    </header>
    <p class="muted">{{ snippet.description || '—' }}</p>
    <div class="snippet-meta">
      <NuxtLink :to="`/u/${snippet.username}`">@{{ snippet.username }}</NuxtLink>
      <span>{{ t('snippet_files') }} {{ snippet.files?.length || 0 }}</span>
      <span>{{ t('snippet_stars') }} {{ snippet.stats?.stars || 0 }}</span>
      <span>{{ t('snippet_comments') }} {{ snippet.stats?.comments || 0 }}</span>
    </div>
  </article>
</template>
