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
    <Content class="snippet" v-if="info.id">
        <section class="none" v-if="snippets.length == 0">
            <span>Here is a wasteland of code.</span>
        </section>
        <section v-for="(s, i) in snippets" v-bind:key="i">
            <header>
                <div class="info">
                    <!-- <img :src="`/api/account/avatar/${s.username}`" /> -->
                    <Icon class="icon" :custom="$root.iconName($root.getCodeExt(s.codes[0].filename))"></Icon>
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
import config from "../../config.json";
import 'devicon/devicon.css';
import 'devicon/devicon-colors.css';

export default {
    name: "user",
    components: {
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
            total: 0
        };
    },
    methods: {
        async init() {
            if (this.$route.params.user == '') {
                this.$root.message($m.ERROR, 'Username couldn\'t be empty.');
                this.$router.push("/");
            } else {
                this.loadUser(this.$route.params.user);
                this.loadSnippet(this.$route.params.user);
            }
        },
        async loadUser(username) {
            let rsp = await this.$store.dispatch("account/getInfo", username);
            if (rsp.data.total) {
                this.info = rsp.data.data[0];
                this.$util.title(this.info.nickname);
            } else {
                this.$root.message($m.ERROR, 'Username was not exist.');
                this.$router.push("/");
            }
        },
        async loadSnippet(username) {
            try {
                let count = 10;
                let rsp = await this.$store.dispatch("snippet/query", {
                    query: { username, create_time: this.last_data }, index: 0
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
        }
    },
    watch: {
        $router: (to, from) => {
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
                width: 100%;
                display: block;
                z-index: 1;
                position: absolute;
                top: 0;
                bottom: 0;
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
        .icon {
            font-size: 2.5em;
            display: inline-block;
            padding: 5px;
            vertical-align: top;
        }
        h1 {
            font-size: .8em;
            font-weight: normal;
            a { 
                vertical-align: top;
            }
            aside {
                color: #666;
                font-size: .8em;
            }
        }
    }
    .statistics {
        font-size: .8em;
        padding: 2px 0;
        width: 322px;
    }
    .code {
        margin: 1em 0;
        .code-content {
            pre {
                margin: 0;
            }
            code {
                font-size: .8em;
                padding: 0;
            }
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
            border: 1px solid #e1e4e8;
        }
    }
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
        header {
            flex-direction: column;
            .statistics {
                display: none;
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