<template>
    <Layout class="layout">
        
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
            //this.$router.replace(`/u/${this.$root.loginUser.username}`)
        }
    },
    data() {
        return {};
    },
    methods: {}
};
</script>
<style scoped lang="less">
</style>
