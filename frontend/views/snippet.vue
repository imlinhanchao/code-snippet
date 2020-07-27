<template>
  <Layout class="layout" v-if="snippet.id">
        <header class="header">
            <section class="header-section">
                <h1 class="info">
                    <img :src="`/api/account/avatar/${snippet.username}`" />
                    <span>
                        <router-link :to="`/u/${snippet.username}`">{{snippet.username}}</router-link> /
                        <router-link :title="snippet.codes[0].filename" :to="`/s/${snippet.id}`">{{snippet.codes[0].filename}}</router-link>
                    </span>
                </h1>
                <section class="actions">
                    <Icon class="action-menu" custom="fa fa-ellipsis-v" @click="menu = !menu"></Icon>
                    <ul class="action-list" :class="{ 'action-menu-hide': !menu }">
                        <li v-if="snippet.username == $root.loginUser.username">
                            <Button class="action-btn" @click="$router.push(`/edit/${snippet.id}`)">
                                <Icon custom="fa fa-pencil" ></Icon> <span> Edit</span>
                            </Button>
                        </li>
                        <li v-if="snippet.username == $root.loginUser.username">
                            <Poptip
                            confirm
                            title="Are you sure you want to delete this snippet?"
                            @on-ok="OnRemove">
                                <Button class="action-btn remove-btn" @click="OnRemove">
                                    <Icon custom="fa fa-trash-o" ></Icon> <span> Delete</span>
                                </Button>
                            </Poptip>
                        </li>
                        <li>
                            <Button class="action-btn count-btn" @click="OnStar">
                                <Icon custom="fa fa-star-o" v-if="!snippet.stared"></Icon>
                                <Icon custom="fa fa-star" v-if="snippet.stared"></Icon> 
                                <span> Star</span>
                            </Button><router-link :to="`/s/${id}/stargazers`" class="count">{{snippet.stars.length}}</router-link>
                        </li>
                        <li><Button class="action-btn count-btn">
                            <Icon custom="fa fa-code-fork" ></Icon> <span> Fork</span>
                        </Button><router-link :to="`/s/${id}/forks`" class="count">0</router-link>
                        </li>
                    </ul>
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
                            <pre v-hljs="c.content"><code></code></pre>
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
                codes: []
            },
            menu: false
        };
    },
    methods: {
        async OnRemove() {
            try {
                let rsp = await this.$store.dispatch('snippet/del', this.snippet.id);
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                this.$root.message($m.SUCCESS, 'Remove Success!');
                this.$router.push('/')
            } catch (error) {
                console.error(error.message);
                this.$root.message($m.ERROR, error.message);
            }
        },
        async OnStar() {
            try {
                if (!this.$root.isLogin) return this.$root.plsLogin();
                let rsp = await this.$store.dispatch(this.snippet.stared ? 'fav/del' : 'fav/create', this.snippet.id);
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                await this.Init();
            } catch (error) {
                console.error(error.message);
                this.$root.message($m.ERROR, error.message);
            }
        },
        async Init() {
            let rsp = await this.$store.dispatch('snippet/get', this.id);
            if (rsp && rsp.state == 0) {
                this.snippet = rsp.data;
            } else {
                this.$root.message($m.ERROR, rsp.msg);
            }  
        }
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
    h1 {
        font-size: 1.5em;
        line-height: 1.5;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        overflow: hidden;
    }
    aside {
        color: #999;
        font-size: .8em;
    }
    .info img {
        border-radius: 50%;
    }
    .header-section {
        display: flex;
        justify-content: space-between;
        .actions {
            display: flex;
            align-self: center;
            .action-menu {
                display: none;
                line-height: 2em;
                padding: .5em 0 0;
            }
            .action-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: row;
                li {
                    white-space: nowrap;
                }
            }
        }
        .action-btn {
            font-size: 12px;
            font-weight: bold;
            margin: 0 0 0 1em;
            position: relative;
            border-radius: 4px;
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
        .count-btn {
            border-radius: 4px 0 0 4px;
        }
        .count {
            font-size: 12px;
            vertical-align: middle;
            display: inline-block;
            border: 1px solid #373c3e;
            border-left: 0;
            padding: 5px 1em 4px;
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
        background: #1a1c1e;
        padding: .5em;
        border: 1px solid #373c3e;
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
        border: 1px solid #373c3e;
    }
}
.codes {
    display: flex;
    .code-list {
        flex: 1;
        padding: 0 1em;
        width: 0;
    }
    .code-anchor {
        margin-top: 1em;
        padding: 0 1em;
        max-width: 20%;
    }
}
@media (max-width: 480px) {
    .header {
        position: relative;
        h1 {
            font-size: 1.5em;
        }
        .header-section {
            .actions {
                .action-menu {
                    display: inline-block;
                }
                .action-list {
                    flex-direction: column;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    background-color: #FFF;
                    position: absolute;
                    right: .5em;
                    top: 55%;
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
        .code-anchor {
            padding: 0;
            max-width: none;
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