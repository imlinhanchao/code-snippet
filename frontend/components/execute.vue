<template>
    <section>
        <Modal v-model="executeModal" title="Execute Codes" width="500" @on-visible-change="OnChange">
            <section class="content">
                <Tabs v-model="tab">
                    <TabPane label="Input" name="input" icon="md-return-left">
                        <p><Input v-model="input" type="textarea" :rows="6" placeholder="Text entered here will be sent to stdin." >
                        </Input></p>
                        <p v-if="edit"><Checkbox v-model="defaultInput">Save the Input as Example</Checkbox></p>
                    </TabPane>
                    <TabPane label="Output" name="output" icon="ios-arrow-forward">
                        <section class="result">
                            <p v-if="executed || loading">
                                <span 
                                style="color:#9be14f">{{$root.loginUser.username}}</span>@<span 
                                style="color:#fce96c">localhost</span>:<span 
                                style="color:#86b1d6">~</span>$ 
                                {{auto ? './auto-execute' : snippet.command}}&nbsp;&nbsp;
                            </p>
                            <p v-if="!executed || loading">{{tip}}</p>
                            <p v-html="toHtml(result.stderr)" v-if="result.stderr" style="color: #f44336"></p>
                            <p v-html="toHtml(result.stdout)" v-if="result.stdout"></p>
                            <p v-html="toHtml(result.error)" v-if="result.error"></p>
                        </section>
                    </TabPane>
                </Tabs>
            </section>
            <section slot="footer" class="footer">
                <Button type="error" @click="OnExecute" :loading="loading">Execute</Button>
                <Button @click="executeModal = false">Cancel</Button>
            </section>
        </Modal>
    </section>
</template>

<script>
export default {
    name: 'Execute',
    data() {
        return {
            executeModal: false,
            defaultInput: true,
            loading: false,
            result: {
                stdout: '',
                stderr: '',
                error: ''
            },
            executed: false,
            input: '',
            tab: 'input'
        }
    },
    props: {
        value: {
            type: Boolean,
            default: false,
            required: true
        },
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
        this.executeModal = this.value;
        this.inpuet = this.snippet.input;
        this.defaultInput = this.edit;
    },
    watch: {
        value(val) {
            if (this.executeModal != val) this.executeModal = val;
        },
        executeModal(val) {
            if (this.executeModal != val) {
                this.$emit("input", val);
            }
        },
        input(val) {
            if (this.input != val && this.defaultInput) {
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
                return this.result.stderr ? 'Compiler Error!' : 'Compiler Success';
            }
            else if (this.loading) {
                return 'Compiling...';
            }
            else {
                return 'Press execute to compile.';
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
                this.tab = 'output';
                this.executed = false;
                this.result = {
                    stdout: '',
                    stderr: '',
                    error: ''
                };
                this.loading = true;
                let snippet = Object.assign({}, this.snippet);
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
    margin: .5em 0 ;
    padding: 0 1em;
    white-space: nowrap;
}
.result {
    padding: .5em 0;
    background: #2b2b2c;
    height: 100%;
    overflow: auto;
}
</style>