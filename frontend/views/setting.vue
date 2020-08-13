<template>
  <Layout class="layout">
        <section class="section">
            <div class="avatar-box">
                <div class="avatar">
                <img :src="avatar" />
                <section class="avatar-upload" >
                    <input @change="handleUpload" ref="upload" type="file" accept="image/*" name="" style="display:none">
                    <Button class="upload-btn" type="text" @click="$refs.upload.click()">
                    <Icon type="ios-cloud-upload" size="30"></Icon>
                    </Button>
                </Upload>
                </div>
            </div>
            <div class="info">
            <p class="nickname">
                <Input v-model="info.nickname"></Input>
            </p>
            <p class="username">{{info.username}}</p>
            <p class="motto">
                <Input :rows="3" type="textarea" v-model="info.motto"></Input>
            </p>
            </div>
        </section>
        <vue-cropper v-if="editAvatar"
            ref="cropper"
            :src="avatar"
            alt="Source Image"
            :aspect-ratio="1"
        >
        </vue-cropper>
  </Layout>
</template>
<script>
import 'cropperjs/dist/cropper.css';
export default {
    name: "setting",
    components: {
        VueCropper: () => import('vue-cropperjs')
    },
    mounted() {
        this.Init();
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
            loading: false,
            editAvatar: false
        };
    },
    methods: {
        async Init() {
            let rsp = await this.$store.dispatch('account/checklogin');
            if(this.$root.isLogin) await this.loadUser(this.$root.loginUser.username);
            else this.$root.plsLogin();
        },
        async loadUser(username) {
            let rsp = await this.$store.dispatch("account/getInfo", username);
            if (rsp.data.total) {
                this.info = rsp.data.data[0];
                let title = this.info.nickname;
                this.$util.title(title + '\'s Setting');
            } else {
                this.$root.message($m.ERROR, 'Username was not exist.');
                this.$router.push('');
            }
        },
        handleUpload() {
            let reader = new FileReader();
            let file = this.$refs.upload.files[0];
            reader.onload = () => {
                this.info.avatar = reader.result;
                this.editAvatar = true
            }
            if (file)  reader.readAsDataURL(file)
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
    },
    computed: {
        avatar() {
            let img = this.info.avatar.indexOf('data:') == 0 || 
                this.info.avatar.indexOf("http") == 0
                ? this.info.avatar
                : this.$config.file.fileurl + this.info.avatar;
            return this.info.avatar ? img : "/res/user.png";
        },
        uploadInterface() {
            return "/api/lib/upload";
        }
    },
};
</script>
<style scoped lang="less">
.layout {
    display: flex;
    max-width: 1280px;
    margin: auto;
    flex-direction: row;
}
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
            font-size: .8em;
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
</style>

<style lang="less">
</style>