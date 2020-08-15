<template>
    <Layout class="layout">
        <Content class="profile" v-if="info.id">
        <section class="section">
            <div class="avatar-box">
                <div class="avatar">
                <img :src="$root.fileUrl(info.avatar, '/res/user.png')" />
                <Upload
                    v-if="isCurrentUser"
                    class="avatar-upload"
                    :show-upload-list="false"
                    :action="$root.uploadInterface"
                    :on-success="handleSuccess"
                    :max-size="$root.maxSize"
                    :format="['jpg','jpeg','png', 'gif']"
                    :on-format-error="$root.fileFormatError"
                    :on-exceeded-size="$root.fileMaxSize"
                    type="drag"
                    accept="image/*"
                >
                    <Button class="upload-btn" type="text">
                    <Icon type="ios-cloud-upload" size="30"></Icon>
                    </Button>
                </Upload>
                </div>
            </div>
            <div class="info">
                <p class="nickname">
                    <Input
                        v-model="temp.nickname"
                        v-if="edit.nickname"
                        @on-keyup.enter="submitForm({
                                        nickname: temp.nickname
                                    }, 'Nickname');edit.nickname=false;"
                        @on-keyup.esc="edit.nickname=false;"></Input>
                    <span v-show="!edit.nickname">{{info.nickname || info.username}}</span>
                    <Icon
                        @click="edit.nickname=true;temp.nickname=info.nickname"
                        v-if="isCurrentUser && !edit.nickname"
                        custom="fa fa-pencil"
                        size="15"
                        class="edit-text"
                    ></Icon>
                </p>
                <p class="username">{{info.username}}</p>
                <p class="other motto">
                    <Input :rows="3" type="textarea"
                        v-model="temp.motto"
                        v-if="edit.motto"
                        @on-keyup.enter="submitForm({
                                        motto: temp.motto
                                    }, 'Motto');edit.motto=false;"
                        @on-keyup.esc="edit.motto=false;"
                    ></Input>
                    <span v-if="!edit.motto">{{info.motto || 'Nothing to say.'}}</span>
                    <Icon
                        @click="edit.motto=true;temp.motto=info.motto||''"
                        v-if="isCurrentUser && !edit.motto"
                        custom="fa fa-pencil"
                        size="15"
                        class="edit-text"
                    />
                </p>
                <p class="lastlogin" v-if="info.lastlogin">
                    Last Login:
                    <Time :time="info.lastlogin"></Time>
                </p>
                <p class="action">
                    <Button long v-if="!isCurrentUser">Follow</Button>
                    <Button long v-if="isCurrentUser" @click="$router.push('/setting')">Edit Profile</Button>
                </p>
                <p class="other" v-if="info.company">
                    <i class="fa fa-building" aria-hidden="true"></i> 
                    <Input title="Press Enter to Submit, Esc to canel."
                        v-model="temp.company"
                        v-if="edit.company"
                        @on-keyup.enter="submitForm({
                                        company: temp.company
                                    }, 'Company');edit.company=false;"
                        @on-keyup.esc="edit.company=false;"
                    ></Input>
                    <span v-if="!edit.company">{{info.company}}
                    <Icon
                        @click="edit.company=true;temp.company=info.company||''"
                        v-if="isCurrentUser && !edit.company"
                        custom="fa fa-pencil"
                        size="15"
                        class="edit-text"
                    /></span>
                </p> 
                <p class="other" v-if="info.location">
                    <i class="fa fa-map-marker" aria-hidden="true"></i> 
                    <Input title="Press Enter to Submit, Esc to canel."
                        v-model="temp.location"
                        v-if="edit.location"
                        @on-keyup.enter="submitForm({
                                        location: temp.location
                                    }, 'Location');edit.location=false;"
                        @on-keyup.esc="edit.location=false;"
                    ></Input>
                    <span v-if="!edit.location">{{info.location}}
                    <Icon
                        @click="edit.location=true;temp.location=info.location||''"
                        v-if="isCurrentUser && !edit.location"
                        custom="fa fa-pencil"
                        size="15"
                        class="edit-text"
                    /></span>
                </p>
                <p class="other" v-if="info.url" style="word-break:break-all;align-items: baseline;">
                    <i class="fa fa-link" aria-hidden="true"></i> 
                    <Input title="Press Enter to Submit, Esc to canel."
                        v-model="temp.url"
                        v-if="edit.url"
                        @on-keyup.enter="submitForm({
                                        url: temp.url
                                    }, 'URL');edit.url=false;"
                        @on-keyup.esc="edit.url=false;"
                    ></Input>
                    <span v-if="!edit.url"><a target="_blank" :href="info.url">{{info.url}}</a>
                    <Icon
                        @click="edit.url=true;temp.url=info.url||''"
                        v-if="isCurrentUser && !edit.url"
                        custom="fa fa-pencil"
                        size="15"
                        class="edit-text"
                    /></span>
                </p>                
            </div>
        </section>
        </Content>
        <Tabs :animated="false" class="user-tabs" v-model="tab" @on-click="OnTab" v-if="info.id">
            <TabPane label="Snippets" icon="md-code" name="snippet">
                <article class="snippet" >
                    <section class="none" v-if="snippets.length == 0 && !loading">
                        <span>Here is a wasteland of code.</span>
                    </section>
                    <Snippets :snippets="snippets" :file-icon="true" :user-icon="false"></Snippets>
                    <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
                    <Page v-show="!loading && total.snippet > 5" :total="total.snippet" :current="page.snippet" size="small" @on-change="OnPage('snippet', ...arguments)" :page-size="5"/>
                </article>
            </TabPane>
            <TabPane label="Stars" icon="md-star-outline" name="star">
                <article class="snippet" >
                    <section class="none" v-if="stars.length == 0 && !loading">
                        <span>{{info.nickname}} doesn’t have any starred snippets yet.</span>
                    </section>
                    <Snippets :snippets="stars" :file-icon="true" :user-icon="false"></Snippets>
                    <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
                    <Page v-show="!loading && total.star > 5" :total="total.star" :current="page.star" size="small" @on-change="OnPage('star', ...arguments)" :page-size="5"/>
                </article>
            </TabPane>
            <TabPane label="Forks" icon="md-git-branch" name="fork">
                <article class="snippet" >
                    <section class="none" v-if="forks.length == 0 && !loading">
                        <span>{{info.nickname}} doesn’t have any forked snippets yet.</span>
                    </section>
                    <Snippets :snippets="forks" :file-icon="true" :user-icon="false"></Snippets>
                    <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
                    <Page v-show="!loading && total.fork > 5" :total="total.fork" :current="page.fork" size="small" @on-change="OnPage('fork', ...arguments)" :page-size="5"/>
                </article>
            </TabPane>
        </Tabs>
    </Layout>
</template>
<script>
export default {
    name: "user",
    components: {
        Snippets: () => import('../components/snippets')
    },
    mounted() {
        this.Init();
    },
    data() {
        return {
            info: {
                id: '',
                username: '',
                nickname: '',
                avatar: '',
                motto: '',
                company: '',
                location: '',
                url: '',
                lastLogin: 0
            },
            edit: {
                nickname: false,
                motto: false,
                company: false,
                location: false,
                url: false,
            },
            temp: {
                nickname: '',
                motto: '',
                company: '',
                location: '',
                url: '',
            },
            snippets: [],
            stars: [],
            forks: [],
            total: {
                snippet: 0,
                star: 0,
                fork: 0
            },
            loading: false,
            page: {
                snippet: 1,
                star: 1,
                fork: 1,
            },
            tab: 'snippet',
        };
    },
    methods: {
        async Init() {
            if (this.$route.params.user == '') {
                this.$root.message($m.ERROR, 'Username couldn\'t be empty.');
                this.$router.push("/");
            } else {
                this.loadUser(this.$route.params.user);
                switch(this.$route.params.type) {
                    case 'star':
                        this.tab = 'star';
                        this.page.star = parseInt(this.$route.params.page || 1);
                        this.loadStar(this.$route.params.user);
                        break;
                    case 'fork':
                        this.tab = 'fork';
                        this.page.fork = parseInt(this.$route.params.page || 1);
                        this.loadFork(this.$route.params.user);
                        break;
                    default:
                        this.tab = 'snippet';
                        this.page.snippet = parseInt(this.$route.params.page || 1);
                        this.loadSnippet(this.$route.params.user);
                }
            }
        },
        async loadUser(username) {
            let rsp = await this.$store.dispatch("account/getInfo", username);
            if (rsp.data.total) {
                this.info = rsp.data.data[0];
                let title = this.info.nickname;
                switch(this.$route.params.type) {
                    case 'snippet': title = title + '\' Snippets';break;
                    case 'star': title = title + '\' Stars';break;
                    case 'fork': title = title + '\' Forks';break;
                }
                this.$util.title(title + (this.$route.params.page ? ' - Page ' + this.$route.params.page : ''));
            } else {
                this.$root.message($m.ERROR, 'Username was not exist.');
                this.$router.push('');
            }
        },
        async loadSnippet(username) {
            try {
                this.loading = true;
                let rsp = await this.$store.dispatch("snippet/query", {
                    query: { username, private: this.isCurrentUser ? false : undefined }, index: (this.page.snippet - 1) * 5, count: 5
                });
                this.loading = false;
                if (!rsp || rsp.state != 0) {
                    this.$Message.error(rsp ? rsp.msg : 'Something Wrong...');
                    return;
                }
                this.total.snippet = rsp.data.total;
                if (rsp.data.total == 0) return;
                this.snippets = rsp.data.data;
            } catch (error) {
                this.loading = false;
                this.$root.message($m.ERROR, error.message);
            }
        },
        async loadStar(username) {
            try {
                this.loading = true;
                let rsp = await this.$store.dispatch('fav/query', {
                    query: { username }, index: (this.page.star - 1) * 5, count: 5
                });
                if (rsp.state != 0) {
                    this.loading = false;
                    return this.$root.message($m.ERROR, rsp.msg);
                }

                let snippet = rsp.data.data.map(d => d.snippet);
                rsp = await this.$store.dispatch("snippet/query", {
                    query: { id: snippet }, index: 0
                });
                this.loading = false;
                if (!rsp || rsp.state != 0) {
                    this.$Message.error(rsp ? rsp.msg : 'Something Wrong...');
                    return;
                }
                this.total.star = rsp.data.total;
                if (rsp.data.total == 0) return;
                this.stars = rsp.data.data;
            } catch (error) {
                this.loading = false;
                this.$root.message($m.ERROR, error.message);
            }
        },
        async loadFork(username) {
            try {
                this.loading = true;
                let rsp = await this.$store.dispatch('snippet/query', {
                    query: { 
                        username, fork_from: {
                            op: '!=', val: ''
                        } 
                    }, index: (this.page.fork - 1) * 5, count: 5
                });
                this.loading = false;
                if (rsp.state != 0) {
                    return this.$root.message($m.ERROR, rsp.msg);
                }

                this.total.fork = rsp.data.total;
                if (rsp.data.total == 0) return;
                this.forks = rsp.data.data;
            } catch (error) {
                this.loading = false;
                this.$root.message($m.ERROR, error.message);
            }
        },
        handleSuccess(res, file) {
            let rsp = file.response;
            if (rsp.state == 0) {
                this.$set(this.info, "avatar", rsp.data[0]);
                this.submitForm(
                    {
                        avatar: this.info.avatar
                    },
                    "Avatar"
                );
            } else {
                this.$root.message($m.WARN,
                    rsp.msg,
                    'Upload File Failed');
            }
        },
        async submitForm(info, name) {
            try {
                info.id = this.info.id;
                info.username = this.info.username;
                let rsp = await this.$store.dispatch("account/set", info);
                if (rsp && rsp.state == 0) {
                    this.$root.message($m.SUCCESS, `Update ${name} Success!`);
                    this.info = rsp.data;
                    if (name == 'Nickname')
                        this.$util.title(this.info.nickname + (this.$route.params.page ? ' - Page ' + this.$route.params.page : ''));
                } else {
                    this.$root.message($m.ERROR, rsp.msg);
                }
            } catch (err) {
                this.$root.message($m.ERROR, err.message);
            }
        },
        async loadMore() {
            this.loading = true;
            await this.loadSnippet(this.$route.params.user);
            this.loading = false;
        },
        OnPage(type, page) {
            this.$router.push(`/u/${this.$route.params.user}/${type}/${page}`);
        },
        async OnTab(tab) {
            let type = this.$route.params.type || 'snippet';
            if (tab == type) return;
            this.$router.push(`/u/${this.$route.params.user}/${tab}`);
        }
    },
    computed: {
        isCurrentUser() {
            return this.$root.isLogin && this.$root.loginUser.id == this.info.id;
        },
        avatar() {
            let img =
                this.info.avatar.indexOf("http") == 0
                ? this.info.avatar
                : this.$config.file.fileurl + this.info.avatar;
            return this.info.avatar ? img : "/res/user.png";
        },
        uploadInterface() {
            return "/api/lib/upload";
        }
    },
    watch: {
        $route(to, from) {
            console.log(to)
            this.Init();
        }
    }
};
</script>
<style scoped lang="less">
.loading {
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    height: 2em;
}
.layout {
    display: flex;
    max-width: 1280px;
    margin: auto;
    flex-direction: row;
}
.profile {
    margin: 1em 0;
    padding: 1em 1em;
    width: 30%;
    max-width: 20em;
    .section {
        width: 100%;
        display: flex;
        flex-direction: column;
        margin: auto;
        position: relative;
        .avatar-box {
            width: 100%;
        }
        .avatar {
            flex: auto;
            background: #FFF;
            overflow: hidden;
            border-radius: 100%;
            width: 100%;
            height: 0;
            padding-bottom: 100%;
            position: relative;
            border: 1px solid #CCC;
            img {
                height: 100%;
                display: block;
                z-index: 1;
                position: absolute;
                left: 0;
                right: 0;
                margin: auto;
            }
            &:hover .avatar-upload{
                display: block;
            }
            .avatar-upload {
                display: none;
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                top: 0;
                z-index: 3;
                .upload-btn {
                    height: 100%;
                    width: 100%;
                    &:hover {
                        background: #00000030;
                    }
                }
            }
        }
        .info {
            flex: 1;
            padding-left: 2em;
            .action {
                margin: .8em 0;
            }
            .nickname {
                font-size: 2em;
                font-weight: bold;
            }
            .username {
                color: #666;
            }
            .lastlogin {
                color: #CCC;
                font-size: .8em;
            }
            .motto {
                font-weight: bold;
            }
            .other {
                font-size: 1em;
                margin: .5em 0;
                display: flex;
                flex-direction: row;
                align-items: center;
                .fa {
                    display: inline-block;
                    width: 1.2em;
                }
            }
            i.fa.edit-text {
                display: none;
            }
            p:hover {
                .edit-text {
                    display: inline;
                    cursor: pointer;
                }
            }
        }
    }
}
.snippet {
    width: 100%;
    padding: 0 .5em;
    .none {
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
    header {
        display: flex;
        justify-content: space-between;
        .statistics {
            font-size: .8em;
            padding-top: 3px;
        }
    }
    .info {
        display: flex;
        font-size: 1.2em;
        flex: 1;
        white-space: nowrap;
        width: 0;
        .icon {
            font-size: 1em;
            display: inline-block;
            padding: 5px;
            vertical-align: middle;
            line-height: 1;
        }
        h1 {
            font-size: .8em;
            font-weight: normal;
            text-overflow: ellipsis;
            overflow: hidden;
            >* { 
                vertical-align: middle;
            }
            aside {
                color: #666;
                font-size: .8em;
            }
        }
    }
    .code {
        margin: .5em 0 2em;
        .code-content {
            pre {
                margin: 0;
            }
            code {
                font-size: .8em;
                padding: 0;
                overflow: auto;
                max-height: 19em;
            }
            border-radius: 6px;
            border: 1px solid #515a6e;
            overflow: hidden;
        }
    }
}
.user-tabs {
    width: 70%;
    margin-top: 2em;
    padding: 0 1em;
}
.loading {
    position: relative;
    text-align: center;
}
@media (max-width: 800px) {
    .layout {
        flex-direction: column;
    }
    .profile {
        width: 100%;
        max-width: 100%;
        margin: auto;
        .section {
            flex-direction: row;
            justify-content: center;
            .avatar-box {
                width: 45%;
                display: flex;
                align-items: center;
            }
            .other {
                display: none;
            }
            .info {
                padding-left: 1em;
            }
        }
    }
    .user-tabs {
        width: 100%;
        margin-top: 0;
    }
    .snippet {
        width: 100%;
        padding: .5em 1em;
        header .statistics {
            font-size: 1em;
        }
        .code {
            .code-content code {
                overflow-y: auto;
            }
        }
    }
}
</style>

<style lang="less">
.avatar-upload {
    .ivu-upload {
        height: 100%;
        background: #00000030;
        border: 0;
        &:hover {
            border: 0;
        }
    }
}
</style>