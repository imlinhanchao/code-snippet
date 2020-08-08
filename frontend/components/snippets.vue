<template>
<article class="snippet-layout">
    <section v-for="(s, i) in snippets" v-bind:key="i" :id="`snippet${i}`">
        <header>
            <div class="info">
                <img v-if="userIcon" :src="s.username == $root.loginUser.username ? $root.fileUrl($root.loginUser.avatar, '/img/user.png') : `/api/account/avatar/${s.username}`" />
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
            <section class="code">
                <section class="code-header">
                    <section class="filename">{{s.codes[0].filename}}</section>
                    <Action :snippet="s" :code="s.codes[0]"></Action>
                </section>
                <section class="code-content">
                    <pre v-hljs="s.codes[0].content"><code></code></pre>
                </section>
                <router-link :to="`/s/${s.id}`">
                    <p v-if="s.codes.length > 1" title="more" style="text-align:center">
                        <Icon type="ios-more"></Icon>
                    </p>
                </router-link>
            </section>
        </section>
    </section>
    <Execute v-model="executeModal" :snippet="snippet" :codes="snippet.codes" :auto="snippet.command == ''"></Execute>
</article>
</template>

<script>
import Statistics from '../components/statistics'
import FileIcon from '../components/fileicon';
import Action from '../components/action';
import Execute from '../components/execute';
export default {
    components: {
        Statistics, FileIcon, Action, Execute
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
        .code-header {
            background: #1a1c1e;
            padding: .5em;
            border: 1px solid #515a6e;
            border-bottom: 0;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            display: flex;
            justify-content: space-between;
            .filename {
                flex: 1;
                width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        .code-content {
            pre {
                margin: 0;
            }
            code {
                font-size: .8em;
                padding: 0;
                overflow: auto;
                max-height: 19em;
            }
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
            border: 1px solid #515a6e;
            overflow: hidden;
        }
    }
}
.isexecute {
    cursor: pointer;
}
</style>