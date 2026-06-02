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
    <div class="snippet-card-title">
      <NuxtLink :to="`/s/${snippet.id}`">{{ snippet.title }}</NuxtLink>
    </div>
    <p v-if="snippet.description" class="snippet-card-desc">{{ snippet.description }}</p>
    <div class="snippet-meta">
      <span class="snippet-meta-item">
        <span class="lang-dot" />
        <span>{{ snippet.language || '—' }}</span>
      </span>
      <NuxtLink :to="`/u/${snippet.username}`" class="snippet-meta-item">
        @{{ snippet.username }}
      </NuxtLink>
      <span class="snippet-meta-item">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>
        </svg>
        {{ snippet.files?.length || 0 }} {{ t('snippet_files') }}
      </span>
      <span class="snippet-meta-item">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
        </svg>
        {{ snippet.stats?.stars || 0 }}
      </span>
      <span class="snippet-meta-item">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Z"/>
        </svg>
        {{ snippet.stats?.comments || 0 }}
      </span>
    </div>
  </article>
</template>

