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
                            </Button><router-link :to="`/s/${id}/star`" class="count">{{snippet.stars || 0}}</router-link>
                        </li>
                        <li><Button class="action-btn count-btn" @click="OnFork">
                            <Icon custom="fa fa-code-fork" ></Icon> <span> Fork</span>
                        </Button><router-link :to="`/s/${id}/forks`" class="count">{{snippet.forks || 0}}</router-link>
                        </li>
                    </ul>
                </section>
            </section>
            <aside>
                <section>
                    <p v-if="snippet.fork">
                        fork from 
                        <router-link :to="`/s/${snippet.fork.id}`" :title="`${snippet.fork.username} / ${snippet.fork.codes[0].filename}`">
                        {{snippet.fork.username}} / {{snippet.fork.codes[0].filename}}
                        </router-link>
                    </p>
                    <p>Created at <Time :title="new Date(snippet.create_time * 1000).toLocaleString()" :time="snippet.create_time"></Time></p>
                </section>
                <section class="ext-info">
                    <span class="tag isprivate" v-if="snippet.private">
                        <Icon custom="fa fa-lock " title="Private"></Icon>
                        Private
                    </span>
                    <span class="tag isexecute" v-if="snippet.execute && snippet.language != 'HTML'" style="cursor:pointer" @click="executeModal = true">
                        <Icon custom="fa fa-terminal " title="Execute"></Icon>
                        Execute
                    </span>
                    <span class="tag isexecute" v-if="snippet.execute && snippet.language == 'HTML'" style="cursor:pointer" @click="previewModal = true">
                        <Icon custom="fa fa-chrome " title="Preview"></Icon>
                        Preview
                    </span>
                </section>
            </aside>
        </header>
        <article>
            <Tabs :animated="false" class="snippet-tabs" v-model="tab" @on-click="OnTab">
                <TabPane :label="getLabel('Code', 0, { type: 'md-code' })" name="code">
                    <section class="code-desc">
                        {{snippet.description}}
                    </section>
                    <article class="codes">
                        <section class="code-list">
                            <section :id="`code${i}`" v-for="(c, i) in snippet.codes" v-bind:key="i" class="code">
                                <section class="code-header">
                                    <section class="filename">{{c.filename}}</section>
                                    <Action :snippet="snippet" :code="c"></Action>
                                </section>
                                <section class="code-content">
                                    <pre v-hljs="c.content"><code></code></pre>
                                </section>
                            </section>
                            <article id="comment">
                                <section class="comment" v-for="(c, i) in comments" v-bind:key="i" :id="`comment${i}`">
                                    <section v-if="!c.edit" class="comment-header">
                                        <div>
                                            <i class="fa fa-caret-left triangle"></i>
                                            <img :src="c.username == $root.loginUser.username ? $root.fileUrl($root.loginUser.avatar, '/res/user.png') : `/api/account/avatar/${c.username}`" />
                                            <router-link :to="`/u/${c.username}`">{{c.user.nickname}}</router-link>
                                            <span class="comment-time">
                                                <span class="header-reply" v-if="c.reply">
                                                    reply <a :href="`#comment${c.floor}`">#{{c.floor+1}}</a>
                                                </span>
                                                <span v-if="!c.reply">commented</span> 
                                                on <Time :time="c.create_time" :title="new Date(c.create_time * 1000).toUTCString()"></Time></span>
                                        </div>
                                        <div class="comment-menu">
                                            <a href="javascript:void(0)" @click="c.menu = !c.menu">
                                                <Icon custom="fa fa-ellipsis-v"></Icon>
                                            </a>
                                            <i v-if="c.menu" class="fa fa-caret-up triangle"></i>
                                            <ul v-if="c.menu" class="menu-list">
                                                <li><a href="javascript:void(0)" @mousedown="OnQuote(c.content)">Quote Reply</a></li>
                                                <li><a href="javascript:void(0)" @mousedown="OnReply(c.id)">Reply Only</a></li>
                                                <li v-if="c.username == $root.loginUser.username" class="hr"></li>
                                                <li v-if="c.username == $root.loginUser.username">
                                                    <a href="javascript:void(0)" @mousedown="c.edit=true">Edit</a>
                                                </li>
                                                <li v-if="c.username == $root.loginUser.username">
                                                    <Poptip 
                                                        confirm
                                                        title="Are you sure want to delete this code ?"
                                                        @on-ok="OnDelete(c)">
                                                        <a href="javascript:void(0)" style="color: #d0434a">Delete</a>
                                                    </Poptip>
                                                </li>
                                                <li class="hr"></li>
                                                <li><a href="javascript:void(0)">Report Content</a></li>
                                            </ul>
                                        </div>
                                    </section>
                                    <section v-if="!c.edit" class="comment-content markdown-body"> 
                                        <section v-html="$markdown.markdownIt.render(c.content)"></section>
                                        <section v-if="c.create_time != c.update_time" style="text-align: right; color:#515a6e">
                                            Update on <Time :time="c.update_time" :title="new Date(c.update_time * 1000).toUTCString()" ></Time></span>
                                        </section>
                                    </section>
                                    <section class="comment-area" v-if="c.edit && c.username == $root.loginUser.username">
                                        <i class="fa fa-caret-left triangle"></i>
                                        <img :src="c.username == $root.loginUser.username ? $root.fileUrl($root.loginUser.avatar, '/res/user.png') : `/api/account/avatar/${c.username}`" />
                                        <Comment :comment="c" :floor="replyfloor"
                                            :autofocus="true" @ok="OnEditComment(c, ...arguments)"></Comment>
                                    </section>
                                </section>
                                <section class="comment-more" title="More Comment" v-if="comments.length < snippet.comments" @click="getComments(snippet.id)">
                                    <Icon v-if="!loading" custom="fa fa-ellipsis-h"></Icon>
                                    <i v-if="loading" class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
                                </section>
                                <Comment ref="commentarea" :comment="comment" v-if="$root.isLogin" 
                                    :floor="replyfloor" @noreply="comment.reply = ''"
                                    :autofocus="$win.location.hash=='#comment'" @ok="OnComment"></Comment>
                            </article>
                        </section>
                        <section class="code-anchor" v-if="snippet.codes.length > 1">
                            <Anchor show-ink :bounds="10" :scroll-offset="65">
                                <AnchorLink v-for="(f, i) in snippet.codes" v-bind:key="i" :href="`#code${i}`" :title="f.filename || `# ${i}`" />
                            </Anchor>
                        </section>
                    </article>
                </TabPane>
                <TabPane :label="getLabel('Stars', stars.length, { type: 'md-star-outline' })" name="star">
                    <p v-if="stars.length == 0 && !loading" style="text-align:center;margin: 5em auto;">Nobody star yet.</p>
                    <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
                    <Row class="stars">
                        <Col span="8" v-for="(s, i) in stars" v-bind:key="i">
                            <article class="star-info">
                                <section>
                                    <img :src="s.username == $root.loginUser.username ? 
                                        $root.fileUrl($root.loginUser.avatar, '/res/user.png') : 
                                        `/api/account/avatar/${s.username}`" />
                                </section>
                                <section class="info">
                                    <p class="nikename">{{s.nickname}}</p>
                                    <p class="lastlogin">Last Login: <Time :time="s.lastlogin"></Time></p>
                                </section>
                            </article>
                        </Col>
                    </Row>
                    <Page v-show="!loading && snippet.stars > 12" :total="snippet.stars" :current="page.star" size="small" @on-change="OnPage('star', ...arguments)" :page-size="5"/>
                </TabPane>
                <TabPane :label="getLabel('Forks', forks.length, { type: 'md-git-branch' })" name="fork">
                    <p v-if="forks.length == 0 && !loading" style="text-align:center;margin: 5em auto;">Nobody fork yet.</p>
                    <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
                    <Row class="forks">
                        <Col span="8" v-for="(s, i) in forks" v-bind:key="i" style="min-width: 11em">
                            <article class="fork-info">
                                <section>
                                    <img :src="s.username == $root.loginUser.username ? 
                                        $root.fileUrl($root.loginUser.avatar, '/res/user.png') : 
                                        `/api/account/avatar/${s.username}`" />
                                </section>
                                <section class="info">
                                    <p class="nikename">{{s.user.nickname}}</p>
                                    <p class="source"><router-link :to="`/s/${s.id}`">{{s.codes[0].filename}}</router-link></p>
                                </section>
                            </article>
                        </Col>
                    </Row>
                    <Page v-show="!loading && snippet.stars > 12" :total="snippet.stars" :current="page.star" size="small" @on-change="OnPage('star', ...arguments)" :page-size="5"/>
                </TabPane>
            </Tabs>
        </article>
        <Execute v-model="executeModal" :snippet="snippet" :codes="snippet.codes" :auto="snippet.command == ''"></Execute>
        <Preview v-if="previewModal" v-model="previewModal" :snippet="snippet" :code="snippet.command"></Preview>
  </Layout>
</template>
<script>
export default {
    name: "snippet",
    components: {
        Action: () => import('../components/action'), 
        Execute: () => import('../components/execute'),
        Preview: () => import('../components/preview'),
        Comment: () => import('../components/comment')
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
            comments: [],
            menu: false,
            tab: 'code',
            page: {
                star: 1,
                fork: 1,
                comment: 1,
            },
            last_data: new Date().getTime(),
            loading: false,
            executeModal: false,
            previewModal: false,
            comment: {
                content: '',
                reply: '',
                snippet: ''
            }
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
                case 'fork': path = `/s/${this.snippet.id}/fork`; title += ' - Fork'; break;
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
        OnComment(comment) {
            comment.index = this.comments.length;
            if(comment.reply) comment.floor = this.comments.find(r => r.id == comment.reply).index;
            comment.user = this.$root.loginUser;
            comment.create_time = parseInt(comment.create_time)
            this.comments.push(comment);
            this.comment.reply = '';
            this.comment.content = '';
        },
        OnEditComment(c, comment) {
            c.edit = false;
            c.content = comment.content;
        },
        OnQuote(content) {
            this.comment.content += (this.comment.content === '' ? '' : '\n') + `${content.split('\n').map(c => `> ${c}`).join('\n')}\n\n`;
            this.$refs.commentarea.$el.scrollIntoView();
        },
        OnReply(id) {
            this.comment.reply = id;
            this.$refs.commentarea.$el.scrollIntoView();
        },
        async OnDelete(comment) {
            try {
                let rsp = await this.$store.dispatch('comment/del', comment.id);
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                let index = this.comments.map(c => c.id).indexOf(comment.id);
                this.comments.splice(index, 1);
            } catch (error) {
                console.error(error.message);
                this.$root.message($m.ERROR, error.message);
            }
        },
        getReplyFloor(reply) {
            let comment = this.comments.find(c => c.id == reply);
            return comment ? comment.index : -1;
        },
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
                
                if (rsp.state != 0) {
                    this.loading = false;
                    return this.$Message.error(rsp.msg);
                }

                this.snippet.stars = rsp.data.total;

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
        async getComments(id) {
            try {
                this.loading = true;
                let rsp = await this.$store.dispatch('comment/query', {
                    query: { snippet: [ id ] }, 
                    index: (this.page.comment - 1) * 10, count: 10,
                    order: [['create_time', 'ASC']]
                });
                
                if (rsp.state != 0) {
                    this.loading = false;
                    return this.$Message.error(rsp.msg);
                }

                this.snippet.comments = rsp.data.total;
                let comments = rsp.data.data;

                let username = rsp.data.data.map(d => d.username);
                rsp = await this.$store.dispatch('account/query', {
                    username
                });
                this.loading = false;

                if (rsp && rsp.state == 0) {
                    let users = rsp.data.data;
                    let ids = this.comments.map(c => c.id);
                    comments.forEach((c, i) => {
                        c.user = users.find(u => u.username == c.username);
                        c.index = i;
                        c.menu = false;
                        c.edit = false;
                        if (c.reply) c.floor = this.comments.find(r => r.id == c.reply).index;
                        let index = ids.indexOf(c.id);
                        if (index >= 0) this.comments.splice(index, 1);
                        this.comments.push(c)
                    });
                    this.page.comment++;

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
        async getForks(id) {
            try {
                this.loading = true;
                let rsp = await this.$store.dispatch('snippet/query', {
                    query: { fork_from: [ id ] }, index: (this.page.fork - 1) * 12, count: 12
                });
                
                if (rsp.state != 0) {
                    this.loading = false;
                    return this.$Message.error(rsp.msg);
                }

                this.snippet.forks = rsp.data.total;
                let forks = rsp.data.data;

                let username = forks.map(d => d.username);
                rsp = await this.$store.dispatch('account/query', {
                    username
                });
                this.loading = false;

                if (rsp && rsp.state == 0) {
                    let users = rsp.data.data;
                    forks.forEach(f => {
                        f.user = users.find(u => u.username == f.username);
                    });
                    this.forks = forks;
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
                case 'fork':
                    this.tab = 'fork';
                    this.page.fork = parseInt(this.$route.params.page || 1);
                    title += ' - Fork';
                    break;
                default:
                    this.tab = 'code';
            }
            this.$util.title(title);
            this.comment.snippet = this.snippet.id;
            this.getStars(this.snippet.id);
            this.getForks(this.snippet.id);
            this.getComments(this.snippet.id);
        }
    },
    computed: {
        id() {
            return this.$route.params.id
        },
        replyfloor() {
            let comment = this.comments.find(c => c.id == this.comment.reply);
            return comment ? comment.index : -1;
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
        position: relative;
    }
    aside {
        color: #999;
        font-size: .8em;
        .ext-info {
            padding: 1em 0 0;
            i {
                font-size: 1.2em;
            }
            .tag {
                background: #24292e;
                padding: 5px 15px;
                border: 1px solid #2e3233;
                border-radius: 15px;
                text-shadow: none;
                margin: 0 .2em;
            }
        }
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
        display: flex;
        justify-content: space-between;
        .filename {
            flex: 1;
            width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }
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
.star-info, .fork-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    .info {
        display: flex;
        flex-direction: column;
        padding: 0 .5em;
        width: calc(100% - 4.8em);
        .username {
            font-size: 1.2em;
        }
        .lastlogin {
            font-size: .5em;
        }
        p {
            text-overflow: ellipsis;
            overflow: hidden;
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
.comment {
    display: flex;
    flex-direction: column;
    padding-left: 5em;
    margin: 2em 0 1em;
    .comment-header {
        display: flex;
        justify-content: space-between;
        position: relative;
        background: #1a1c1e;
        padding: .5em 1em;
        border-radius: 6px 6px 0 0;
        border: 1px solid #373c3e;
        border-bottom: 0;
        .header-reply {
            a {
                border-bottom: 1px dashed #515a6e;
            }
        }
        .comment-time {
            color: #515a6e;
        }
        .triangle {
            position: absolute;
            left: -.3em;
            top: 10px;
            color: #1a1c1e;
            font-size: 2em;
            text-shadow: -1px 0px 1px #373c3e;
        }
        img {
            width: 3em;
            height: 3em;
            display: inline-block;
            border: 1px solid #FFF;
            vertical-align: top;
            border-radius: 50%;
            background: #FFF;
            margin: 5px;
            position: absolute;
            left: -5em;
            top: 0;
        }
    }
    .comment-area {
        position: relative;
        .triangle {
            position: absolute;
            left: -.3em;
            top: 1.3em;
            color: #1a1c1e;
            font-size: 2em;
        }
        img {
            width: 3em;
            height: 3em;
            display: inline-block;
            border: 1px solid #FFF;
            vertical-align: top;
            border-radius: 50%;
            background: #FFF;
            margin: 5px;
            position: absolute;
            left: -5em;
            top: 2em;
        }
    }
    .comment-content {
        padding: 1em;
        background: #232323;
        border-radius: 0 0 6px 6px;
        border: 1px solid #373c3e;
        border-top: 0;
    }
    .comment-menu {        
        position: relative;
        i {
            cursor: pointer;
        }
        .triangle {
            position: absolute;
            cursor: default;
            top: 22px;
            left: -8px;
            color: #1a1c1e;
            text-shadow: 0 -2px 1px #373c3e;
            z-index: 11;
        }
        .menu-list {
            position: absolute;
            list-style: none;
            right: -28px;
            background: #1a1c1e;
            border: 1px solid #373c3e;
            z-index: 10;
            border-radius: 6px;
            top: 42px;
            padding: .3em 0; 
            li {
                padding: .3em .6em; 
                white-space: nowrap;
                &.hr {
                    border-bottom: 1px solid #373c3e;
                    padding: 0;
                }
            }
        }
    }
}
.comment-more {
    text-align: center;
    padding: 1em;
    border-radius: 6px;
    cursor: pointer;
    margin: 0 1em;
    &:hover {
        background: #24292e94;
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
                    background-color: #181a1b;
                    position: absolute;
                    right: .5em;
                    top: 55%;
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

</style>