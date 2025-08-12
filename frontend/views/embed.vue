<template>
  <Layout class="layout" v-if="snippet.id">
    <Content>
        <Tabs :animated="false" class="embed-tabs" v-model="tab">
            <TabPane 
                v-for="(c, i) in snippet.codes" 
                v-bind:key="i" 
                :label="getLabel(c.filename, 0, { custom: getFileIcon(c.filename) })" 
                :name="c.id"
            >
                <CodeRender :id="`code${i}`"
                    :code="c" :snippet="snippet" class="code"
                    :header="false" only-source
                >
                </CodeRender>
            </TabPane>
            <TabPane v-for="(c, i) in previewList" 
                v-bind:key="i"
                :label="getLabel(c.filename, 0, { custom: 'fa fa-chrome' })" 
                :name="'preview' + c.id" 
                v-if="canPreview"
                class="preview-tab"
            >
                <iframe ref="iframe" class="preview" :src="`${$config.base.preview_url}/view/${snippet.id}/${c.filename}`">

                </iframe>
            </TabPane>
            <TabPane v-if="canExcute" label="Input" name="input" icon="md-return-left">
                <p class="input-textarea">
                    <Input v-model="input" type="textarea" :rows="6" placeholder="Text entered here will be sent to stdin." >
                    </Input>
                </p>
            </TabPane>
            <TabPane v-if="canExcute" label="Output" name="output" icon="ios-arrow-forward">
                <section class="result">
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
            </TabPane>
            <section slot="extra" class="extra">
                <Button class="execute-btn" v-if="canExcute" type="error" size="small" icon=" fa fa-play" @click="OnExecute" :loading="loading">{{$t('execute')}}</Button>
            </section>
        </Tabs>
    </Content>
    <Footer class="info">
        <img :src="`/api/account/avatar/${snippet.username}`" />
        <span>
            <router-link :to="`/u/${snippet.username}`">{{snippet.username}}</router-link>
        </span>
    </Footer>
  </Layout>
</template>
<script>
import * as FileIcons from 'file-icons-js';
import 'file-icons-js/css/style.css'
import CodeRender from '../components/coderender'
export default {
    name: "snippet",
    components: {
        CodeRender,
    },
    async mounted() {
        await this.Init();
    },
    data() {
        return {
            snippet: {
                id: '',
                title: '',
                description: '',
                private: false,
                language: '',
                command: '',
                execute: false,
                input: '',
                fork_from: '',
                username: '',
                codes: [],
                stars: 0,
                forks: 0
            },
            tab: 'preview',
            last_data: new Date().getTime(),
            result: {
                stdout: '',
                stderr: '',
                error: ''
            },
            executed: false,
            input: '',
            loading: false
        };
    },
    methods: {
        getLabel(title, count, { custom, type }) {
            return (h) => {
                return h('div', [
                    h('Icon', {
                        props: {
                            custom,
                            type
                        }
                    } ),
                    h('span', title),
                    h('Badge', {
                        props: {
                            count
                        },
                        style: {
                            paddingLeft: '5px'
                        }
                    })
                ])
            }
        },
        getFileIcon(filename) {
            let name = FileIcons.getClassWithColor(filename);
            return name || 'fa fa-file-code-o';
        },
        async getSnippet() {
            let rsp = await this.$store.dispatch('snippet/get', this.id);
            if (rsp && rsp.state == 0) {
                rsp.data.codes.forEach(c => c.source = false);
                this.snippet = Object.assign(this.snippet, rsp.data);
                return true;
            } else {
                this.$root.message($m.ERROR, rsp.msg);
                this.$router.push('/');
                return false;
            }  
        },
        async Init() {
            if(!await this.getSnippet()) return;
            let title = this.snippet.description;
            this.$util.title(title);
            this.tab = this.snippet.codes[0].id
            await this.$nextTick();
            if (this.canPreview) {
                this.$refs['iframe'] && (this.$refs['iframe'].onload = () => {
                    this.loading = true;
                });
                this.tab = 'preview' + this.previewList[0].id
            }
            if (this.canExcute) {
                this.tab = 'input'
            }
            if (this.$router.query.tab) {
                this.tab = this.$router.query.tab;
            }
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
                snippet.input = this.input;
                if (this.auto) snippet.command = '';
                if (!snippet.language) snippet.language = this.getLanguage(this.codes[0]).language;
                let rsp = await this.$store.dispatch("snippet/execute", { snippet, codes: snippet.codes });
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
        },
    },
    computed: {
        id() {
            return this.$route.params.id
        },
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
        canPreview() {
            return this.snippet.codes.some(c => c.filename.endsWith('.html') || c.filename.endsWith('.htm'));
        },
        canExcute() {
            return this.snippet.execute && this.snippet.language != 'HTML'
        },
        previewList() {
            return this.snippet.codes.filter(c => c.filename.endsWith('.html') || c.filename.endsWith('.htm'));
        }
    },
    watch: {
        $route() {
            this.Init();
        }
    }
};
</script>
<style scoped lang="less">
.loading {
    text-align: center;
    margin: 2em auto;
}
.layout {
    width: 100%;
    max-width: 1080px;
    margin: auto;
    font-size: 14px;
    height: 100%;
}
.info {
    font-size: 1em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    padding: .5em;
    text-align: right;
    background: #181a1b;
    color: #FFF;
    img {
        width: 1em;
        height: 1em;
        vertical-align: middle;
        border: 1px solid #FFF;
        background: #FFF;
        border-radius: 50%;
    }
    span {
        vertical-align: middle;
    }
}
.embed-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.code-desc {
    padding: 0 1em;
}
.codes {
    display: flex;
    .code-list {
        flex: 1;
        padding: 0 1em;
        width: 0;
    }
}
.code-anchor {
    margin-top: 1em;
    padding: 0 1em;
    max-width: 20%;
}

@media (max-width: 480px) {
    .header {
        position: relative;
        h1 {
            font-size: 1.5em;
        }
        .header-section {
            .actions {
                position: relative;
                .action-menu {
                    display: inline-block;
                }
                .triangle {
                    position: absolute;
                    top: 29px;
                    right: -4px;
                    color: #181a1b;
                    text-shadow: 0 -1px 0px #3a404d;
                    font-size: 1.5em;
                    z-index: 110;
                }
                .action-list {
                    flex-direction: column;
                    border: 1px solid #515a6e;
                    border-radius: 4px;
                    background-color: #181a1b;
                    position: absolute;
                    right: -.7em;
                    top: 45px;
                    z-index: 100;
                    li {
                        width: 6em;
                        .count {
                            display: none;
                        }
                        .action-btn {
                            border: 0;
                            margin: 0;
                            .ivu-icon {
                                display: inline-block;
                                width: 1em;
                            }
                        }
                    }
                }
                .action-menu-hide {
                    display: none;
                }
            }
        }
    }
    .codes {
        flex-direction: column-reverse;
        .code-list {
            width: auto;
        }
    }
    .code-anchor {
        padding: 0;
        max-width: none;
        margin-top: 0;
    }
    .stars, .forks {
        .ivu-col {
            width: 100%;
        }
    }
    .comment {
        padding-left: 0;
        .comment-header {
            padding: 0.5em 1em .5em .5em;
            font-size: .8em;
            .triangle {
                display: none;
            }
            img {
                position: static;
                width: 1.2em;
                height: 1.2em;
            }
            .comment-menu {        
                .triangle {
                    display: inline;
                }
                .menu-list {
                    top: 38px;
                }
            }

        }
        .comment-area {
            img, .triangle {
                display: none;
            }
        }
    }
}
.input-textarea {
    padding: .5em;
}
.result {
    padding: .5em;
    background: #2b2b2c;
    height: 100%;
    overflow: auto;
}
.extra {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .5em;
}

.preview {
    border: 0;
    width: 100%;
    height: 100%;
}
.execute-btn{
    margin: 2px;
}
.preview-tab {
    height: 100%;
}
</style>

<style lang="less">
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
body, html {
    height: 100%;
}
.embed-tabs {
    .ivu-tabs-content {
        flex: 1;
    }
    .ivu-tabs-bar {
        margin: 0;
    }
}
</style>