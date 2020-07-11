<template>
    <Layout class="layout">
        <Form class="layout-form">
            <Input type="text" placeholder="Snippet description..."></Input>
            <article class="editor">
                <section class="editor-header">
                    <Input class="filename" type="text" placeholder="Filename include extension..."></Input>
                </section>
                <codemirror ref="editor"
                    :value="code" 
                    :options="editorOptions"
                    @ready="onEditorReady"
                    @focus="onEditorFocus"
                    @input="onCodeChange">
                </codemirror>
            </article>
        </Form>
    </Layout>
</template>
<script>
import VueCodeMirror from 'vue-codemirror'

export default {
    name: "home",
    components: {
        codemirror: VueCodeMirror.codemirror
    },
    mounted() {
        if (this.$root.isLogin) {
            //this.$router.replace(`/u/${this.$root.loginUser.username}`)
        }
        console.log('this is current codemirror object', this.codemirror);
        CodeMirror.modeURL = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.55.0/mode/%N/%N.min.js'
        CodeMirror.autoLoadMode(this.codemirror, 'javascript')
    },
    data() {
        return {
            code: 'const a = 10',
            editorOptions: {
                // codemirror options
                tabSize: 4,
                mode: 'text/javascript',
                theme: 'elegant',
                lineNumbers: true,
                line: true,
                // more codemirror options, 更多 codemirror 的高级配置...
            }
        };
    },
    computed: {
        codemirror() {
            return this.$refs.editor.codemirror
        }
    },
    methods: {
        onEditorReady(cm) {
            console.log('the editor is readied!', cm)
        },
        onEditorFocus(cm) {
            console.log('the editor is focus!', cm)
        },
        onCmCodeChange(newCode) {
            console.log('this is new code', newCode)
            this.code = newCode
        }
    }
};
</script>
<style scoped lang="less">
.layout {
    padding: 1em;
}
.vue-codemirror {
    border: 1px solid #e1e4e8;
    border-radius: 0 0 .5em .5em;
}
.editor {
    margin: 1em 0;
}
.editor-header {
    background: #fafbfc;
    padding: .5em;
    border: 1px solid #e1e4e8;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}
.filename {
    width: 15em;
}
</style>
<style lang="less">
.CodeMirror-gutter {
    background: #FFF;
}
.CodeMirror-gutters {
    border: 0;
}
</style>