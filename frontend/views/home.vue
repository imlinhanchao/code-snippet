<template>
    <Layout class="layout">
        <Form class="layout-form">
            <Input type="text" placeholder="Snippet description..."></Input>
            <article class="editor" v-for="(f, i) in files" v-bind:key="i">
                <section class="editor-header">
                    <Input class="filename" @on-change="OnChangeName(i)" type="text" placeholder="Filename include extension..." v-model="f.filename"></Input>
                </section>
                <codemirror :ref="`editor${i}`"
                    v-model="f.content" 
                    :options="getOptions(i)">
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
    },
    data() {
        return {
            editorOptions: {
                // codemirror options
                tabSize: 4,
                indentUnit: 4,
                mode: 'clike',
                theme: 'github',
                lineNumbers: true,
                lineWrapping: true,
                indentWithTabs: true,
                cursorHeight: .7
            },
            files: [{
                filename: '',
                content: ''
            }]
        };
    },
    computed: {
        codemirror() {
            return this.$refs.editor0[0].codemirror
        },
        ext() {
            return this.files[0].filename.split('.').slice(-1).join('');
        },
        options () {
            return Object.assign(this.editorOptions, {
                mode: this.getMode(this.ext).mime
            })
        }
    },
    methods: {
        onEditorReady(cm) {
            console.log('the editor is readied!', cm)
        },
        onEditorFocus(cm) {
            console.log('the editor is focus!', cm)
        },
        onCodeChange(i) {
            return (code) => {
                this.files[i] = code
            }
        },
        OnChangeName(i) {
            let editor = this.getEditor(i);
            if (!editor) return;
            editor.setOption('mode', this.getMode(this.getExt(i)).mime);
            CodeMirror.autoLoadMode(editor, this.getMode(this.getExt(i)).mode)
        },
        getMode(ext) {
            return CodeMirror.findModeByExtension(ext) || CodeMirror.findModeByExtension('text');
        },
        getExt(i) {
            return this.files[i].filename.split('.').slice(-1).join('');
        },
        getOptions(i) {
            return Object.assign(this.editorOptions, {
                mode: this.getMode(this.getExt(i)).mime
            })
        },
        getEditor(i) {
            return this.$refs[`editor${i}`][0] ? this.$refs[`editor${i}`][0].codemirror : null
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