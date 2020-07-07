<template>
    <Layout class="layout">
        <Login class="login" /> 
    </Layout>
</template>
<script>
import Login from '../components/login'

export default {
    name: "home",
    components: {
        Login
    },
    mounted() {
        if (this.$root.isLogin) {
            this.$router.replace(`/u/${this.$root.loginUser.username}`)
        }
    },
    data() {
        return {};
    },
    methods: {}
};
</script>
<style scoped lang="less">
.login {
    max-width: 300px;
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 200px;
}
</style>
