<template>
  <Layout class="layout">
        <section class="profile">
            <div class="avatar-box">
                <div class="avatar">
                <img :src="avatar" />
                <section class="avatar-upload" >
                    <input @change="PreUpload" ref="upload" type="file" accept="image/*" name="" style="display:none">
                    <Button class="upload-btn" type="text" @click="$refs.upload.click()">
                    <Icon type="ios-cloud-upload" size="30"></Icon>
                    </Button>
                </section>
                </div>
            </div>
            <Form ref="formProfile" :model="info" class="info">
                <h1>Profile</h1>
                <FormItem prop="nickname" label="Nick Name">
                    <Input v-model="info.nickname"></Input>
                </FormItem>
                <FormItem prop="company" label="Company">
                    <Input v-model="info.company"></Input>
                </FormItem>
                <FormItem prop="location" label="Location">
                    <Input v-model="info.location"></Input>
                </FormItem>
                <FormItem prop="url" label="URL">
                    <Input v-model="info.url"></Input>
                </FormItem>
                <FormItem prop="motto" label="Motto">
                    <Input v-model="info.motto" :rows="3" type="textarea"></Input>
                </FormItem>
                <FormItem style="text-align: right">
                    <Alert show-icon><span style="color: #2d8cf0;">All non-empty information will be displayed on your personal page.</span></Alert>
                    <Button type="success" @click="OnSubmit('formProfile')">Save</Button>
                </FormItem>
            </Form>
        </section>
        <Modal v-model="avatarModal" title="Crop Your Avatar" @on-ok="SaveAvatar" :loading="loading">
            <section class="avatar-cropper">
                <vue-cropper v-if="avatarModal"
                    ref="cropper"
                    :src="editavatar"
                    alt="Source Image"
                    :aspect-ratio="1"
                    :max-height="500"
                >
                </vue-cropper>
            </section>
        </Modal>
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
            avatarModal: false
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
        async OnSubmit() {
            try {
                let rsp = await this.$store.dispatch("account/set", this.info);
                if (rsp && rsp.state == 0) {
                    this.$root.message($m.SUCCESS, `Save Success!`);
                    this.info = rsp.data;
                } else {
                    this.$root.message($m.ERROR, rsp.msg);
                }
            } catch (err) {
                this.$root.message($m.ERROR, err.message);
            }
        },
        PreUpload() {
            let reader = new FileReader();
            let file = this.$refs.upload.files[0];
            reader.onload = () => {
                this.editavatar = reader.result;
                this.editAvatar = true;
                this.avatarModal = true
            }
            if (file)  reader.readAsDataURL(file)
        },
        async SaveAvatar() {
            try {
                this.loading = true;
            } catch (error) {
                
            }
        }
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
    max-width: 980px;
    margin: auto;
    flex-direction: row;
}
.profile {
    width: 100%;
    display: flex;
    flex-direction: row-reverse;
    margin: 1em auto;
    position: relative;
    .avatar-box {
        padding: 1.5em;
        width: 40%;
        max-width: 500px;
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
.avatar-cropper {
    max-height: 70vh;
    overflow: auto;
}
</style>

<style lang="less">
.cropper-view-box, .cropper-face {
    border-radius: 50%;
}
</style>