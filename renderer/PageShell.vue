<template>
  <slot />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { pageContextSymbol } from './usePageContext'

const props = defineProps<{
  pageContext: any
}>()

provide(pageContextSymbol, props.pageContext)
</script>
