<template>
  <Layout class="layout" v-if="snippet.id">
        <header class="header">
            <section class="header-section">
                <h1 class="info">
                    <img :src="`/api/account/avatar/${snippet.username}`" />
                    <span>
                        <router-link :to="`/u/${snippet.username}`">{{snippet.username}}</router-link> /
                        <router-link :to="`/s/${snippet.id}`">{{snippet.codes[0].filename}}</router-link>
                    </span>
                </h1>
                <section class="actions">
                    <span v-if="snippet.username == $root.loginUser.username">
                        <Button class="action-btn" @click="$router.push(`/edit/${snippet.id}`)">
                            <Icon custom="fa fa-pencil" ></Icon> <span> Edit</span>
                        </Button>
                    </span>
                    <span v-if="snippet.username == $root.loginUser.username">
                        <Button class="action-btn remove-btn">
                            <Icon custom="fa fa-trash-o" ></Icon> <span> Delete</span>
                        </Button>
                    </span>
                    <span><Button class="action-btn">
                        <Icon custom="fa fa-star-o" ></Icon> <span> Star</span>
                    </Button><router-link :to="`/s/${id}/stargazers`" class="count">0</router-link></span>
                    <span><Button class="action-btn">
                        <Icon custom="fa fa-code-fork" ></Icon> <span> Fork</span>
                    </Button><router-link :to="`/s/${id}/forks`" class="count">0</router-link></span>
                </section>
            </section>
            <aside>
                <p>Created at {{new Date(snippet.create_time * 1000).toLocaleString()}}</p>
            </aside>
        </header>
        <article>
            <section class="code-desc">
                {{snippet.description}}
            </section>
            <article class="codes">
                <section class="code-list">
                    <section :id="`code${i}`" v-for="(c, i) in snippet.codes" v-bind:key="i" class="code">
                        <section class="code-header">
                            <span>{{c.filename}}</span>
                        </section>
                        <section class="code-content">
                            <pre v-highlightjs="c.content"><code></code></pre>
                        </section>
                    </section>
                </section>
                <section class="code-anchor">
                    <Anchor show-ink :bounds="10" :scroll-offset="65">
                        <AnchorLink v-for="(f, i) in snippet.codes" v-bind:key="i" :href="`#code${i}`" :title="f.filename || `# ${i}`" />
                    </Anchor>
                </section>
            </article>
        </article>
  </Layout>
</template>
<script>
import VueCodeMirror from 'vue-codemirror'

export default {
    name: "snippet",
    components: {
        codemirror: VueCodeMirror.codemirror
    },
    async mounted() {
        if(!this.id) {
            this.$root.message($m.WARN, 'Not invaild snippet!');
            this.$router.push('/');
            return;
        }
        CodeMirror.modeURL = 'https://libs.cdnjs.net/codemirror/5.55.0/mode/%N/%N.min.js'

        let rsp = await this.$store.dispatch('snippet/get', this.id);
        if (rsp && rsp.state == 0) {
            this.snippet = rsp.data;
        } else {
            this.$root.message($m.ERROR, rsp.msg);
        }  
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
                codes: []
            },
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
        };
    },
    methods: {

    },
    computed: {
        id() {
            return this.$route.params.id
        }
    },
    watch: {
    }
};
</script>
<style scoped lang="less">
.layout {
    width: 100%;
    max-width: 1280px;
    margin: auto;
    margin-top: 1em;
}
.info {
    img {
        width: 1.2em;
        height: 1.2em;
        vertical-align: middle;
    }
    span {
        font-size: .8em;
        vertical-align: middle;
    }
}
.header {
    padding: 0 1em;
    aside {
        color: #999;
        font-size: .8em;
    }
    .header-section {
        display: flex;
        justify-content: space-between;
        .actions {
            display: flex;
            align-self: center;
        }
        .action-btn {
            font-size: 12px;
            font-weight: bold;
            color: #24292e;
            margin: 0 0 0 1.5em;
            position: relative;
            border-radius: 4px 0 0 4px;
            span {
                vertical-align: middle;
                padding: 0 3px;
            }
            .ivu-icon {
                font-size: 1.3em;
            }
            &.remove-btn {
                color: #E40000
            }
        }
        .count {
            font-size: 12px;
            vertical-align: middle;
            display: inline-block;
            border: 1px solid #dcdee2;
            border-left: 0;
            padding: 5px 1em 5px;
            border-radius: 0 4px 4px 0;
        }
    }
}
.code-desc {
    padding: 0 1em;
}
.code {
    margin: 1em 0;
    .code-header {
        background: #fafbfc;
        padding: .5em;
        border: 1px solid #e1e4e8;
        border-bottom: 0;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
    }
    .code-content {
        pre {
            margin: 0;
        }
        code {
            font-size: .8em;
        }
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        border: 1px solid #e1e4e8;
    }
}
.codes {
    display: flex;
    .code-list {
        flex: 1;
        padding: 0 1em;
    }
    .code-anchor {
        margin-top: 1em;
        padding: 0 1em;
    }
}
@media (max-width: 480px) {
    .header {
        .header-section {
            .actions {
                display: none;
            }
        }
    }
    .codes {
        flex-direction: column-reverse;
        .code-anchor {
            padding: 0;
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
</style>