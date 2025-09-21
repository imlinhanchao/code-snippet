<template>
    <Layout class="layout">
        <header>
            <h1>{{$t("feed")}} </h1>
        </header>
        <Content class="snippet" v-infinite-scroll="loadMore" infinite-scroll-disabled="noMore" infinite-scroll-distance="10">
            <Feeds :activities="activities" ></Feeds>
        </Content>
        <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
    </Layout>
</template>
<script>

export default {
    name: "home",
    components: {
        Feeds: () => import('../components/feeds'), 
    },
    async mounted() {
        let rsp = await this.$store.dispatch('account/checklogin');
        if (!this.$root.isLogin) {
            this.$router.replace('/explore');
        }
        this.load();
    },
    data() {
        return {
            activities: [],
            loading: false,
            total: 0,
            type: [0,1,2,5] // 0: create, 1: star, 2: fork, 5: follow
        };
    },
    watch: {
    },
    computed: {
        noMore() {
            return this.loading || this.total == 0
        }
    },
    methods: {
        async load() {
            this.loading = true;
            const activities = await this.$store.dispatch('account/getActivities', {
                lastTime: this.activities.length > 0 ? this.activities[this.activities.length - 1].create_time : undefined,
                count: 10,
                type: this.type.join(',')
            }).then((rsp) => {
                if (rsp.state != 0) {
                    this.$Message.error(rsp.msg || 'Something Wrong...');
                    return [];
                }
                return rsp.data;
            }).finally(() => {
                this.loading = false;
            });
            this.activities = this.activities.concat(activities);
                this.total = activities.length;
            this.getSnippets();
        },
        setType() {
            this.activities = [];
            this.load();
        },
        async loadMore() {
            await this.load();
        },
        async getSnippets() {
            const snippetIds = this.activities.map(a => a.snippet).filter(s => s && !s.id);
            if (snippetIds.length == 0) return;
            const snippets = await this.$store.dispatch('snippet/query', { index:0, count: snippetIds.length, query: { id: snippetIds } }).then(res => res.data?.data || []);
            this.activities.forEach(a => {
                if (a.snippet && !a.snippet.id) {
                    a.snippet = snippets.find(s => s.id == a.snippet);
                }
            });
        },
    }
};
</script>
<style scoped lang="less">
.layout {
    width: 100%;
    max-width: 986px;
    margin: auto;
    margin-top: 1em;
    header {
        padding: 0 1em;
        display: flex;
        justify-content: space-between;
    }
}
</style>