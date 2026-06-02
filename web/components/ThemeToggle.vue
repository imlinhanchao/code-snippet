<script setup lang="ts">
const theme = useCookie<'light' | 'dark'>('code-snippet-theme', {
  default: () => 'light',
});

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.dataset.theme = theme.value || 'light';
  }
});
</script>

<template>
  <button class="button" type="button" @click="theme = theme === 'dark' ? 'light' : 'dark'">
    {{ theme === 'dark' ? $t('theme_light') : $t('theme_dark') }}
  </button>
</template>
