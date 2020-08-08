<template>
    <section class="action">
        <a v-if="$root.getCodeExt(code.filename) == 'html'" @click.prevent="previewModal=true" 
        class="action-link" :href="`${$config.base.preview_url}/view/${snippet.id}/${code.filename}`"
        target="_blank" title="Preview">
            <Icon custom="fa fa-chrome"></Icon>
        </a>
        <a type="button" title="Copy Code to Clipboard"
            v-clipboard:copy="code.content"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">
            <Icon custom="fa fa-files-o"></Icon>
        </a>
        <Icon class="action-link execute" custom="fa fa-terminal" v-if="code.execute" title="Execute" @click="executeModal = true"></Icon>
        <Execute v-if="executeModal" v-model="executeModal" :snippet="code" :codes="[code]" :auto="false"></Execute>
        <Preview v-if="previewModal" v-model="previewModal" :snippet="snippet" :code="code.filename"></Preview>
    </section>
</template>

<script>
export default {
    name: 'Action',
    components: {
        Execute: () => import('./execute'),
        Preview: () => import('./preview')
    },
    props: {
        snippet: {
            required: true
        },
        code: {
            required: true
        }
    },
    data() {
        return {
            executeModal: false,
            previewModal: false
        }
    },
    computed: {
    },
    methods: {
        onCopy() {
            this.$Message.success('The code has been copied to your clipboard!');
        },
        onError(e) {
            this.$Message.error('Copy Failed:' + e.message);
        }
    }
}
</script>

<style lang="less" scoped>
.action {
    padding: 0 .5em;
    line-height: 1.5;
}
.action-link {
    display: inline-block;
    padding: 0 .5em;
}
.execute {
    cursor: pointer;
    &:hover {
        color: #2d8cf0;
    }
}
</style>