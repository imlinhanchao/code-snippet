<template>
  <div class="statistics">
        <Icon class="statistics-menu" custom="fa fa-ellipsis-v" @click="menu = !menu"></Icon>
        <ul class="statistics-list" :class="{'statistics-list-hide': !menu}">
            <li>
                <router-link :to="`/s/${snippet.id}`" class="count">
                    <Icon custom="fa fa-file-o" ></Icon> <span> {{snippet.codes.length}} </span> <span class="text">file</span>
                </router-link>
            </li>
            <li>
                <router-link :to="`/s/${snippet.id}/forks`" class="count">
                    <Icon custom="fa fa-code-fork" ></Icon> <span> 0 </span> <span class="text">forks</span>
                </router-link>
            </li>
            <li>
                <router-link :to="`/s/${snippet.id}/comment`" class="count">
                    <Icon custom="fa fa-commenting-o" ></Icon> <span> 0 </span> <span class="text">comments</span>
                </router-link>
            </li>
            <li>
                <router-link :to="`/s/${snippet.id}/stargazers`" class="count">
                    <Icon custom="fa fa-star-o" ></Icon> <span> {{snippet.stars}} </span> <span class="text">stars</span>
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
        .statistics-menu {
            display: inline-block;
        }
        position: relative;
        .statistics-list {
            position: absolute;
            flex-direction: column;
            right: .0;
            background: #FFF;
            border: 1px solid #f0f0f0;
            top: 50%;
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