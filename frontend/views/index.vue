<template>
    <Layout class="layout">
        <Header class="layout-header">
        <section class="layout-logo">
            <router-link to="/">
            <span> Code Snippet </span>
            </router-link>
        </section>
        <nav class="layout-nav">
            <ul>
                <li><router-link to="/explore">代码广场</router-link></li>
            </ul>
        </nav>
        <section class="layout-info" v-if="$root.isLogin">
            <Button type="text" class="icon-btn"><Icon custom="fa fa-bell-o" /></Button>
            <Button type="text" class="icon-btn"><Icon custom="fa fa-plus" /></Button>
            <span class="avatar"><img :src="$root.fileUrl($root.loginUser.avatar, '/img/user.png')" /></span>
        </section>
        </Header>
        <Content>
            <router-view />
        </Content>
        <Footer class="layout-footer">
            <p>&copy; 2020 ~ {{new Date().getFullYear()}} Hancel. All rights reserved.</p>
        </Footer>
    </Layout>
</template>
<script>
export default {
    name: "index",
    mounted() {
        this.$store.dispatch('account/checklogin', (rsp, err) => { 
            if (!this.$root.accessCheck(this.$route) && to.route.path != '/') {
                this.$router.replace('/login');
            }
        });
    },
    data() {
        return {};
    },
    methods: {}
};
</script>
<style scoped lang="less">
.layout {
    border-radius: 4px;
    background: transparent;
}
.layout-header {
    display: flex;
    background: transparent;
    position: relative;
    padding: 0 1em;
    background: #24292e;
    color: #FFF;
}
.layout-logo {
    justify-content: left;
    text-align: left;
    font-size: 1.8em;
    font-weight: bold;
    padding-right: 1.5em;
    a { 
        color: inherit;
        vertical-align: middle;
    }
    img {
        height: 60%;
        vertical-align: middle;
    }
    span {
        vertical-align: middle;
    }
}
.layout-nav {
    justify-content: left;
    flex: 1;
    line-height: 4;
    li {
        vertical-align: middle;
        display: inline-block;
        font-weight: 500;
        a {
            vertical-align: middle;
            color: inherit;
        }
    }
}
.layout-info {
    justify-content: right;
    .avatar {
        margin: 0 .8em;
        display: inline-block;
        img {
            width: 2em;
            height: 2em;
            vertical-align: middle;
            background: #FFF;
            border-radius: 50%;
            padding: 1.5px
        }
    }
    .icon-btn {
        color: inherit;
        padding: 0;
        margin: 0 .8em;
        background: transparent;
    }
    .fa {
        font-size: 150%;
    }
}
.layout-footer {
    text-align: center;
    background: transparent;
    height: 5em;
    p {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 1em;
    }
}
</style>