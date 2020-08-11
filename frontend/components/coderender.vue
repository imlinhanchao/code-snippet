<template>
    <section>
        <section class="code-header">
            <section class="filename">{{code.filename}}</section>
            <Action :snippet="snippet" :code="code" :render="isRender"  @source="source = arguments[0]"></Action>
        </section>
        <section class="code-content" :style="maxHeight ? { maxHeight: `${maxHeight}px`, overflow: 'auto' } : {}">
            <pre v-if="!isRender || source" v-hljs="code.content"><code></code></pre>
            <section class="markdown markdown-body" v-if="isMarkdown && !source" v-html="$markdown.markdownIt.render(code.content)"></section>
        </section>
        <slot></slot>
    </section>
</template>

<script>
export default {
    name: 'CodeRender',
    components: {
        Action: () => import('../components/action'), 
    },
    props: {
        code: {
            type: Object,
            required: true
        },
        snippet: {
            type: Object,
            required: true
        },
        maxHeight: {
            type: [Number, Boolean],
            default: false
        }
    },
    data() {
        return {
            source: false
        }
    },
    computed: {
        isMarkdown() {
            return this.ext == 'md' || this.ext == 'markdown';
        },
        ext() {
            return this.$root.getCodeExt(this.code.filename);
        },
        isRender() {
            return this.isMarkdown;
        }
    }
}
</script>

<style lang="less" scoped>
.code-header {
    background: #1a1c1e;
    padding: .5em;
    border: 1px solid #373c3e;
    border-bottom: 0;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    display: flex;
    justify-content: space-between;
    .filename {
        flex: 1;
        width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.code-content {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border: 1px solid #373c3e;
    overflow: hidden;
    pre {
        margin: 0;
    }
    code {
        font-size: .8em;
    }
    .markdown {
        padding: 1em 2em;
        background: #1b1b1b;
        color: #989796;
    }
}
</style>