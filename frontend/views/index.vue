<template>
    <Layout class="layout">
        <Header />
        <Content>
            <router-view />
        </Content>
        <Footer class="layout-footer">
            <p>&copy; 2020 ~ {{new Date().getFullYear()}} Hancel. All rights reserved.</p>
        </Footer>
    </Layout>
</template>
<script>
import Header from '../components/header'

export default {
    name: "index",
    components: {
        Header
    },
    mounted() {
        this.$store.dispatch('account/checklogin', (rsp, err) => { 
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