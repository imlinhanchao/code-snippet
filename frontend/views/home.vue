<template>
    <Layout class="layout">
        <Alert type="error" banner show-icon v-if="error_msg" style="margin: -1.4em -1.3em 1em -1.3em;">
            Error:
            <span slot="desc">
                {{error_msg}}
            </span>
        </Alert>
        <Form class="layout-form">
            <article class="snippet">
                <section class="snippet-data">
                    <Input class="description" :class="{ isprivate: snippet.private }" type="text" placeholder="Snippet description..." v-model="snippet.description"></Input>
                    <section class="setting">
                        <span class="private" :class="{ isprivate: snippet.private }" @click="snippet.private = !snippet.private" :title="snippet.private ? 'Private' : 'Public'">
                            <Icon custom="fa fa-lock" v-if="snippet.private"></Icon>
                            <Icon custom="fa fa-unlock-alt" v-if="!snippet.private"></Icon>
                        </span>
                        <span class="command" v-if="canRun" :class="{ iscmd: snippet.execute }" @click="snippet.execute = !snippet.execute" title="Execute configuration">
                            <Icon custom="fa fa-terminal"></Icon>
                        </span>
                    </section>
                </section>
                <section v-if="snippet.execute" style="margin: 1em 0">
                    <Input class="command" type="text" placeholder="input the execute command" v-model="snippet.command">
                        <Dropdown slot="prepend" @on-click="selectLang">
                            <a href="javascript:void(0)">
                                <img :src="langIcon" class="lang_img" v-if="snippet.language && langIcon" /> {{language}}
                                <Icon type="ios-arrow-down"></Icon>
                            </a>
                            <DropdownMenu slot="list" style="max-height: 30em; overflow:auto;">
                                <DropdownItem v-for="l in langs" :name="l.language" v-bind:key="l.language" 
                                style="text-align: left;">
                                    <img :src="l.icon" class="lang_img"/> <span class="lang_name">{{l.language}}</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Button slot="append" title="Try execute"><Icon custom="fa fa-terminal" /></Button>
                    </Input>
                </section>
            </article>
            <article class="editor" v-for="(f, i) in files" v-bind:key="i">
                <section class="editor-header">
                    <Input class="filename" @on-change="OnChangeName(i)" type="text" placeholder="Filename include extension..."
                    :style="{width: files.length > 1 ? '20em': '12em'}" v-model="f.filename">
                        <Button slot="append" v-if="files.length > 1"><Icon custom="fa fa-trash-o"></Icon></Button>
                    </Input>
                </section>
                <codemirror :ref="`editor${i}`"
                    v-model="f.content" 
                    :options="getOptions(i)">
                </codemirror>
            </article>
            <article class="submit">
                <section>
                    <Button>Add File</Button>
                </section>
                <section>
                    <Button type="success">Create Snippet</Button>
                </section>
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
            snippet: {
                title: '',
                description: '',
                private: false,
                language: '',
                command: '',
                execute: false
            },
            files: [{
                filename: '',
                content: ''
            }],
            error_msg: 'Description can not be empty!',
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
        },
        canRun() {
            return true;
        },
        langs() {
            return this.$store.getters['snippet/langs'];
        },
        language() {
            return this.snippet.language || 'Select'
        },
        langIcon() {
            return this.langs.find(l => l.language == this.snippet.language)?.icon || ''
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
        },
        getCommand() {
            this.snippet.command = 'gcc a.c && ./a.out'
        },
        selectLang(lang) {
            this.snippet.language = lang;
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
    border-bottom: 0;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}
.snippet-data {
    display: flex;
    .setting {
        padding-right: 1em;
        display: flex;
        span {
            margin-left: 1em;
            color: #999;
        }
        .command.iscmd {
            color: #2d8cf0;
        }
        .isprivate {
            color: #e4c811;
            text-shadow: 0 0 2px #e3deb9;
        }
    }
    .description.isprivate {
        box-shadow: 0 0 3px 0px #e4c811;
        border-radius: 4px;
    }
    .private {
        cursor: pointer;
        transition: all .5s;
    }
}
.others {
    padding: 0 10px;
    margin: 1em 0;
}
.lang_img {
    height: 1.5em;
    vertical-align: middle;
    margin-right:.5em
}
.lang_name {
    vertical-align: middle;
}
.filename {
    width: 20em;
}
.submit {
    display: flex;
    justify-content: space-between;
}
.layout-form {
    width: 100%;
    max-width: 900px;
    margin: auto;
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