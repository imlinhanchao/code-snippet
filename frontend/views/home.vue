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
    mounted() {
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