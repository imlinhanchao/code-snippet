<template>
  <Layout class="layout">
        <Menu :active-name="menu" class="setting-menu" @on-select="OnSelectMenu">
            <MenuItem name="profile">
                <Icon custom="fa fa-user" ></Icon>
                {{$t('profile')}}
            </MenuItem>
            <MenuItem name="security">
                <Icon custom="fa fa-shield" ></Icon>
                {{$t('security')}}
            </MenuItem>
        </Menu>
        <section v-show="menu == 'profile'" class="profile">
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
                <h1>{{$t('profile')}}</h1>
                <FormItem prop="nickname" :label="$t('nickname')">
                    <Input v-model="info.nickname"></Input>
                </FormItem>
                <FormItem prop="company" :label="$t('company')">
                    <Input v-model="info.company"></Input>
                </FormItem>
                <FormItem prop="location" :label="$t('location')">
                    <Input v-model="info.location"></Input>
                </FormItem>
                <FormItem prop="url" :label="$t('url')">
                    <Input v-model="info.url"></Input>
                </FormItem>
                <FormItem prop="motto" :label="$t('motto')">
                    <Input v-model="info.motto" :rows="3" type="textarea"></Input>
                </FormItem>
                <Alert show-icon><span style="color: #2d8cf0;">{{$t('profile_notice')}}</span></Alert>
                <FormItem style="text-align: right">
                    <Button type="success" @click="OnSubmit('formProfile')">{{$t('save')}}</Button>
                </FormItem>
            </Form>
        </section>
        <section v-show="menu == 'security'" class="security">
            <h1>{{$t('security')}}</h1>
            <Form ref="formEmail" class="email" >
                <FormItem :label="$t('email')">
                    <p style="clear: both; font-size:1.2em">
                        <span>{{info.email}}</span> 
                        <span class="tag" :class="{active: info.verify }">{{info.verify ? $t('verified') : $t('inverified')}}</span>
                        <Button style="float:right" v-if="!info.verify" @click="OnSendEmail" :loading="loading">{{$t('resend_email')}}</Button>
                    </p>
                </FormItem>
                <FormItem prop="email" :label="$t('new_email')" :rules="[{ validator: validateEmail, trigger: 'blur' }]">
                    <section class="email-update">
                        <Input v-model="email"></Input> 
                        <Button type="success" @click="OnUpdateEmail" :loading="loading_email">{{$t('update_email')}}</Button>
                    </section>
                </FormItem>
            </Form>
            <Divider></Divider>
            <Form ref="formPasswd" :model="password" class="password" :rules="ruleValidate">
                <FormItem prop="old" :label="$t('old_passwd')">
                    <Input type="password" v-model="password.old"></Input>
                </FormItem>
                <FormItem prop="value" :label="$t('new_passwd')">
                    <Input type="password" v-model="password.value"></Input>
                </FormItem>
                <FormItem prop="confirm" :label="$t('confirm_passwd')">
                    <Input type="password" prop="confirm" v-model="password.confirm"></Input> 
                </FormItem>
                <FormItem style="text-align: right">
                    <Button type="info" @click="OnUpdatePasswd">{{$t('update_passwd')}}</Button>
                </FormItem>
            </Form>
        </section>
        <Cropper v-model="avatarModal" :src="editAvatar" @save="SaveAvatar" :file="file">
        </Cropper>
  </Layout>
</template>
<script>
export default {
    name: "setting",
    components: {
        VueCropper: () => import('vue-cropperjs'),
        Cropper: () => import('../components/cropper')
    },
    mounted() {
        this.Init();
    },
    data() {
        const validatePasswd = (rule, value, callback) => {
            if (value === '') {
                callback(new Error(this.$t('empty_passed')));
            } else if (value.length < 6) {
                callback(new Error(this.$t('passwd_too_short')));
            } else {
                callback();
            }
        }
        const validateNewPasswd = (rule, value, callback) => {
            if (value === '') {
                callback(new Error(this.$t('empty_newpassed')));
            } else if (value.length < 6) {
                callback(new Error(this.$t('newpasswd_too_short')));
            } else {
                callback();
            }
        }
        const validatePassCheck = (rule, value, callback) => {
            if (value === '') {
                callback(new Error(this.$t('empty_passwd_again')));
            } else if (value !== this.password.value) {
                callback(new Error(this.$t('passwd_not_match')));
            } else {
                callback();
            }
        }
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
            loading_email: false,
            avatarModal: false,
            file: {},
            editAvatar: '',
            menu: 'profile',
            password: {
                old: '',
                value: '',
                confirm: ''
            },
            email: '',
            ruleValidate: {
                old: [{ validator: validatePasswd, trigger: 'blur' }],
                value: [{ validator: validateNewPasswd, trigger: 'blur' }],
                confirm: [{ validator: validatePassCheck, trigger: 'blur' }],
            },
        };
    },
    methods: {
        async Init() {
            let menu = this.$route.params.menu;
            if(['profile', 'security'].indexOf(menu) < 0) menu = 'profile';
            this.menu = menu;
            let rsp = await this.$store.dispatch('account/checklogin');
            if(!this.$root.isLogin) this.$root.plsLogin();
            this.info = rsp.data;
            let title = this.info.nickname;
            this.$util.title(title + this.$t('setting_of'));
        },
        async loadUser(username) {
            let rsp = await this.$store.dispatch("account/getInfo", username);
            if (rsp.data.total) {
                this.info = rsp.data.data[0];
                let title = this.info.nickname;
                this.$util.title(title + this.$t('setting_of'));
            } else {
                this.$root.message($m.ERROR, this.$t('not_exist_user'));
                this.$router.push('');
            }
        },
        async OnSubmit() {
            try {
                let rsp = await this.$store.dispatch("account/set", this.info);
                if (rsp && rsp.state == 0) {
                    this.$root.message($m.SUCCESS, this.$t('save_success'));
                    this.info = rsp.data;
                    let title = this.info.nickname;
                    this.$util.title(title + this.$t('setting_of'));
                } else {
                    this.$root.message($m.ERROR, rsp.msg);
                }
            } catch (err) {
                this.$root.message($m.ERROR, err.message);
            }
        },
        OnSelectMenu(name) {
            this.menu = name;
        },
        async OnSendEmail() {
            try {
                this.loading = true;
                let rsp = await this.$store.dispatch('account/sendverify', this.info);
                this.loading = false;
                if (rsp && rsp.state == 0) {
                    this.$root.message($m.SUCCESS, this.$t('send_email_success'));
                } else {
                    this.$root.message($m.ERROR, rsp.msg);
                }
            } catch (err) {
                this.loading = false;
                this.$root.message($m.ERROR, err.message);
            }
        },
        async OnUpdateEmail() {
            try {
                this.loading_email = true;
                let rsp = await this.$store.dispatch('account/set', {
                    id: this.info.id,
                    username: this.info.username,
                    email: this.email
                });
                if (rsp && rsp.state == 0) {
                    this.info.email = this.email;
                    this.info.verify = false;
                    this.email = '';
                    await this.$store.dispatch('account/sendverify', this.info);
                    this.$root.message($m.SUCCESS, this.$t('update_email_success'));
                    this.loading_email = false;
                } else {
                    this.loading_email = false;
                    this.$root.message($m.ERROR, rsp.msg);
                }
            } catch (err) {
                this.loading = false;
                this.$root.message($m.ERROR, err.message);
            }
        },
        OnUpdatePasswd() {
            this.$refs.formPasswd.validate(async valid => {
                if (!valid) return;
                try {
                    let rsp = await this.$store.dispatch("account/set", {
                        id: this.info.id,
                        username: this.info.username,
                        passwd: this.password.value,
                        oldpasswd: this.password.old
                    });
                    if (rsp && rsp.state == 0) {
                        this.$root.message($m.SUCCESS, this.$t('passwd_update'));
                        this.info = rsp.data;
                        this.password = { old: '', value: '', confirm: '' };
                    } else {
                        this.$root.message($m.ERROR, rsp.msg);
                    }
                } catch (err) {
                    this.$root.message($m.ERROR, err.message);
                }
            })
        },
        PreUpload() {
            let reader = new FileReader();
            let file = this.$refs.upload.files[0];
            this.file = file;
            console.dir(file)
            reader.onload = () => {
                this.editAvatar = reader.result;
                this.avatarModal = true
            }
            if (file)  reader.readAsDataURL(file)
        },
        async SaveAvatar(url) {
            this.$set(this.info, 'avatar', url);
            await this.$store.dispatch("account/set", {
                id: this.info.id,
                username: this.info.username,
                avatar: this.info.avatar
            });
        },
        async validateEmail (rule, value, callback) {
            if (this.email === '') {
                callback(new Error(this.$t('empty_email')));
            } else if (this.email == this.info.email) {
                callback(new Error(this.$t('same_email')));
            } else if (null == this.email.match(/^[^@]*?@[^@]*?$/)) {
                callback(new Error(this.$t('invaild_email')));
            } else {
                try {
                    let rsp = await this.$store.dispatch('account/exist', {
                        other: {
                            email: this.email
                        }
                    })
                    if (rsp && rsp.state == 0) {
                        if (rsp.data) {
                            callback(new Error(this.$t('exist_email')));
                        } else {
                            callback();
                        }
                    } else {
                        this.$Message.error(rsp.msg);
                    }  
                } catch (err) {
                    this.$Message.error(err.message);
                }
                callback();
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
.security {
    width: 100%;
    display: flex;
    margin: 0 1em;
    padding: .5em 0;
    flex-direction: column;
    flex: 1;
    .email {
        .tag {
            user-select: none;
            border-radius: 2em;
            border: 1px solid #ed4014;
            padding: .1em .5em;
            color: #ed4014;
            font-weight: bold;
            font-size: .8em;
            &.active {
                border: 1px solid #19be6b;
                color: #19be6b;
            }
        }
    }
    .email-update {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        .ivu-btn {
            margin-left: 1em;
        }
        .ivu-input-wrapper {
            max-width: 25em;
        }
    }
}
.profile {
    width: 100%;
    display: flex;
    flex-direction: row-reverse;
    margin: 1em auto;
    position: relative;
    flex: 1;
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
.setting-menu {
    margin: 1em;
    background: transparent;
    border-radius: 6px;
    border: 1px solid #373c3e;
    overflow: hidden;
    &.ivu-menu {
        &:after {
            background: transparent;
        }
        .ivu-menu-item {
            border-bottom: 1px solid #373c3e;
            &:hover {
                color: #2b85e4
            }
            &:after {
                content: '';
                display: block;
                width: 2px;
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                background: #24292e;
            }
            &.ivu-menu-item-active{
                background: #24292e;
                color: #FFF;
                :after {
                    background: #dcdee2;
                }
            }
        }
    }
}
@media (max-width: 600px) {
    .layout {
        flex-direction: column;
        .setting-menu {
            display: flex;
            flex-direction: row;
            width: auto!important;
            border: 0;
            border-bottom: 1px solid #373c3e;
            padding: 0 1em;
            border-radius: 0;
            .ivu-menu-item {
                border-radius: 6px 6px 0 0;
                border: 1px solid #373c3e;
                border-bottom: 0;
                overflow: hidden;
                margin-left: -1px;
                &:after {
                    display: none;
                }
            }
        }
        .profile {
            width: auto;
            margin: 0 1em;
            flex-direction: column;
            .avatar-box {
                width: 100%;
                padding: 1em;
            }
            .info {
                padding: 0 1em;
            }
        }
    }
}
</style>

<style lang="less">
.cropper-view-box, .cropper-face {
    border-radius: 50%;
}
</style>