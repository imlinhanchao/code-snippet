<script setup lang="ts">
const props = defineProps<{
  code: string;
  language?: string;
  filename?: string;
}>();

const highlighted = ref('');

onMounted(async () => {
  const { default: hljs } = await import('highlight.js');
  const lang = (props.language || '').toLowerCase().trim();
  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted.value = hljs.highlight(props.code, { language: lang }).value;
    } else {
      highlighted.value = hljs.highlightAuto(props.code).value;
    }
  } catch {
    highlighted.value = escapeHtml(props.code);
  }
});

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
</script>

<template>
  <div class="code-block">
    <div v-if="filename" class="code-block-header">
      <span class="code-filename">{{ filename }}</span>
    </div>
    <pre class="code-pre"><code v-if="highlighted" class="hljs" v-html="highlighted" /><code v-else>{{ code }}</code></pre>
  </div>
</template>
