<template>
    <Layout class="layout">
        <section class="loading" v-show="loading" >
            <p><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
            <p>Watting to Verify...</p>
        </section>
        <section v-show="!loading" class="verified">
            <p><i class="fa fa-envelope" aria-hidden="true"></i> </p>
            <p>Your email was verified. </p>
            <p>You can start using all of Code Snippet's features. </p>
        </section>
    </Layout>
</template>
<script>
export default {
    name: "explore",
    components: {
        
    },
    async mounted() {
        this.loading = true;
        try {
            let rsp = await this.$store.dispatch('account/verify', this.$route.params);
            if (rsp && rsp.state == 0) {
                this.loading = false;
                let path = localStorage.getItem('redirect') || '/';
                setTimeout(() => this.$router.push(path), 3000);
            } else {
                this.$root.message($m.ERROR, rsp.msg);
            }
        } catch (err) {
            this.$root.message($m.ERROR, err.message);
        }
    },
    data() {
        return {
            loading: true
        };
    },
    methods: {
    },
    computed: {
    },
    watch: {
    }
};
</script>
<style scoped lang="less">
.layout {
    width: 100%;
    max-width: 1280px;
    margin: auto;
    margin-top: 1em;
    text-align: center;
    display: flex;
    align-items: center;
}
.loading {
    position: absolute;
    text-align: center;
    margin: auto;
    height: 5em;
    font-size: 2em;
    width: 100%;
    top: 0;
    bottom: 0;
}
.verified {
    position: absolute;
    text-align: center;
    margin: auto;
    height: 6em;
    font-size: 2em;
    width: 100%;
    top: 0;
    bottom: 0;
    font-size: 1.5em;
    .fa {
        font-size: 2em;
    }
}
@media (max-width: 480px) {
}
</style>

<style lang="less">
@media (max-width: 480px) {
}
</style>