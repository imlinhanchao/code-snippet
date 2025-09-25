<template>
    <section class="execute">
        <section class="execute-toolbar">
            <ButtonGroup size="small">
                <Button icon="md-return-left" :class="tab == 'input' ? 'active' : ''" @click="tab = 'input'">Input</Button>
                <Button icon="ios-arrow-forward" :class="tab == 'output' ? 'active' : ''" @click="tab = 'output'">Output</Button>
                <Button class="execute-btn" type="error" custom-icon="fa fa-play" @click="OnExecute(snippet)" :loading="loading">
                    {{$t('execute')}}
                </Button>
            </ButtonGroup>
        </section>
        <section class="execute-content" v-if="tab == 'input'">
            <p class="input-textarea">
                <Input v-model="input" type="textarea" :rows="6" placeholder="Text entered here will be sent to stdin." >
                </Input>
            </p>
        </section>
        <section class="execute-content result"  v-if="tab == 'output'">
            <p v-if="executed || loading">
                <span 
                style="color:#9be14f">user</span>@<span 
                style="color:#fce96c">localhost</span>:<span 
                style="color:#86b1d6">~</span>$ 
                {{auto ? './auto-execute' : snippet.command}}&nbsp;&nbsp;
            </p>
            <p v-if="!executed || loading">{{tip}}</p>
            <p v-html="toHtml(result.stderr)" v-if="result.stderr" style="color: #f44336"></p>
            <p v-html="toHtml(result.stdout)" v-if="result.stdout"></p>
            <p v-html="toHtml(result.error)" v-if="result.error"></p>
        </section>
    </section>
</template>

<script>
export default {
    name: 'Execute',
    data() {
        return {
            defaultInput: true,
            loading: false,
            result: {
                stdout: '',
                stderr: '',
                error: ''
            },
            executed: false,
            input: '',
            tab: 'output'
        }
    },
    props: {
        auto: {
            type: Boolean,
            default: false
        },
        snippet: {
            type: Object,
            default: {},
            required: true
        },
        codes: {
            type: Array,
            default: [],
            required: true
        },
        edit: {
            type: Boolean,
            default: false
        }
    },
    mounted() {
        this.input = this.snippet.input;
        this.defaultInput = this.edit;
    },
    watch: {
        'snippet.input'(val) {
            this.input = val;
        },
        value(val) {
            if (this.executeModal != val) this.executeModal = val;
        },
        executeModal(val) {
            if (this.executeModal != val) {
                this.$emit("input", val);
            }
        },
        input(val) {
            if (this.input != this.snippet.input && this.defaultInput) {
                this.$emit("change", val);
            }
        }
    },
    computed: {
        status() {
            if (this.result.stderr) {
                return 'error';
            }
            else if(!this.executed) {
                return 'info'
            }
            else {
                return 'success'
            }
        },
        tip() {
            if (this.executed) {
                return this.result.stderr ? this.$t('compiler_error') : this.$t('compiler_success');
            }
            else if (this.loading) {
                return this.$t('compiling');
            }
            else {
                return this.$t('press_exec');
            }
        },
        langs() {
            return this.$store.getters['snippet/langs'];
        },
    },
    methods: {
        OnChange (val) {
            this.$emit("input", val);
        },
        async OnExecute() {
            try {
                this.$uweb.trackPageview(
                    this.snippet.id ? this.$config.domain + `/execute/${this.snippet.id}` :this.$config.domain + `/execute`, 
                    this.$config.domain + this.$win.location.path);
                this.tab = 'output';
                this.executed = false;
                this.result = {
                    stdout: '',
                    stderr: '',
                    error: ''
                };
                this.loading = true;
                let snippet = Object.assign({}, this.snippet);
                snippet.input = this.input;
                if (this.auto) snippet.command = '';
                if (!snippet.language) snippet.language = this.getLanguage(this.codes[0]).language;
                let rsp = await this.$store.dispatch("snippet/execute", { snippet, codes: this.codes });
                this.loading = false;
                this.executed = true;
                if (rsp.state != 0) {
                    this.result.stderr = rsp.msg;
                    return;
                }
                this.result = rsp.data;
            } catch (err) {
                this.result.stderr = err.message;
                this.loading = false;
            }
        },
        toHtml(text) {
            return  text.replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/\t/g, '    ')
                        .replace(/\n/g, '<br>')
                        .replace(/\s/g, '&nbsp;')
        },
        getLanguage(f) {
            let ext = f.filename.split('.').slice(-1).join('');
            let lang = this.langs.find(l => l.ext == ext)
            return lang;
        }
    }
}
</script>

<style lang="less" scoped>
.footer {
    display: flex;
    justify-content: space-between;
    button {
        width: 45%;
        margin: 0 2.5%;
    }
}
p {
    margin: 0 ;
    padding: 0 1em;
    word-break: break-all;
}
.result {
    padding: .5em 0;
    background: #2b2b2c;
    height: 100%;
    overflow: auto;
}
.execute {
    display: flex;
    flex-direction: column;
    height: 100%;
    .execute-content {
        flex: 1;
    }
}
.execute-toolbar {
    padding: .5em;
    padding-bottom: 0;
    .active {
        border: #2b2b2c;
        background-color: #2b2b2c;
        color: white;
    }
    .ivu-btn {
        border: black;
    }
}
</style>
<style lang="less">
p.input-textarea {
    height: 100%;
    margin: 0;
    padding: 0;
    .ivu-input-wrapper {
        height: 100%;
        textarea {
            height: 100%;
            border: none;
            background-color: #2b2b2c;
        }
    }
}
</style>