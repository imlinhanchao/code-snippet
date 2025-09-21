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
                    <i class="fa fa-caret-up triangle" v-if="menu"></i>
                    <ul class="action-list" :class="{ 'action-menu-hide': !menu }">
                        <li v-if="snippet.username == $root.loginUser.username">
                            <Button class="action-btn" @click="$router.push(`/edit/${snippet.id}`)">
                                <Icon custom="fa fa-pencil" ></Icon> <span> {{$t('edit')}}</span>
                            </Button>
                        </li>
                        <li v-if="snippet.username == $root.loginUser.username">
                            <Poptip
                            confirm
                            :title="$t('del_snippet_confirm')"
                            @on-ok="OnRemove">
                                <Button class="action-btn remove-btn">
                                    <Icon custom="fa fa-trash-o" ></Icon> <span> {{$t('delete')}}</span>
                                </Button>
                            </Poptip>
                        </li>
                        <li>
                            <Button class="action-btn count-btn" @click="OnStar">
                                <Icon custom="fa fa-star-o" v-if="!snippet.stared"></Icon>
                                <Icon custom="fa fa-star" v-if="snippet.stared"></Icon> 
                                <span> {{$t('star')}}</span>
                            </Button><router-link :to="`/s/${id}/star`" class="count">{{snippet.stars || 0}}</router-link>
                        </li>
                        <li><Button class="action-btn count-btn" @click="OnFork">
                            <Icon custom="fa fa-code-fork" ></Icon> <span> {{$t('fork')}}</span>
                        </Button><router-link :to="`/s/${id}/forks`" class="count">{{snippet.forks || 0}}</router-link>
                        </li>
                    </ul>
                </section>
            </section>
            <aside>
                <section class="snippet-info">
                    <p v-if="snippet.fork">
                        {{$t('fork_from')}} 
                        <router-link :to="`/s/${snippet.fork.id}`" :title="`${snippet.fork.username} / ${snippet.fork.codes[0].filename}`">
                        {{snippet.fork.username}} / {{snippet.fork.codes[0].filename}}
                        </router-link> {{$t('at')}} <Time :title="new Date(snippet.create_time * 1000).toLocaleString()" :time="snippet.create_time"></Time>
                    </p>
                    <p v-if="!snippet.fork">{{$t('create_at')}} <Time :title="new Date(snippet.create_time * 1000).toLocaleString()" :time="snippet.create_time"></Time></p>
                </section>
                <section class="ext-banner">
                    <section class="ext-info">
                        <span class="tag isprivate" v-if="snippet.private">
                            <Icon custom="fa fa-lock " title="Private"></Icon>
                            {{$t('private')}}
                        </span>
                        <span class="tag isexecute" v-if="snippet.execute && snippet.language != 'HTML'" style="cursor:pointer" @click="executeModal = true">
                            <Icon custom="fa fa-terminal " title="Execute"></Icon>
                            {{$t('execute')}}
                        </span>
                        <span class="tag isexecute" v-if="snippet.execute && snippet.language == 'HTML'" style="cursor:pointer" @click="previewModal = true">
                            <Icon custom="fa fa-chrome " title="Preview"></Icon>
                            {{$t('preview')}}
                        </span>
                        <span class="tag" style="cursor:pointer" @click="OnDownload">
                            <Icon custom="fa fa-download " title="Preview"></Icon>
                            {{$t('download')}}
                        </span>
                    </section>
                    <Share :snippet="snippet" class="share-input" />
                </section>
            </aside>
        </header>
        <article>
            <Tabs :animated="false" class="snippet-tabs" v-model="tab" @on-click="OnTab">
                <TabPane :label="getLabel($t('code'), 0, { type: 'md-code' })" name="code">
                    <section class="code-desc">
                        {{snippet.description}}
                    </section>
                    <article class="codes">
                        <section class="code-list">
                            <CodeRender :id="`code${i}`" v-for="(c, i) in snippet.codes" 
                                :code="c" :snippet="snippet" v-bind:key="i" class="code">
                            </CodeRender>
                            <article id="comment">
                                <section class="comment" v-for="(c, i) in comments" v-bind:key="i" :id="`comment${i}`">
                                    <section v-if="!c.edit" class="comment-header">
                                        <div>
                                            <i class="fa fa-caret-left triangle"></i>
                                            <img :src="c.username == $root.loginUser.username ? $root.fileUrl($root.loginUser.avatar, '/res/user.png') : `/api/account/avatar/${c.username}`" />
                                            <router-link :to="`/u/${c.username}`">{{c.user.nickname}}</router-link>
                                            <span class="comment-time">
                                                <span class="header-reply" v-if="c.reply">
                                                    {{$t('reply')}} <a :href="`#comment${c.floor}`">#{{c.floor+1}}</a>
                                                </span>
                                                <span v-if="!c.reply">{{$t('commented')}}</span> 
                                                {{$t('on')}} <Time :time="c.create_time" :title="new Date(c.create_time * 1000).toUTCString()"></Time></span>
                                        </div>
                                        <div class="comment-menu" v-if="$root.isLogin">
                                            <a href="javascript:void(0)" @click="menus = menus == c.id ? '': c.id">
                                                <Icon custom="fa fa-ellipsis-v"></Icon>
                                            </a>
                                            <i v-if="menus == c.id" class="fa fa-caret-up triangle"></i>
                                            <ul v-if="menus == c.id" class="menu-list">
                                                <li><a href="javascript:void(0)" @click="OnQuote(c.content)">{{$t('quote_reply')}}</a></li>
                                                <li><a href="javascript:void(0)" @click="OnReply(c.id)">{{$t('reply_only')}}</a></li>
                                                <li v-if="c.username == $root.loginUser.username" class="hr"></li>
                                                <li v-if="c.username == $root.loginUser.username">
                                                    <a href="javascript:void(0)" @click="OnEdit(c)">{{$t('edit')}}</a>
                                                </li>
                                                <li v-if="c.username == $root.loginUser.username">
                                                    <Poptip 
                                                        confirm
                                                        title="Are you sure want to delete this comment ?"
                                                        @on-ok="OnDelete(c)">
                                                        <a href="javascript:void(0)" style="color: #d0434a">{{$t('delete')}}</a>
                                                    </Poptip>
                                                </li>
                                                <li class="hr"></li>
                                                <li><a href="javascript:void(0)">{{$t('report_content')}}</a></li>
                                            </ul>
                                        </div>
                                    </section>
                                    <section v-if="!c.edit" class="comment-content markdown-body"> 
                                        <section v-html="$markdown.getMarkdownIt().render(c.content)"></section>
                                        <section v-if="c.create_time != c.update_time" style="text-align: right; color:#515a6e">
                                            {{$t('update_on')}} <Time :time="c.update_time" :title="new Date(c.update_time * 1000).toUTCString()" ></Time>
                                        </section>
                                    </section>
                                    <section class="comment-area" v-if="c.edit && c.username == $root.loginUser.username">
                                        <i class="fa fa-caret-left triangle"></i>
                                        <img :src="c.username == $root.loginUser.username ? $root.fileUrl($root.loginUser.avatar, '/res/user.png') : `/api/account/avatar/${c.username}`" />
                                        <Comment :comment="c" :floor="replyfloor" :disabled="!$root.loginUser.verify"
                                            :autofocus="true" @ok="OnEditComment(c, ...arguments)"></Comment>
                                    </section>
                                </section>
                                <section class="comment-more" title="More Comment" v-if="comments.length < snippet.comments" @click="getComments(snippet.id)">
                                    <Icon v-if="!loading" custom="fa fa-ellipsis-h"></Icon>
                                    <i v-if="loading" class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
                                </section>
                                <Comment ref="commentarea" :comment="comment" v-if="$root.isLogin" 
                                    :floor="replyfloor" @noreply="comment.reply = ''" :disabled="!$root.loginUser.verify"
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
                <TabPane :label="getLabel($t('star'), stars.length, { type: 'md-star-outline' })" name="star">
                    <p v-if="stars.length == 0 && !loading" style="text-align:center;margin: 5em auto;">{{$t('no_star')}}</p>
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
                                    <p class="nikename"><router-link :to="`/u/${s.username}`">{{s.nickname}}</router-link></p>
                                    <p class="lastlogin">
                                        <span v-if="!s.location && !s.company">
                                            <i class="fa fa-clock-o"></i>
                                            {{$t('login_at')}}<Time :time="s.lastlogin"></Time>
                                        </span>
                                        <span v-if="!s.company && s.location">
                                            <i class="fa fa-map-marker"></i>
                                            {{s.location}}
                                        </span>
                                        <span v-if="s.company">
                                            <i class="fa fa-building"></i>
                                            {{s.company}}
                                        </span>
                                    </p>
                                </section>
                            </article>
                        </Col>
                    </Row>
                    <Page v-show="!loading && snippet.stars > 12" :total="snippet.stars" :current="page.star" size="small" @on-change="OnPage('star', ...arguments)" :page-size="5"/>
                </TabPane>
                <TabPane :label="getLabel($t('fork'), forks.length, { type: 'md-git-branch' })" name="fork">
                    <p v-if="forks.length == 0 && !loading" style="text-align:center;margin: 5em auto;">{{$t('no_fork')}}</p>
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
                                    <p class="nikename"><router-link :to="`/u/${s.username}`">{{s.user.nickname}}</router-link></p>
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
import JsZip from 'jszip';
import { saveAs } from 'file-saver';
import CodeRender from '../components/coderender'
export default {
    name: "snippet",
    components: {
        Execute: () => import('../components/execute'),
        Preview: () => import('../components/preview'),
        Comment: () => import('../components/comment'),
        Share: () => import('../components/share'),
        CodeRender,
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
            },
            menus: '',
        };
    },
    methods: {
        async OnRemove() {
            try {
                let rsp = await this.$store.dispatch('snippet/del', this.snippet.id);
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                this.$root.message($m.SUCCESS, this.$t('remove_success'));
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
                case 'star': path = `/s/${this.snippet.id}/star`; title += ' - ' + this.$t('star'); break;
                case 'fork': path = `/s/${this.snippet.id}/fork`; title += ' - ' + this.$t('fork'); break;
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
                this.$root.message($m.SUCCESS, this.$t('fork_success'));
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
            comment.update_time = parseInt(comment.update_time)
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
            this.menus = '';
        },
        OnReply(id) {
            this.comment.reply = id;
            this.$refs.commentarea.$el.scrollIntoView();
            this.menus = ''
        },
        OnEdit(c) {
            c.edit = true;
            this.menus = '';
        },
        async OnDelete(comment) {
            try {
                this.menus = '';
                let rsp = await this.$store.dispatch('comment/del', comment.id);
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                let index = this.comments.map(c => c.id).indexOf(comment.id);
                this.comments.splice(index, 1);
            } catch (error) {
                console.error(error.message);
                this.$root.message($m.ERROR, error.message);
            }
        },
        OnDownload() {
            if (this.snippet.codes.length > 1) {
                let jszip = new JsZip();
                this.snippet.codes.forEach(c => {
                    jszip.file(c.filename, c.content);
                })
                jszip.generateAsync({ type: 'blob' }).then((content) => {
                    saveAs(content, `${this.snippet.id}.zip`);
                });
            } else {
                let code = this.snippet.codes[0];
                saveAs(code.content, code.filename);
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
                            count,
                            type: 'normal',
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
                rsp.data.codes.forEach(c => c.source = false);
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
                    query: { snippet: [ id ] }, index: this.stars.length, count: 12
                });
                
                if (rsp.state != 0) {
                    this.loading = false;
                    return this.$Message.error(rsp.msg);
                }

                this.snippet.stars = rsp.data.total;
                this.stars = [];
                if (this.snippet.stars == 0) {
                    this.loading = false;
                    return true;
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
        async getComments(id) {
            try {
                this.loading = true;
                let rsp = await this.$store.dispatch('comment/query', {
                    query: { snippet: [ id ] }, 
                    index: this.comments.length, count: 10,
                    order: [['create_time', 'ASC']]
                });
                
                if (rsp.state != 0) {
                    this.loading = false;
                    return this.$Message.error(rsp.msg);
                }

                this.snippet.comments = rsp.data.total;
                let comments = rsp.data.data;

                if (this.snippet.comments == 0) {
                    this.loading = false;
                    return true;
                }

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
                    query: { fork_from: [ id ] }, index: this.forks.length, count: 12
                });
                
                if (rsp.state != 0) {
                    this.loading = false;
                    return this.$Message.error(rsp.msg);
                }

                this.snippet.forks = rsp.data.total;
                let forks = rsp.data.data;
                if (this.snippet.forks == 0) {
                    this.loading = false;
                    return true;
                }

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
        },
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
        .snippet-info {
            margin: 1em 0 0;
        }
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
                &:hover {
                    background: #373c3e;
                }
            }
        }
        .ext-banner {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: space-between;
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
            font-size: 12px;
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
        .ext-banner {
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            .ext-info {
                margin-bottom: 1em;
                width: 100%;
            }
            .share-input {
                width: 100%;
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

</style>