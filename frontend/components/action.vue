<template>
    <section class="action">
        <a v-if="$root.getCodeExt(code.filename) == 'html'" class="action-link" :href="`${$config.base.preview_url}/view/${snippet.id}/${code.filename}`"
        target="_blank" title="Preview">
            <Icon custom="fa fa-chrome"></Icon>
        </a>
        <a type="button" title="Copy Code to Clipboard"
            v-clipboard:copy="code.content"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">
            <Icon custom="fa fa-files-o"></Icon>
        </a>
    </section>
</template>

<script>
export default {
    name: 'Action',
    props: {
        snippet: {
            required: true
        },
        code: {
            required: true
        }
    },
    computed: {
    },
    methods: {
        onCopy() {
            this.$Message.success('The code has been copied to your clipboard!');
        },
        onError: function (e) {
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
</style>