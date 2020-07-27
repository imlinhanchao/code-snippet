<style scoped lang="less">
.layout {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    height: 400px;
    margin: auto;
    top: 0;
    bottom: 0;
    position: absolute;
    left: 0;
    right: 0;
}
.layout-form {
    padding: 0 .5em;
    i {
        width: 15px;
    }
}
.refresh-captcha {
    cursor: pointer;
    transition: all .5s;
    &:active {
        transform: rotate(180deg);
    }
}
.layout-logo {
    text-align: center;
    font-size: 2.5em;
    font-weight: bold;
    color: #f0f0f0;
    a { 
        color: inherit;
        vertical-align: middle;
    }
    img {
        width: 2em;
        vertical-align: middle;
    }
    span {
        vertical-align: middle;
    }
}
</style>
<template>
    <Layout class="layout">
        <article>
        <section class="layout-logo">
            <router-link to="/">
                <img src="../assets/logo-light.png" alt="" />
                <span>Code Snippit</span>
            </router-link>
        </section> 
        <Form ref="loginForm" :model="login" :rules="ruleValidate" class="layout-form">
            <FormItem prop="username">
                <Input
                    type="text"
                    v-model="login.username"
                    placeholder="username"
                    @on-keyup.enter="$refs['password'].focus()"
                    @on-blur="existCheck"
                >
                    <Icon custom="fa fa-user" slot="prepend"></Icon>
                </Input>
            </FormItem>
            <FormItem prop="passwd">
                <Input ref="password"
                    id="password"
                    :type="passwdType"
                    v-model="login.passwd"
                    placeholder="password"
                    @on-keyup.enter="isRegister ? $refs['email'].focus() : loginSubmit('loginForm')"
                >
                    <Icon custom="fa fa-lock" slot="prepend"></Icon>
                    <Button
                        slot="append"
                        :icon="showIcon"
                        @click="isPasswdShow=!isPasswdShow"
                        style="box-shadow:none;"
                    ></Button>
                </Input>
            </FormItem>
            <FormItem v-if="isRegister" prop="email">
                <Input ref="email" 
                    type="text"
                    v-model="login.email"
                    placeholder="email"
                    @on-keyup.enter="$refs['captcha'].focus()"
                >
                    <Icon custom="fa fa-envelope" slot="prepend"></Icon>
                </Input>
            </FormItem>
            <FormItem v-if="isRegister" prop="captcha">
                <Input ref="captcha"
                    type="text"
                    v-model="login.captcha"
                    placeholder="Are you a robot ?"
                    @on-keyup.enter="submit('loginForm')"
                >
                    <Icon
                        slot="prepend"
                        custom="fa fa-refresh"
                        class="refresh-captcha"
                        @click="rand=Math.random()"
                    ></Icon>
                    <img slot="append" :src="`/api/lib/captcha?r=${rand}`" style="height: 28px; margin: -4px -7px;" />
                </Input>
            </FormItem>
            <div class="login-footer">
                <Button type="success" style="width: 100%;" @click="submit('loginForm')" :loading="login_loading">{{btnName}}</Button>
            </div>
        </Form>
        </article>
    </Layout>
</template>
<script>
export default {
    name: 'login',
    props: {
    },
    data() {
        const validatePasswd = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('Please enter your password'));
            } else if (value.length < 6) {
                callback(new Error('Your password was too short'));
            } else {
                callback();
            }
        };
        const validateUser = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('Please enter your username'));
            } else if (value.length < 5) {
                callback(new Error('Your username was too short'));
            } else {
                callback();
            }
        };
        const validateEmail = async (rule, value, callback) => {
            if (!this.isRegister) return;
            if (value === '') {
                callback(new Error('Please enter your email'));
            } else {
                try {
                    let rsp = await this.$store.dispatch('account/exist', {
                        other: {
                            email: this.login.email
                        }
                    })
                    if (rsp && rsp.state == 0) {
                        if (rsp.data) {
                            callback(new Error('The email was register.'));
                        } else {
                            callback();
                        }
                    } else {
                        this.$root.message($m.ERROR, rsp.msg);
                    }  
                } catch (err) {
                    this.$root.message($m.ERROR, err.message);
                }
                callback();
            }
        };
        return {
            login: {
                username: '',
                passwd: '',
                email: '',
                captcha: ''
            },
            isPasswdShow: false,
            ruleValidate: {
                username: [{ validator: validateUser, trigger: 'blur' }],
                passwd: [{ validator: validatePasswd, trigger: 'blur' }],
                email: [{ validator: validateEmail, trigger: 'blur' }],
                captcha: [{ }]
            },
            login_loading: false,
            isRegister: false,
            rand: Math.random()
        };
    },
    computed: {
        showIcon() {
            return this.isPasswdShow ? 'md-eye-off' : 'md-eye';
        },
        passwdType() {
            return this.isPasswdShow ? 'text' : 'password';
        },
        submit () {
            return this.isRegister ? this.registerSubmit : this.loginSubmit
        },
        btnName() {
            return this.isRegister ? 'Register' : 'Login'
        }
    },
    watch: {
    },
    mounted() {
        this.logoutEvent();
        if (this.$route.meta.title == 'Register') {
            this.isRegister = true;
        }
    },
    methods: {
        loginSubmit(form) {
            this.$refs[form].validate(async valid => {
                if (!valid) return;
                try {
                    this.login_loading = true;
                    let rsp = await this.$store.dispatch('account/login', this.login);
                    this.login_loading = false;
                    if (rsp && rsp.state == 0) {
                        this.loginModel = false;
                        this.$emit('input', false);
                        this.$root.message($m.SUCCESS, `Welcome back ${rsp.data.nickname} !`, 'Hi !');
                        let path = localStorage.getItem('redirect') || '/';
                        this.$router.push(path);
                        localStorage.removeItem('redirect');
                    } else {
                        this.$root.message($m.ERROR, rsp.msg);
                    }
                } catch (err) {
                    this.$root.message($m.ERROR, err.message);
                }
            });
        },
        registerSubmit(form) {
            this.$refs[form].validate(async valid => {
                if (!valid) return;
                try {
                    this.login_loading = true;
                    let rsp = await this.$store.dispatch('account/create', this.login);
                    if (rsp && rsp.state == 0) {
                        this.isRegister = false;
                        this.loginSubmit(form);
                    } else {
                        this.login_loading = false;
                        this.$root.message($m.ERROR, rsp.msg);
                    }
                } catch (err) {
                    this.$root.message($m.ERROR, err.message);
                }
            });
        },
        async existCheck (usename) {
            try {
                if (this.login.username == '') return true;
                let rsp = await this.$store.dispatch('account/exist', { username: this.login.username});
                this.isRegister = !rsp.data;
            } catch (err) {
                console.error(err)
            }
        },
        async logoutEvent() {
            try {
                let rsp = await this.$store.dispatch('account/logout');
                if (!rsp || rsp.state != 0) {
                    return;
                }
            } catch (err) {
            }
        },
    }
};
</script>