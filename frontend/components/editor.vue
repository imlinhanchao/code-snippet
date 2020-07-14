<template>
    <section class="snippet-form">
        <Alert type="error" banner show-icon v-if="error_msg" closable>
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
                        <span class="command" v-if="canExecute" :class="{ iscmd: snippet.execute }" @click="OnExecute" title="Execute configuration">
                            <Icon custom="fa fa-terminal"></Icon>
                        </span>
                    </section>
                </section>
                <section v-if="snippet.execute && canExecute" style="margin: 1em 0">
                    <Input :readonly="autoexec" class="command" type="text" placeholder="input the execute command" v-model="snippet.command">
                        <Checkbox v-model="autoexec" slot="prepend" v-if="canAutoExec">Auto execute</Checkbox>
                        <Dropdown trigger="click" slot="prepend" @on-click="selectLang">
                            <a href="javascript:void(0)">
                                <img :src="langIcon" class="lang_img" v-if="snippet.language && langIcon" /> {{language}}
                                <Icon type="ios-arrow-down"></Icon>
                            </a>
                            <DropdownMenu slot="list" style="max-height: 30em; overflow:auto;">
                                <DropdownItem v-for="l in validLangs" :name="l.language" v-bind:key="l.language" 
                                style="text-align: left;">
                                    <img :src="l.icon" class="lang_img"/> <span class="lang_name">{{l.language}}</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Button slot="append" title="Try execute"><Icon custom="fa fa-rocket" /></Button>
                    </Input>
                </section>
            </article>
            <article class="editor" v-for="(f, i) in files" v-bind:key="i">
                <section class="editor-header">
                    <section class="code-info">
                        <Input class="filename" @on-change="OnChangeName(f, i)" type="text" placeholder="Filename include extension..." v-model="f.filename">
                            <span slot="append" class="editor-remove">
                            <Poptip 
                                confirm
                                title="Are you sure want to delete this code ?"
                                @on-ok="OnRemove(i)">
                                <Button :style="{ color: files.length <= 1 ? '#CCC': '#000'}" 
                            :disabled="files.length <= 1"><Icon custom="fa fa-trash-o"></Icon></Button>
                            </Poptip></span>
                        </Input>
                        <Button class="command" v-if="isExecute(f)" :class="{ iscmd: f.execute }" 
                            @click="OnExecuteFile(f)" title="Execute configuration">
                            <Icon custom="fa fa-terminal"></Icon>
                        </Button>
                    </section>
                    <section v-if="f.execute && isExecute(f)" style="padding: .5em 0">
                        <Input class="command" type="text" placeholder="input the execute command" 
                        v-model="f.command">
                            <span slot="prepend" >
                                <img :src="getLanguage(f).icon" class="lang_img" v-if="getLanguage(f)" /> 
                                {{getLanguage(f).language}}
                            </span>
                            <Button slot="append" title="Try execute"><Icon custom="fa fa-rocket" /></Button>
                        </Input>
                    </section>
                </section>
                <codemirror :ref="`editor${i}`"
                    v-model="f.content" 
                    :options="getOptions(f)">
                </codemirror>
            </article>
            <article class="submit">
                <section>
                    <Button @click="OnAddFile">Add File</Button>
                </section>
                <section>
                    <Button type="success">Create Snippet</Button>
                </section>
            </article>
        </Form>
    </section>
</template>

<script>
import VueCodeMirror from 'vue-codemirror'

export default {
    name: "editor",
    components: {
        codemirror: VueCodeMirror.codemirror
    },
    mounted() {
        CodeMirror.modeURL = 'https://libs.cdnjs.net/codemirror/5.55.0/mode/%N/%N.min.js'
    },
    data() {
        return {
            editorOptions: {
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
                execute: false,
                input: ''
            },
            files: [{
                filename: '',
                content: '',
                execute: false,
                command: '',
                input: '',
                ext: ''
            }],
            error_msg: 'Description can not be empty!',
            autoexec: true,
            canAutoExec: false
        };
    },
    watch: {
    },
    computed: {
        options () {
            return Object.assign(this.editorOptions, {
                mode: this.getMode(this.ext).mime
            })
        },
        canExecute() {
            let exts = this.langs.map(l => l.ext)
            return this.files.find(f => exts.indexOf(this.getExt(f)) >= 0) != null;
        },
        langs() {
            return this.$store.getters['snippet/langs'];
        },
        validLangs() {
            let exts = this.files.map(f => this.getExt(f))
            return this.langs.filter(l => exts.indexOf(l.ext) >= 0)
        },
        language() {
            return this.snippet.language || 'Select'
        },
        langIcon() {
            return this.langs.find(l => l.language == this.snippet.language)?.icon || ''
        }
    },
    methods: {
        OnAddFile() {
            this.files.push({
                filename: '',
                content: '',
                execute: false,
                command: '',
                input: '',
                ext: ''
            })
        },
        onEditorReady(cm) {
            console.log('the editor is readied!', cm)
        },
        onEditorFocus(cm) {
            console.log('the editor is focus!', cm)
        },
        OnChangeName(f, i) {
            let editor = this.getEditor(i);
            if (!editor) return;
            editor.setOption('mode', this.getMode(this.getExt(f)).mime);
            CodeMirror.autoLoadMode(editor, this.getMode(this.getExt(f)).mode)
            let ext = this.getExt(f);
            if (f.execute && ext != f.ext) {
                let lang = this.getLanguage(f);
                f.command = this.getCommand(lang, f.filename);
            }
            f.ext = ext;
        },
        OnExecute() {
            this.snippet.execute = !this.snippet.execute;
            if (!this.snippet.execute) return;
            let info = this.getExcuteInfo();
            if (info && this.snippet.language != info.lang.language) {
                this.snippet.language = info.lang.language;
                this.snippet.command = info.command;
                this.canAutoExec = !!info.lang.auto;
            }
        },
        OnRemove(i) {
            this.files.splice(i, 1);
        },
        isExecute(f) {
            let exts = this.langs.map(l => l.ext);
            return exts.indexOf(this.getExt(f)) >= 0;
        },
        OnExecuteFile(f) {
            f.execute = !f.execute;
            if (!f.execute) return;
            let lang = this.getLanguage(f);
            f.command = this.getCommand(lang, f.filename);
        },
        getMode(ext) {
            return CodeMirror.findModeByExtension(ext) || CodeMirror.findModeByExtension('text');
        },
        getExt(f) {
            return f.filename.split('.').slice(-1).join('');
        },
        getOptions(f) {
            return Object.assign(this.editorOptions, {
                mode: this.getMode(this.getExt(f)).mime
            })
        },
        getEditor(i) {
            return this.$refs[`editor${i}`][0] ? this.$refs[`editor${i}`][0].codemirror : null
        },
        getLanguage(f) {
            let ext = this.getExt(f);
            let lang = this.langs.find(l => l.ext == ext)
            return lang;
        },
        getExcuteInfo() {
            let exts = this.langs.map(l => l.ext)
            let file = this.files.find(f => exts.indexOf(this.getExt(f)) >= 0);
            if (!file) return null;

            let ext = this.getExt(file);
            let filename = file.filename;
            let lang = this.langs.find(l => l.ext == ext);
            if (!lang) return null;

            let command = this.getCommand(lang, filename);

            return {
                lang,
                command,
                file
            }
        },
        getCommand(lang, filename) {
            if (!lang) return '';
            let name = filename.split('.').slice(0, -1).join('');
            let command = lang.cmd.replace(/{{file}}/g, filename);
            if (command.indexOf('{{name}}') >= 0) command = command.replace(/{{name}}/g, name);
            if (command.indexOf('{{Name}}') >= 0) command = command.replace(/{{name}}/g, name.charAt(0).toUpperCase() + name.substr(1));
            return command
        },
        selectLang(language) {
            this.snippet.language = language;
            let lang = this.langs.find(l => l.language == language);
            if (!lang) return null;
            let file = this.files.find(f => f.filename.split('.').slice(-1).join('') == lang.ext);
            let filename = file?.filename || 'main.' + lang.ext;
            this.snippet.command = this.getCommand(lang, filename);
            this.canAutoExec = !!lang.auto
        }
    }
};
</script>
<style scoped lang="less">
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
.code-info {
    display: flex;
    justify-content: space-between;
    .command {
        margin: 0 .5em;
        color: #999;
        padding: 5px 10px 6px;
        &.iscmd {
            color: #2d8cf0;
            border-color: #2d8cf0;
            box-shadow: none;
        }
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
.snippet-form .ivu-alert-close {
    top: 0;
    bottom: 0;
    margin: auto;
    height: 12px;
}
.editor-remove {
    text-align: left;
    .ivu-poptip-confirm .ivu-btn-primary {
        color: #fff;
        background-color: #2d8cf0;
        border-color: #2d8cf0;
    }
}
</style>