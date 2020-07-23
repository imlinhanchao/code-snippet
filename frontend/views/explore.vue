<template>
    <Layout class="layout">
        <header class="header">
            <h1><Icon custom="fa fa-file-code-o" ></Icon> Explore Snippet </h1>
        </header>
        <Content class="snippet">
            <section v-for="(s, i) in snippets" v-bind:key="i">
                <header>
                    <div class="info">
                        <img :src="`/api/account/avatar/${s.username}`" />
                        <h1>
                            <router-link :to="`/u/${s.username}`">{{s.username}}</router-link> /
                            <router-link :to="`/s/${s.id}`">{{s.codes[0].filename}}</router-link>
                            <aside>
                                <p>Created at {{new Date(s.create_time * 1000).toLocaleString()}}</p>
                                <p>{{s.description}}</p>
                            </aside>
                        </h1>
                    </div>
                    <div class="statistics">
                        <router-link :to="`/s/${s.id}`" class="count">
                            <Icon custom="fa fa-file-o" ></Icon> <span> {{s.codes.length}} file</span>
                        </router-link>
                        <router-link :to="`/s/${s.id}/forks`" class="count">
                            <Icon custom="fa fa-code-fork" ></Icon> <span> 0 forks</span>
                        </router-link>
                        <router-link :to="`/s/${s.id}/comment`" class="count">
                            <Icon custom="fa fa-commenting-o" ></Icon> <span> 0 comments</span>
                        </router-link>
                        <router-link :to="`/s/${s.id}/stargazers`" class="count">
                            <Icon custom="fa fa-star-o" ></Icon> <span> 0 stars</span>
                        </router-link>
                    </div>                
                </header>
                <section>
                    <section class="code">
                        <section class="code-content">
                            <pre v-hljs="s.codes[0].content.split('\n').slice(0, 10).join('\n')"><code></code></pre>
                        </section>
                    </section>
                </section>
            </section>
        </Content>
    </Layout>
</template>
<script>

export default {
    name: "explore",
    components: {
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
                    this.$Message.error(rsp?.msg || 'something wrong');
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
        .count {
            display: inline-block;
            padding: 0 .5em;
            .ivu-icon {
                padding: 0 .2em;
            }
            >* {
                vertical-align: middle;
            }
        }
    }
    .info {
        display: flex;
        font-size: 1.2em;
        img {
            width: 2.5em;
            height: 2.5em;
            display: inline-block;
            padding: 5px;
            vertical-align: top;
        }
        h1 {
            font-size: .8em;
            font-weight: normal;
            vertical-align: top;
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
            }
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
            border: 1px solid #e1e4e8;
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