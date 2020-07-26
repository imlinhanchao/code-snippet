<template>
    <Layout class="layout">
        <Editor v-if="$root.isLogin"></Editor>
    </Layout>
</template>
<script>
import Editor from '../components/editor';

export default {
    name: "home",
    components: {
        Editor
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