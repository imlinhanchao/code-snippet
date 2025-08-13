<template>
  <Layout class="layout" v-if="snippet.id">
    <Content>
        <Tabs :animated="false" class="embed-tabs" v-model="tab">
            <TabPane 
                v-for="(c, i) in snippet.codes" 
                v-bind:key="c.id" 
                :label="getLabel(c.filename, 0, { custom: getFileIcon(c.filename) })" 
                :name="c.id"
            >
                <CodeRender :id="`code${i}`"
                    :code="c" :snippet="snippet" class="code"
                    :header="false" only-source
                >
                </CodeRender>
            </TabPane>
            <TabPane v-for="(c) in previewList" 
                v-bind:key="'preview' + c.id"
                :label="getLabel(c.filename, 0, { custom: 'fa fa-chrome' })" 
                :name="'preview' + c.id" 
                v-if="canPreview"
                class="preview-tab"
            >
                <iframe ref="iframe" class="preview" :src="`${$config.base.preview_url}/view/${snippet.id}/${c.filename}`">

                </iframe>
            </TabPane>
            <TabPane v-if="canExecute" :label="getLabel($t('execute'), 0, { custom: 'fa fa-terminal' })" name="execute" class="preview-tab">
                <Execute :snippet="snippet" :codes="snippet.codes" :auto="snippet.command == ''"></Execute>
            </TabPane>
            <TabPane 
                v-for="(c) in executeList" 
                v-bind:key="'execute' + c.id" 
                :label="getLabel($t('execute') + ' ' + c.filename, 0, { custom: 'fa fa-terminal' })" 
                :name="'execute' + c.id" 
                class="preview-tab"
            >
                <Execute :snippet="c" :codes="[c]" :auto="c.command == ''"></Execute>
            </TabPane>
        </Tabs>
    </Content>
    <Footer>
        <section class="layout-logo">
            <a :href="$config.base.domain" target="_blank">
                <img src="../assets/logo.png" alt="" />
                <span class="title">Code Snippet</span>
            </a>
        </section>
        <section class="info">
            <span>
                <a :href="`${$config.base.domain}/u/${snippet.username}`" target="_blank">@{{snippet.username}}</a>
            </span>
        </section>
    </Footer>
  </Layout>
</template>
<script>
import * as FileIcons from 'file-icons-js';
import 'file-icons-js/css/style.css'
import CodeRender from '../components/coderender'
import Execute from '../components/execute-panel'
export default {
    name: "Embed",
    components: {
        CodeRender,
        Execute,
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
            if (this.executeList.length) {
                this.tab = 'execute' + this.executeList[0].id;
            }
            if (this.canExecute) {
                this.tab = 'execute';
            }
            if (this.$router.query && this.$router.query.tab) {
                this.tab = this.$router.query.tab;
            }
        },
    },
    computed: {
        id() {
            return this.$route.params.id
        },
        canPreview() {
            return this.snippet.codes.some(c => c.filename.endsWith('.html') || c.filename.endsWith('.htm'));
        },
        canExecute() {
            return this.snippet.execute && this.snippet.language != 'HTML'
        },
        previewList() {
            return this.snippet.codes.filter(c => c.filename.endsWith('.html') || c.filename.endsWith('.htm'));
        },
        executeList() {
            return this.snippet.codes.filter(c => c.execute);
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
    margin: auto;
    font-size: 14px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .ivu-layout-content {
        flex: 1;
        overflow: hidden;
    }
}
.layout-logo a {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 .5em;
    font-weight: bold;
    color: #FFF;
    font-size: 20px;
    img {
        width: 30px;
        margin-right: 10px;
    }
    .title {
        white-space: nowrap;
    }
}
.info {
    font-size: 1.2em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    padding: .5em;
    text-align: right;
    background: #181a1b;
    font-weight: bold;
}
.ivu-layout-footer {
    padding: 0;
    background: #181a1b;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.embed-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    .code {
        height: 100%;
    }
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

.ivu-tabs .ivu-tabs-tabpane {
    height: 100%;
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
        overflow: auto;
    }
    .ivu-tabs-bar {
        margin: 0;
    }
}
</style>