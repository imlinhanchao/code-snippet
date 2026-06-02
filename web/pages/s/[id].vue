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
      create_time: number;
      update_time: number;
    };
    files: Array<{ id: string; filename: string; command: string; execute: boolean; content: string }>;
    stats: {
      stars: number;
      comments: number;
    };
  }>(`/snippets/${route.params.id}`),
);

const activeFileId = ref<string | null>(null);

const activeFile = computed(() => {
  if (!data.value?.files.length) return null;
  const id = activeFileId.value ?? data.value.files[0].id;
  return data.value.files.find((f) => f.id === id) ?? data.value.files[0];
});

function selectFile(id: string) {
  activeFileId.value = id;
}

function formatDate(ts: number) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

useSeoMeta({
  title: `${data.value?.snippet.title || t('snippet_title')} · Code Snippet`,
  description: data.value?.snippet.description || '',
});
</script>

<template>
  <div class="two-column">
    <!-- Main column -->
    <div>
      <!-- Header -->
      <div class="page-header">
        <h1>{{ data?.snippet.title }}</h1>
        <div class="snippet-meta" style="margin-top: 8px;">
          <NuxtLink :to="`/u/${data?.snippet.username}`">@{{ data?.snippet.username }}</NuxtLink>
          <span v-if="data?.snippet.language" class="snippet-meta-item">
            <span class="lang-dot" />
            {{ data.snippet.language }}
          </span>
          <span class="muted" v-if="data?.snippet.update_time">
            {{ t('snippet_updated') }} {{ formatDate(data.snippet.update_time) }}
          </span>
        </div>
        <p v-if="data?.snippet.description" class="muted" style="margin-top: 8px;">
          {{ data.snippet.description }}
        </p>
      </div>

      <!-- File tabs -->
      <div v-if="(data?.files.length ?? 0) > 1" class="file-tabs">
        <button
          v-for="file in data?.files"
          :key="file.id"
          class="file-tab"
          :class="{ active: activeFile?.id === file.id }"
          type="button"
          @click="selectFile(file.id)"
        >
          {{ file.filename }}
        </button>
      </div>

      <!-- Code panel -->
      <ClientOnly>
        <CodeBlock
          v-if="activeFile"
          :code="activeFile.content || ''"
          :language="data?.snippet.language"
          :filename="activeFile.filename"
        />
        <template #fallback>
          <div class="code-block">
            <div class="code-block-header">
              <span class="code-filename">{{ activeFile?.filename }}</span>
            </div>
            <pre class="code-pre">{{ activeFile?.content }}</pre>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Sidebar -->
    <aside>
      <div class="sidebar-card">
        <h2>{{ t('snippet_about') }}</h2>
        <div class="stat-row">
          <span class="stat-label">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-2px;margin-right:4px">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
            </svg>
            {{ t('snippet_stars') }}
          </span>
          <span class="stat-value">{{ data?.stats.stars || 0 }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-2px;margin-right:4px">
              <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Z"/>
            </svg>
            {{ t('snippet_comments') }}
          </span>
          <span class="stat-value">{{ data?.stats.comments || 0 }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-2px;margin-right:4px">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>
            </svg>
            {{ t('snippet_files') }}
          </span>
          <span class="stat-value">{{ data?.files.length || 0 }}</span>
        </div>
      </div>

      <div class="sidebar-card">
        <h2>{{ t('snippet_author') }}</h2>
        <NuxtLink :to="`/u/${data?.snippet.username}`" style="font-weight:600;">
          @{{ data?.snippet.username }}
        </NuxtLink>
      </div>

      <!-- File list -->
      <div v-if="(data?.files.length ?? 0) > 0" class="sidebar-card">
        <h2>{{ t('snippet_files') }}</h2>
        <ul class="meta-list" style="flex-direction:column;gap:6px;">
          <li v-for="file in data?.files" :key="file.id">
            <button
              class="file-tab"
              :class="{ active: activeFile?.id === file.id }"
              type="button"
              style="width:100%;text-align:left;"
              @click="selectFile(file.id)"
            >
              {{ file.filename }}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

