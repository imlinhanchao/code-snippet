<template>
    <Layout class="layout">
        <Header class="layout-header">
        <div class="layout-logo">
            <router-link to="/">
            <img src="../assets/logo.png" /> <span> Vue Parcel Template </span>
            </router-link>
        </div>
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
    padding: 0 2em;
}
.layout-logo {
    justify-content: center;
    height: 100%;
    flex: auto;
    text-align: center;
    font-size: 2.5em;
    font-weight: 300;
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