<template>
<article class="snippet-layout">
    <section v-for="(s, i) in snippets" v-bind:key="i" :id="`snippet${i}`">
        <header>
            <div class="info">
                <img v-if="userIcon" :src="s.username == $root.loginUser.username ? $root.fileUrl($root.loginUser.avatar, '/res/user.png') : `/api/account/avatar/${s.username}`" />
                <h1>
                    <FileIcon v-if="fileIcon" class="icon" :filename="s.codes[0].filename"></FileIcon>
                    <router-link :to="`/u/${s.username}`">{{s.username}}</router-link> <span> / </span>
                    <router-link :to="`/s/${s.id}`" :title="s.codes[0].filename">{{s.codes[0].filename}}</router-link>
                </h1>
                <span class="tags">
                    <Icon custom="fa fa-lock isprivate" v-if="s.private" title="Private"></Icon>
                    <Icon custom="fa fa-terminal isexecute" v-if="s.execute" title="Execute" @click="OnExecute(s)"></Icon>
                </span>
            </div>
            <Statistics :snippet="s"></Statistics>              
        </header>
        <section class="aside-info">
            <p v-if="s.fork">fork from <router-link :to="`/s/${s.fork.id}`" :title="`${s.fork.username} / ${s.fork.codes[0].filename}`">{{s.fork.username}} / {{s.fork.codes[0].filename}}</router-link></p>
            <p>Created at <Time :title="new Date(s.create_time * 1000).toLocaleString()" :time="s.create_time"></Time></p>
            <p>{{s.description}}</p>
        </section>
        <section>
            <CodeRender :code="s.codes[0]" :snippet="s" class="code" :max-height="200">
                <router-link :to="`/s/${s.id}`">
                    <p v-if="s.codes.length > 1" title="more" class="more">
                        <Icon type="ios-more"></Icon>
                    </p>
                </router-link>
            </CodeRender>
        </section>
    </section>
    <Execute v-model="executeModal" :snippet="snippet" :codes="snippet.codes" :auto="snippet.command == ''"></Execute>
</article>
</template>

<script>
export default {
    components: {
        Statistics: () => import('./statistics'), 
        FileIcon: () => import('./fileicon'), 
        Action: () => import('./action'), 
        CodeRender: () => import('./coderender'),
        Execute: () => import('./execute'),
    },
    props: {
        snippets: {
            default: []
        },
        fileIcon: {
            type: Boolean,
            default: false
        },
        userIcon: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            executeModal: false,
            snippet: {
                codes: []
            }
        }
    },
    methods: {
        OnExecute(snippet) {
            this.snippet = Object.assign({}, snippet);
            this.executeModal = true;
        }
    }
}
</script>

<style lang="less" scoped>
.snippet-layout {
    width: 100%;
    display: flex;
    flex-direction: column;
    header {
        display: flex;
        justify-content: space-between;
        .statistics {
            font-size: .8em;
            padding-top: 3px;
        }
    }
    .info {
        display: flex;
        font-size: 1.2em;
        flex: 1;
        white-space: nowrap;
        width: 0;
        display: flex;
        align-items: center;
        img {
            width: 2em;
            height: 2em;
            display: inline-block;
            border: 1px solid #FFF;
            vertical-align: top;
            border-radius: 50%;
            background: #FFF;
            margin: 5px;
        }
        h1 {
            font-size: .8em;
            font-weight: normal;
            vertical-align: top;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .tags {
            display: flex;
            align-items: center;
            padding: 0 .3em;
            i {
                margin: 0 .3em;
            }
        }
    }
    .aside-info {
        color: #666;
        font-size: .8em;
        p {
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
    .code {
        margin: .5em 0 2em;
        .more {
            text-align:center;
            &:hover {
                background: #1a1c1e;
            }
        }
    }
}
.isexecute {
    cursor: pointer;
}
</style>