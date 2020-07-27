<template>
  <Layout class="layout">
    <Content class="profile" v-if="info.id">
      <section class="section">
          <div class="avatar-box">
            <div class="avatar">
            <img :src="$root.fileUrl(info.avatar, '/img/user.png')" />
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
                        }, 'Nicknamee');edit.nickname=false;"
              @on-keyup.esc="edit.nickname=false;"></Input>
            <span v-show="!edit.nickname">{{info.nickname}}</span>
            <Icon
              @click="edit.nickname=true;temp.nickname=info.nickname"
              v-if="isCurrentUser && !edit.nickname"
              custom="fa fa-pencil"
              size="15"
              class="edit-text"
            ></Icon>
          </p>
          <p class="username">{{info.username}}</p>
          <p class="motto">
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
        </div>
      </section>
    </Content>
    <Content class="snippet" v-if="info.id" v-infinite-scroll="loadMore" infinite-scroll-disabled="noMore" infinite-scroll-distance="10">
        <section class="none" v-if="snippets.length == 0 && !loading">
            <span>Here is a wasteland of code.</span>
        </section>
        <section v-for="(s, i) in snippets" v-bind:key="i" :id="`snippet${i}`">
            <header>
                <div class="info">
                    <h1>
                        <FileIcon class="icon" :filename="s.codes[0].filename"></FileIcon>
                        <router-link :to="`/u/${s.username}`">{{s.username}}</router-link> <span> / </span>
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
        <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
        <Page v-show="!loading && total > 5" :total="total" :current="page" size="small" @on-change="OnPage" :page-size="5"/>
    </Content>
  </Layout>
</template>
<script>
import config from "../../config.json";
import FileIcon from "../components/fileicon";
import Statistics from '../components/statistics'

export default {
    name: "user",
    components: {
        FileIcon, Statistics
    },
    mounted() {
        this.init();
    },
    data() {
        return {
            info: {
                id: "",
                username: "",
                nickname: "",
                avatar: "",
                motto: "",
                lastLogin: 0
            },
            edit: {
                nickname: false,
                motto: false
            },
            temp: {
                nickname: "",
                motto: ""
            },
            last_data: new Date().getTime(),
            snippets: [],
            total: 0,
            loading: false,
            page: 1
        };
    },
    methods: {
        async init() {
            this.snippets = [];
            this.last_data = new Date().getTime();
            this.page = 1;
            if (this.$route.params.user == '') {
                this.$root.message($m.ERROR, 'Username couldn\'t be empty.');
                this.$router.push("/");
            } else {
                this.page = parseInt(this.$route.params.page || 1);
                this.loadUser(this.$route.params.user);
                this.loadSnippet(this.$route.params.user);
            }
        },
        async loadUser(username) {
            let rsp = await this.$store.dispatch("account/getInfo", username);
            if (rsp.data.total) {
                this.info = rsp.data.data[0];
                this.$util.title(this.info.nickname + (this.$route.params.page ? ' Page ' + this.$route.params.page : ''));
            } else {
                this.$root.message($m.ERROR, 'Username was not exist.');
                this.$router.push("/");
            }
        },
        async loadSnippet(username) {
            try {
                this.loading = true;
                let count = 10;
                this.snippets = [];
                let rsp = await this.$store.dispatch("snippet/query", {
                    query: { username }, index: (this.page - 1) * 5, count: 5
                });
                this.loading = false;
                if (!rsp || rsp.state != 0) {
                    this.$Message.error(rsp ? rsp.msg : 'Something Wrong...');
                    return;
                }
                this.total = rsp.data.total;
                if (rsp.data.total == 0) return;
                this.snippets = rsp.data.data;
                this.last_data = this.snippets[this.snippets.length - 1].create_time
            } catch (error) {
                this.loading = false;
                this.$root.message($m.ERROR, err.message);
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
        async OnPage(page) {
            this.$router.push(`/u/${this.$route.params.user}/p/${page}`);
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
                : config.file.fileurl + this.info.avatar;
            return this.info.avatar ? img : "/img/user.png";
        },
        uploadInterface() {
            return "/api/lib/upload";
        },
        noMore() {
            return this.loading || this.total == 0
        }
    },
    watch: {
        $route(to, from) {
            console.log(to)
            this.init();
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
            .nickname {
                font-size: 2em;
                font-weight: bold;
            }
            .username {
                color: #666;
            }
            .lastlogin {
                color: #CCC;
                font-size: .5em;
            }
            .motto {
                font-size: 1em;
                margin: 1em 0;
            }
            .edit-text {
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
    width: 70%;
    padding: 2.5em 2em;
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
                width: 30%;
            }
            .motto {
                display: none;
            }
            .info {
                padding-left: 1em;
            }
        }
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