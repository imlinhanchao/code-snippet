<template>
  <div class="statistics">
        <Icon class="statistics-menu" custom="fa fa-ellipsis-v" @click="menu = !menu"></Icon>
        <i class="fa fa-caret-up triangle" v-if="menu"></i>
        <ul class="statistics-list" :class="{'statistics-list-hide': !menu}">
            <li>
                <router-link :to="`/s/${snippet.id}`" class="count">
                    <Icon custom="fa fa-file-o" ></Icon> <span> {{snippet.codes.length}} </span> <span class="text">file{{snippet.codes.length > 1 ? 's' : ''}}</span>
                </router-link>
            </li>
            <li>
                <router-link :to="`/s/${snippet.id}/forks`" class="count">
                    <Icon custom="fa fa-code-fork" ></Icon> <span> {{snippet.forks}} </span> <span class="text">fork{{snippet.forks > 1 ? 's' : ''}}</span>
                </router-link>
            </li>
            <li>
                <router-link :to="`/s/${snippet.id}#comment`" class="count">
                    <Icon type="md-chatboxes" ></Icon> <span> {{snippet.comments}} </span> <span class="text">comment{{snippet.comments > 1 ? 's' : ''}}</span>
                </router-link>
            </li>
            <li>
                <router-link :to="`/s/${snippet.id}/star`" class="count">
                    <Icon custom="fa fa-star-o" v-if="!snippet.stared" ></Icon>
                    <Icon custom="fa fa-star" v-if="snippet.stared" ></Icon> 
                    <span> {{snippet.stars}} </span> <span class="text">star{{snippet.stars > 1 ? 's' : ''}}</span>
                </router-link>
            </li>
        </ul>
    </div>  
</template>

<script>
export default {
    props: {
        snippet: {
            default: {
                id: '',
                title: '',
                description: '',
                private: false,
                language: '',
                command: '',
                execute: false,
                input: '',
                fork_from: '',
                username: '',
                codes: []
            }
        }
    },
    data() {
        return {
            menu: false
        }
    }
}
</script>

<style lang="less" scoped>
.statistics {
    display: flex;
    align-items: center;
    .statistics-menu {
        display: none;
    }
    .statistics-list {
        list-style: none;
        display: flex;
        padding: 0;
        margin: 0;
        flex-direction: row;
    }
    .count {
        display: inline-block;
        padding: 0 .5em;
        .ivu-icon {
            padding: 0 .2em;
        }
        >* {
            vertical-align: middle;
        }
    }
}
@media (max-width: 480px) {
    .statistics {
        position: relative;
        .statistics-menu {
            display: inline-block;
        }
        .triangle {
            position: absolute;
            top: 29px;
            right: -4px;
            color: #181a1b;
            text-shadow: 0 -1px 0px #3a404d;
            font-size: 1.5em;
            z-index: 110;
        }
        .statistics-list {
            position: absolute;
            flex-direction: column;
            right: -15px;
            background: #181a1b;
            border: 1px solid #515a6e;
            top: 41px;
            color: #f0f0f0;
            border-radius: 3px;
            li {
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                .text {
                    display: none;
                }
                .count {
                    display: flex;
                    flex-direction: row-reverse;
                    align-items: center;
                }
                .ivu-icon {
                    display: inline-block;
                    width: 1.5em;
                    text-align: center;
                }
            }
        }
        .statistics-list-hide {
            display: none
        }
    }
}
</style>