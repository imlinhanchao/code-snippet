<template>
    <section class="snippet-form">
        <Form class="layout-form">
            <article class="snippet">
                <section class="snippet-data">
                    <section style="padding: 0 1em" class="isprivate" v-if="snippet.private && isUpdate"><Icon custom="fa fa-lock" title="Private"></Icon></section>
                    <Input class="description" :class="{ isprivate: snippet.private }" type="text" placeholder="Snippet description..." v-model="snippet.description"></Input>
                    <section class="setting">
                        <span v-if="!isUpdate" class="private" :class="{ isprivate: snippet.private }" @click="snippet.private = !snippet.private" :title="snippet.private ? 'Private' : 'Public'">
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
                                style="text-align: left;padding: 2px 8px">
                                    <img :src="l.icon" class="lang_img"/> <span class="lang_name">{{l.language}}</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Button slot="append" title="Try execute" @click="OnRun"><Icon custom="fa fa-rocket" /></Button>
                    </Input>
                </section>
            </article>
            <article class="editor" v-for="(f, i) in files" v-show="!f.remove" v-bind:key="i" :id="`code${i}`">
                <section class="editor-header">
                    <section class="code-info">
                        <Input :maxlength="50" class="filename" @on-change="OnChangeName(f, i)" type="text" placeholder="Filename include extension..." v-model="f.filename">
                            <span slot="append" class="editor-remove">
                            <Poptip 
                                confirm
                                title="Are you sure want to delete this code ?"
                                @on-ok="OnRemove(i)">
                                <Button :style="{ color: files.length <= 1 ? '#535353': '#f0f0f0'}" 
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
                    :options="$root.getCodeOptions(f)">
                </codemirror>
            </article>
            <article class="submit">
                <section>
                    <Button @click="OnAddFile">Add File</Button>
                </section>
                <section>
                    <Button type="success" v-if="!isUpdate"
                        :disabled="!canSubmit" :loading="loading"
                    @click="OnCreate">Create Snippet</Button>
                    <Button type="info"  v-if="isUpdate" :loading="loading"
                        :disabled="!canSubmit"
                    @click="OnUpdate">Update Snippet</Button>
                    <Button type="default"  v-if="isUpdate"
                    @click="$router.push(`/s/${id}`)">Cancel</Button>
                </section>
            </article>
        </Form>
        <section class="snippet-anchor" v-if="files.length > 1">
            <Anchor show-ink :bounds="10" :scroll-offset="65">
                <AnchorLink v-for="(f, i) in files" v-bind:key="i" :href="`#code${i}`" :title="f.filename || `# ${i}`" />
            </Anchor>
        </section>
        <Execute v-model="executeModal" :snippet="snippet" :codes="files" :auto="autoexec"></Execute>
    </section>
</template>

<script>
import VueCodeMirror from 'vue-codemirror'
import Execute from './execute'

export default {
    name: "editor",
    components: {
        codemirror: VueCodeMirror.codemirror,
        Execute
    },
    async mounted() {
        if (this.id) {
            let rsp = await this.$store.dispatch('snippet/get', this.id);
            this.$root.isLogin || await this.$store.dispatch('account/checklogin');
            if (rsp && rsp.state == 0) {
                this.snippet = rsp.data;
                this.files = rsp.data.codes;
                this.autoexec = this.snippet.command === '';
                if (this.autoexec) {
                    let info = this.getExcuteInfo();
                    this.snippet.command = info.command;
                }
                if (this.snippet.username != this.$root.loginUser.username) {
                    this.$router.push(`/s/${this.snippet.id}`);
                }
                setTimeout(() => this.files.forEach(this.loadCodeMode), 200);
            } else {
                this.$root.message($m.ERROR, rsp.msg);
                this.$router.push('/');
            }  
        }
    },
    data() {
        return {
            executeModal: false,
            snippet: {
                title: '',
                description: '',
                private: false,
                language: '',
                command: '',
                execute: false,
                input: '',
                fork_from: '',
                username: this.$root.loginUser.username
            },
            files: [{
                filename: '',
                content: '',
                execute: false,
                command: '',
                input: '',
                ext: ''
            }],
            error_msg: '',
            autoexec: true,
            loading: false,
            
        };
    },
    watch: {
    },
    computed: {
        id () {
            return this.$route.params.id
        },
        isUpdate () {
            return !!this.id
        },
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
            let lang = this.langs.find(l => l.language == this.snippet.language)
            return lang ? lang.icon : ''
        },
        hasInvaidFile() {
            return this.files.filter(f => f.filename !== '' && f.content !== '').length > 0
        },
        canSubmit() {
            return this.snippet.description !== '' && this.hasInvaidFile
        },
        canAutoExec() {
            let lang = this.langs.find(l => l.language == this.snippet.language);
            return lang ? !!lang.auto : false;
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
            });
            this.$router.replace(`#code${this.files.length - 1}`)
        },
        onEditorReady(cm) {
            console.log('the editor is readied!', cm)
        },
        onEditorFocus(cm) {
            console.log('the editor is focus!', cm)
        },
        OnChangeName(f, i) {
            let ext = this.getExt(f);
            if (f.execute && ext != f.ext) {
                let lang = this.getLanguage(f);
                f.command = this.getCommand(lang, f.filename);
            }
            f.ext = ext;
            this.loadCodeMode(f, i);
        },
        OnExecute() {
            this.snippet.execute = !this.snippet.execute;
            if (!this.snippet.execute) return;
            let info = this.getExcuteInfo();
            if (info && this.snippet.language != info.lang.language) {
                this.snippet.language = info.lang.language;
                this.snippet.command = info.command;
            }
        },
        OnRemove(i) {
            if (!this.files[i].id)
                this.files.splice(i, 1);
            else {
                this.$set(this.files[i], 'remove', true)
            }
        },
        async OnVerify() {
            try {
                let snippet = this.snippet;
                snippet.codes = this.files;
    
                let order = 0;
                for(let i = 0; i < this.files.length; i++) {
                    let f = this.files[i];
                    if (f.remove) continue;
                    snippet.codes[i].order = order++;
                    if (f.filename ===  '') {
                        throw new Error(`The filename of <a href="#code${i}">#${i}</a> is empty! `);
                    }
                    if (f.content ===  '') {
                        throw new Error(`The content of <a href="#code${i}">#${i}</a> is empty! `);
                    }
                }

                if(Array.from(new Set(this.files.filter(f => !f.remove).map(f => f.filename))).length != this.files.length) {
                    throw new Error('There are duplicate filenames!');
                }
    
                snippet.command = this.autoexec ? '' : snippet.command;
                return snippet;
            } catch (error) {
                throw error;
            }
        },
        async OnCreate() {
            try {
                this.loading = true;
                let snippet = await this.OnVerify();
                let rsp = await this.$store.dispatch("snippet/create", snippet);
                this.loading = false;
                if (rsp.state != 0) {
                    this.$root.message($m.ERROR, rsp.msg);
                    return;
                }
                this.$router.push(`/s/${rsp.data.id}`);
                this.$root.message($m.SUCCESS, 'Create Success');
            } catch (err) {
                this.$root.message($m.ERROR, err.message);
                this.loading = false;
            }
        },
        async OnUpdate() {
            try {
                this.loading = true;
                let snippet = await this.OnVerify();
                let rsp = await this.$store.dispatch("snippet/update", snippet);
                this.loading = false;
                if (rsp.state != 0) {
                    this.$root.message($m.ERROR, rsp.msg);
                    return;
                }
                this.$router.push(`/s/${rsp.data.id}`);
                this.$root.message($m.SUCCESS, 'Update Success');
            } catch (err) {
                this.$root.message($m.ERROR, err.message);
                this.loading = false;
            }
        },
        OnRun() {
            this.executeModal = true;
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
        loadCodeMode(f, i) {
            let editor = this.getEditor(i);
            if (!editor) return;
            editor.setOption('mode', this.getMode(this.getExt(f)).mime);
            this.$code.autoLoadMode(editor, this.getMode(this.getExt(f)).mode)
        },
        getMode(ext) {
            return this.$code.findModeByExtension(ext) || this.$code.findModeByExtension('text');
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
            let filename = file ? file.filename : 'main.' + lang.ext;
            this.snippet.command = this.getCommand(lang, filename);
        }
    }
};
</script>
<style scoped lang="less">
.vue-codemirror {
    border: 1px solid #373c3e;
    border-radius: 0 0 .5em .5em;
    overflow: hidden;
}
.editor {
    margin: 1em 0;
}
.editor-header {
    background: #1a1c1e;
    padding: .5em;
    border: 1px solid #373c3e;
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
    max-width: 980px;
    margin: auto;
    margin: 1em 0;
    padding: 0 1em;
}
.snippet-form {
    display: flex;
    justify-content: center;
    .snippet-anchor {
        margin-top: 1em;
        padding: 0 1em;
    }
}
@media (max-width: 480px) {
    .snippet-form {
        flex-direction: column-reverse;
        .snippet-anchor {
            padding: 0;
        }
    }
}
</style>
<style lang="less">
.CodeMirror-gutters {
    border: 0;
}
.editor-remove {
    text-align: left;
    .ivu-poptip-confirm .ivu-btn-primary {
        color: #fff;
        background-color: #2d8cf0;
        border-color: #2d8cf0;
    }
}
.ivu-anchor-link-title {
    line-height: 1.5;
}
@media (max-width: 480px) {
    .ivu-anchor-ink {
        display: none;
    }
    .ivu-anchor {
        display: flex;
    }
    .ivu-affix {
        background: #24292e;
        box-shadow: 0 0 1px #333333;
        padding: .5em 1em;
    }
}
</style>