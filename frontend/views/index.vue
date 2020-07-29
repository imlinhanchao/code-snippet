<template>
    <Layout class="layout">
        <Header></Header>
        <section class="message">
            <Alert :type="$root.msg.name" banner show-icon v-if="$root.msg.content">
                {{$root.msg.title}}
                <section class="msg-content" slot="desc">
                    <span>
                        <span slot="desc">
                            <span v-html="$root.msg.content"></span>
                        </span>
                    </span>
                    <span @click="$root.msg.content=''" class="fa fa-times msg-close">

                    </span>
                </section>
            </Alert>
        </section>
        <Content>
            <router-view />
        </Content>
        <Footer class="layout-footer">
            <p>&copy; {{new Date().getFullYear()}} <a href ="https://github.com/imlinhanchao/code-snippet" target="_black" >Code-Snippet</a> Open Source. All rights reserved. </p>
        </Footer>
        <BackTop></BackTop>
    </Layout>
</template>
<script>
import Header from '../components/header'

export default {
    name: "index",
    components: {
        Header
    },
    async mounted() {
        let rsp = await this.$store.dispatch('account/checklogin');
        if(this.$route.meta.login && !this.$root.isLogin) {
            this.$root.plsLogin();
        }
    },
    data() {
        return {};
    },
    methods: {}
};
</script>
<style scoped lang="less">
.layout {
    background: transparent;
    overflow: hidden;
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
.msg-content {
    display: flex;
    justify-content: space-between;
    .msg-close {
        position: relative;
        top: -.5em;
        cursor: pointer;
    }
}
.ivu-alert-info {
    border: 1px solid #abdcff;
    background-color: #f0faff;
}
</style>
<style lang="less">
.message {
    a {
        display: inline-block;
        border-bottom: 1px dashed #000;
    }
}
</style>