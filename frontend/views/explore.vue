<template>
    <Layout class="layout">
        <header class="header">
            <h1><Icon custom="fa fa-file-code-o" ></Icon> Explore Snippet </h1>
        </header>
        <Content class="snippet">
            <section v-for="(s, i) in snippets" v-bind:key="i">
                <header>
                    <div class="info">
                        <img :src="s.username == $root.loginUser.username ? $root.fileUrl($root.loginUser.avatar, '/img/user.png') : `/api/account/avatar/${s.username}`" />
                        <h1>
                            <router-link :to="`/u/${s.username}`">{{s.username}}</router-link> /
                            <router-link :to="`/s/${s.id}`">{{s.codes[0].filename}}</router-link>
                            <aside>
                                <p>Created at {{new Date(s.create_time * 1000).toLocaleString()}}</p>
                                <p>{{s.description}}</p>
                            </aside>
                        </h1>
                    </div>
                    <Statistics :snippet="s" ></Statistics>
                </header>
                <section>
                    <section class="code">
                        <section class="code-content">
                            <pre v-hljs="s.codes[0].content"><code></code></pre>
                        </section>
                    </section>
                </section>
            </section>
        </Content>
    </Layout>
</template>
<script>
import Statistics from '../components/statistics'
export default {
    name: "explore",
    components: {
        Statistics
    },
    async mounted() {
        await this.loadSnippet();
    },
    data() {
        return {
            last_data: new Date().getTime(),
            snippets: [],
            total: 0
        };
    },
    methods: {
        async loadSnippet(query={}) {
            try {
                let count = 10;
                let rsp = await this.$store.dispatch("snippet/query", {
                    query: { create_time: this.last_data, ...query }, index: 0
                });
                if (!rsp || rsp.state != 0) {
                    this.$Message.error(rsp ? rsp.msg : 'Something Wrong...');
                    return;
                }
                if (rsp.data.total == 0) return;
                this.snippets = rsp.data.data;
                this.total = rsp.data.total;
                this.last_data = this.snippets[this.snippets.length - 1].create_time
            } catch (error) {
                this.$root.message($m.ERROR, err.message);
            }
        },
    },
    computed: {
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
.header {
    padding: 0 2em;
    text-align: center;
}
.snippet {
    margin: auto;
    max-width: 900px;
    padding: 1.5em 2em;
    width: 100%;
    header {
        display: flex;
        justify-content: space-between;
    }
    .info {
        display: flex;
        font-size: 1.2em;
        flex: 1;
        white-space: nowrap;
        width: 0;
        img {
            width: 2.5em;
            height: 2.5em;
            display: inline-block;
            padding: 5px;
            vertical-align: top;
            border-radius: 50%;
        }
        h1 {
            font-size: .8em;
            font-weight: normal;
            vertical-align: top;
            text-overflow: ellipsis;
            overflow: hidden;
            aside {
                color: #666;
                font-size: .8em;
            }
        }
    }
    .code {
        margin: 1em 0;
        .code-content {
            pre {
                margin: 0;
            }
            code {
                font-size: .8em;
                max-height: 19em;
                overflow-y: hidden;
            }
            border-radius: 6px;
            border: 1px solid #515a6e;
            overflow: hidden;
        }
    }
}

@media (max-width: 480px) {
}
</style>

<style lang="less">
@media (max-width: 480px) {
}
</style>