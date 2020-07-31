<template>
  <Layout class="layout" v-if="snippet.id">
        <header class="header">
            <section class="header-section">
                <h1 class="info">
                    <img :src="`/api/account/avatar/${snippet.username}`" />
                    <span>
                        <router-link :to="`/u/${snippet.username}`">{{snippet.username}}</router-link> /
                        <router-link :title="snippet.codes[0].filename" :to="`/s/${snippet.id}`">{{snippet.codes[0].filename}}</router-link>
                        <Icon custom="fa fa-lock isprivate" title="Private" v-if="snippet.private"></Icon>
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
                            </Button><router-link :to="`/s/${id}/star`" class="count">{{snippet.stars}}</router-link>
                        </li>
                        <li><Button class="action-btn count-btn" @click="OnFork">
                            <Icon custom="fa fa-code-fork" ></Icon> <span> Fork</span>
                        </Button><router-link :to="`/s/${id}/forks`" class="count">{{snippet.forks}}</router-link>
                        </li>
                    </ul>
                </section>
            </section>
            <aside>
                <p v-if="snippet.fork">
                    fork from 
                    <router-link :to="`/s/${snippet.fork.id}`" :title="`${snippet.fork.username} / ${snippet.fork.codes[0].filename}`">
                    {{snippet.fork.username}} / {{snippet.fork.codes[0].filename}}
                    </router-link>
                </p>
                <p>Created at <Time :title="new Date(snippet.create_time * 1000).toLocaleString()" :time="snippet.create_time"></Time></p>
            </aside>
        </header>
        <article>
            <Tabs :animated="false" class="snippet-tabs" v-model="tab" @on-click="OnTab">
                <TabPane label="Code" icon="md-code" name="code">
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
                        <section class="code-anchor" v-if="snippet.codes.length > 1">
                            <Anchor show-ink :bounds="10" :scroll-offset="65">
                                <AnchorLink v-for="(f, i) in snippet.codes" v-bind:key="i" :href="`#code${i}`" :title="f.filename || `# ${i}`" />
                            </Anchor>
                        </section>
                    </article>
                </TabPane>
                <TabPane label="Stars" icon="md-star-outline" name="star">
                    <p v-if="stars.length == 0 && !loading" style="text-align:center;margin: 5em auto;">Nobody star yet.</p>
                    <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
                    <Row class="stars">
                        <Col span="8" v-for="(s, i) in stars" v-bind:key="i">
                            <article class="star-info">
                                <section>
                                    <img :src="s.username == $root.loginUser.username ? 
                                        $root.fileUrl($root.loginUser.avatar, '/img/user.png') : 
                                        `/api/account/avatar/${s.username}`" />
                                </section>
                                <section class="star-name">
                                    <p class="nikename">{{s.nickname}}</p>
                                    <p class="lastlogin">Last Login: <Time :time="s.lastlogin"></Time></p>
                                </section>
                            </article>
                        </Col>
                    </Row>
                    <Page v-show="!loading && snippet.stars > 12" :total="snippet.stars" :current="page.star" size="small" @on-change="OnPage('star', ...arguments)" :page-size="5"/>
                </TabPane>
                <TabPane label="Forks" icon="md-git-branch" name="fork">

                </TabPane>
            </Tabs>
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
                codes: [],
                stars: 0,
                forks: 0
            },
            stars: [],
            forks: [],
            menu: false,
            tab: 'code',
            page: {
                star: 1,
                fork: 1
            },
            loading: false,
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
        async OnTab(name) {
            let title = this.snippet.description;
            let path = this.$route.path;
            switch(name) {
                case 'code': path = `/s/${this.snippet.id}`; break;
                case 'star': path = `/s/${this.snippet.id}/star`; title += ' - Star'; break;
            }
            if (path == this.$route.path) return;
            this.$router.push(path);
            this.$util.title(title);
        },
        async OnFork() {
            try {
                if (!this.$root.isLogin) return this.$root.plsLogin();
                let rsp = await this.$store.dispatch('snippet/fork', this.snippet.id);
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                this.$router.push(`/s/${rsp.data.id}`);
                this.$root.message($m.SUCCESS, 'Fork Success');
            } catch (error) {
                console.error(error.message);
                this.$root.message($m.ERROR, error.message);
            }
        },
        OnPage(type, page) {
            this.$router.push(`/s/${this.snippet.id}/${type}/${page}`);
        },
        async getSnippet(id) {
            let rsp = await this.$store.dispatch('snippet/get', this.id);
            if (rsp && rsp.state == 0) {
                this.snippet = Object.assign(this.snippet, rsp.data);
                return true;
            } else {
                this.$root.message($m.ERROR, rsp.msg);
                this.$router.push('/');
                return false;
            }  
        },
        async getStars(id) {
            try {
                this.loading = true;
                let rsp = await this.$store.dispatch('fav/query', {
                    query: { snippet: [ id ] }, index: (this.page.star - 1) * 12, count: 12
                });
                this.snippet.stars = rsp.data.total;
                
                if (rsp.state != 0) {
                    this.loading = false;
                    return this.$Message.error(rsp.msg);
                }

                let username = rsp.data.data.map(d => d.username);
                rsp = await this.$store.dispatch('account/query', {
                    username
                });
                this.loading = false;

                if (rsp && rsp.state == 0) {
                    this.stars = rsp.data.data;
                    return true;
                } else {
                    this.$Message.error(rsp.msg);
                    return false;
                }  
            } catch (error) {
                console.error(error.message);
                this.$root.message($m.ERROR, error.message);
            }
        },
        async Init() {
            if(!await this.getSnippet('snippet/get', this.id)) return;
            let title = this.snippet.description;
            switch(this.$route.params.type) {
                case 'star':
                    this.tab = 'star';
                    this.page.star = parseInt(this.$route.params.page || 1);
                    title += ' - Star';
                    break;
                default:
                    this.tab = 'code';
            }
            this.$util.title(title);
            this.getStars(this.snippet.id);
        }
    },
    computed: {
        id() {
            return this.$route.params.id
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
    max-width: 1280px;
    margin: auto;
    margin-top: 1em;
}
.info {
    img {
        width: 1.2em;
        height: 1.2em;
        vertical-align: middle;
        border: 1px solid #FFF;
        background: #FFF;
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
                /*vertical-align: middle;*/
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
            height: 100%;
        }
        .count {
            font-size: 12px;
            vertical-align: middle;
            display: inline-block;
            border: 1px solid #373c3e;
            border-left: 0;
            padding: 5px 1em 6px;
            border-radius: 0 4px 4px 0;
            height: 100%;
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
        overflow: hidden;
    }
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
.snippet-tabs {
    margin: 1em 0;
}
.star-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    .star-name {
        display: flex;
        flex-direction: column;
        padding: 0 1em;
        .username {
            font-size: 1.2em;
        }
        .lastlogin {
            font-size: .5em;
        }
    }
    img {
        width: 4.5em;
        height: 4.5em;
        display: inline-block;
        padding: 3px;
        margin: 5px;
        vertical-align: top;
        border-radius: 50%;
        background: #FFF;
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
    }
    .code-anchor {
        padding: 0;
        max-width: none;
        margin-top: 0;
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