<template>
    <Layout class="layout">
        <Editor v-if="$root.isLogin"></Editor>
    </Layout>
</template>
<script>

export default {
    name: "home",
    components: {
        Editor: () => import('../components/editor')
    },
    async mounted() {
        let rsp = await this.$store.dispatch('account/checklogin');
        if (!this.$root.isLogin) {
            this.$router.replace('/explore');
        }
    },
    data() {
        return {

        };
    },
    watch: {
    },
    computed: {

    },
    methods: {

    }
};
</script>
<style scoped lang="less">

</style>