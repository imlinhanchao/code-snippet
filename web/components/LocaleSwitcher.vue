<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
</script>

<template>
  <div class="toolbar">
    <button
      v-for="item in locales"
      :key="item.code"
      class="button"
      :class="{ active: locale === item.code }"
      type="button"
      @click="setLocale(item.code)"
    >
      {{ item.name }}
    </button>
  </div>
</template>
