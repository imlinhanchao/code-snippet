<template>
    <Layout class="layout">
        
    </Layout>
</template>
<script>

export default {
    name: "home",
    components: {
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
