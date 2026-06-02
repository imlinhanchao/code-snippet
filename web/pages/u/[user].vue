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
  description: data.value?.profile.motto || '',
});
</script>

<template>
  <div class="profile-layout">
    <!-- Sidebar -->
    <aside>
      <div class="avatar-placeholder">
        {{ (data?.profile.nickname || data?.profile.username || '?')[0].toUpperCase() }}
      </div>
      <div class="profile-name">{{ data?.profile.nickname || data?.profile.username }}</div>
      <div class="profile-username">@{{ data?.profile.username }}</div>
      <p v-if="data?.profile.motto" class="profile-bio">{{ data.profile.motto }}</p>

      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-num">{{ data?.stats.snippets || 0 }}</span>
          <span class="stat-lbl">snippets</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ data?.stats.stars || 0 }}</span>
          <span class="stat-lbl">{{ t('snippet_stars').toLowerCase() }}</span>
        </div>
      </div>

      <div class="profile-meta">
        <span v-if="data?.profile.company">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-2px;margin-right:4px">
            <path d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5A1.75 1.75 0 0 1 10.25 16h-8.5A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM3.5 6.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm4.25-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3.5 9.75A.75.75 0 0 1 4.25 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Zm.75-5.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5a.75.75 0 0 1 .75.75ZM4.25 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"/>
          </svg>
          {{ data.profile.company }}
        </span>
        <span v-if="data?.profile.location">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-2px;margin-right:4px">
            <path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"/>
          </svg>
          {{ data.profile.location }}
        </span>
        <a v-if="data?.profile.url" :href="data.profile.url" target="_blank" rel="noreferrer">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-2px;margin-right:4px">
            <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0Z"/>
          </svg>
          {{ data.profile.url }}
        </a>
      </div>
    </aside>

    <!-- Main content -->
    <div>
      <div class="page-header">
        <h1>Snippets</h1>
      </div>
      <div class="empty-state">
        <p>{{ t('snippet_empty') }}</p>
      </div>
    </div>
  </div>
</template>

