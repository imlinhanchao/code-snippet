<template>
<article class="layout">
    <section v-for="(s, i) in snippets" v-bind:key="i" :id="`snippet${i}`">
        <header>
            <div class="info">
                <h1>
                    <FileIcon class="icon" :filename="s.codes[0].filename"></FileIcon>
                    <router-link :to="`/u/${s.username}`">{{s.username}}</router-link> <span> / </span>
                    <router-link :to="`/s/${s.id}`">{{s.codes[0].filename}}</router-link>
                    <aside>
                        <p>Created at {{new Date(s.create_time * 1000).toLocaleString()}}</p>
                        <p>{{s.description}}</p>
                    </aside>
                </h1>
            </div>
            <Statistics :snippet="s" ></Statistics>              
        </header>
        <section>
            <section class="code">
                <section class="code-content">
                    <pre v-hljs="s.codes[0].content"><code></code></pre>
                </section>
            </section>
        </section>
    </section>
</article>
</template>

<script>
import Statistics from '../components/statistics'
export default {
    components: {
        Statistics,
    },
    props: {
        snippets: {
            default: []
        }
    }
}
</script>

<style lang="less" scoped>
.layout {
    width: 100%;
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
        img {
            width: 2.5em;
            height: 2.5em;
            display: inline-block;
            padding: 5px;
            vertical-align: top;
            border-radius: 50%;
        }
        h1 {
            font-size: .8em;
            font-weight: normal;
            vertical-align: top;
            text-overflow: ellipsis;
            overflow: hidden;
            aside {
                color: #666;
                font-size: .8em;
            }
        }
    }
    .code {
        margin: .5em 0 2em;
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
            border-radius: 6px;
            border: 1px solid #515a6e;
            overflow: hidden;
        }
    }
}
</style>