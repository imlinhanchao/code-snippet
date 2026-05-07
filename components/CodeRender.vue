<template>
  <div class="rounded-lg border border-base-300 overflow-hidden">
    <!-- Header -->
    <div v-if="header" class="flex items-center justify-between px-4 py-2 bg-base-300 text-base-content text-sm font-mono">
      <span class="truncate">{{ code.filename }}</span>
      <button v-if="isRender && !onlySource" class="btn btn-xs btn-ghost ml-2" @click="source = !source">
        {{ source ? t('render') : t('source') }}
      </button>
    </div>

    <!-- Code content -->
    <div :style="maxHeight ? { maxHeight: `${maxHeight}px`, overflow: 'auto' } : {}">
      <!-- Source view -->
      <template v-if="!isRender || source || onlySource">
        <highlightjs v-if="isClient" :code="code.content" :autodetect="true" class="!m-0 !rounded-none text-sm" />
        <pre v-else class="p-4 text-sm overflow-auto m-0"><code>{{ code.content }}</code></pre>
      </template>

      <!-- Rendered view -->
      <template v-if="isRender && !source && !onlySource">
        <div v-if="isMarkdown" class="prose prose-sm max-w-none p-4 bg-base-100" v-html="renderedMarkdown" />
        <div v-else-if="isSvg" class="p-4 bg-base-100 flex justify-center" v-html="code.content" />
        <div v-else-if="isImage" class="p-4 bg-base-100 flex justify-center">
          <img :src="code.content" class="max-h-80 object-contain" :alt="code.filename" />
        </div>
      </template>
    </div>

    <!-- Bottom toggle when no header -->
    <div v-if="isRender && !header && !onlySource" class="flex justify-end px-2 py-1 bg-base-300">
      <button class="btn btn-xs btn-ghost" @click="source = !source">
        {{ source ? t('render') : t('source') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked, Renderer } from 'marked'

// Escape raw HTML blocks to prevent XSS when rendering user-provided markdown
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const safeRenderer = new Renderer()
safeRenderer.html = ({ text }: { text: string }) => escapeHtml(text)

const { t } = useI18n()

interface CodeFile {
  filename: string
  content: string
}

const props = withDefaults(defineProps<{
  code: CodeFile
  snippet?: object
  header?: boolean
  maxHeight?: number
  onlySource?: boolean
}>(), {
  header: true,
  onlySource: false
})

const source = ref(props.onlySource)
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

const ext = computed(() => {
  const parts = props.code.filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
})

const isMarkdown = computed(() => ext.value === 'md' || ext.value === 'markdown')
const isSvg = computed(() => ext.value === 'svg' && props.code.content.startsWith('<?xml'))
const isImage = computed(() =>
  ['jpg', 'bmp', 'png', 'jpeg', 'gif', 'svg'].includes(ext.value) &&
  /^data:image\/[\w+]+;base64,/.test(props.code.content)
)
const isRender = computed(() => isMarkdown.value || isSvg.value || isImage.value)

const renderedMarkdown = computed(() => {
  if (!isMarkdown.value) return ''
  return marked.parse(props.code.content, { renderer: safeRenderer }) as string
})
</script>
