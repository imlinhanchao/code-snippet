<template>
    <Layout class="layout">
        <header class="header">
            <h1><Icon custom="fa fa-code" ></Icon> {{$t('explore_snippet')}} </h1>
        </header>
        <Content class="snippet" v-infinite-scroll="loadMore" infinite-scroll-disabled="noMore" infinite-scroll-distance="10">
            <Snippets :snippets="snippets" ></Snippets>
        </Content>
        <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
    </Layout>
</template>
<script>
export default {
    name: "explore",
    components: {
        Snippets: () => import('../components/snippets')
    },
    async mounted() {
        await this.loadSnippet();
    },
    data() {
        return {
            last_data: new Date().getTime(),
            snippets: [],
            total: 0,
            loading: false
        };
    },
    methods: {
        async loadSnippet(query={}) {
            try {
                let count = 10;
                this.loading = true;
                let rsp = await this.$store.dispatch("snippet/query", {
                    query: { create_time: this.last_data, private: false, ...query }, index: 0, count
                });
                this.loading = false;
                if (!rsp || rsp.state != 0) {
                    this.$Message.error(rsp ? rsp.msg : 'Something Wrong...');
                    return;
                }
                if (rsp.data.total == 0) return this.total = 0;
                rsp.data.data.forEach(s => {
                    this.snippets.push(s);
                })
                this.total = rsp.data.total;
                this.last_data = this.snippets[this.snippets.length - 1].create_time
            } catch (error) {
                this.$root.message($m.ERROR, err.message);
                this.loading = false;
            }
        },
        async loadMore() {
            await this.loadSnippet();
            
        }
    },
    computed: {
        noMore() {
            return this.loading || this.total == 0
        }
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
}
.header {
    padding: 0 2em;
    text-align: center;
}
.snippet {
    margin: auto;
    max-width: 900px;
    padding: 1.5em 2em;
    width: 100%;
}
.loading {
    position: relative;
    text-align: center;
}

@media (max-width: 480px) {
}
</style>

<style lang="less">
@media (max-width: 480px) {
}
</style>