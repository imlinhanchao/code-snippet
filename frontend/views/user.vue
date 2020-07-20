<template>
  <Layout class="layout">
    <Content class="profile">
      <section class="section">
        <div v-if="info.id" class="avatar">
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
            <Input
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
    <Content class="snippet">

    </Content>
  </Layout>
</template>
<script>
import config from "../../config.json";

export default {
    name: "user",
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
            }
        };
    },
    methods: {
        async init() {
            if (this.$route.params.user == "") {
                this.$root.message($m.ERROR, 'Username couldn\'t be empty.');
                this.$router.push("/");
            } else {
                let rsp = await this.$store.dispatch("account/getInfo", this.$route.params.user);
                if (rsp.data.total) {
                    this.info = rsp.data.data[0];
                    this.$util.title(this.info.nickname);
                } else {
                    this.$root.message($m.ERROR, 'Username was not exist.');
                    this.$router.push("/");
                }
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
                    err = (err && err.message) || rsp.msg;
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
}
.profile {
    flex: 1;
    margin: 1em 0;
    padding: 1em 1em;
    width: 25%;
    max-width: 30em;
    .section {
        width: 100%;
        display: flex;
        flex-direction: column;
        margin: auto;
        position: relative;
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