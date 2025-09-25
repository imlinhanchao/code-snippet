<template>
    <Header class="layout-header">
        <article class="layout-menu">
            <section class="layout-logo">
                <router-link to="/">
                    <img src="../assets/logo.png" alt="" />
                    <span class="title">Code Snippet</span>
                </router-link>
            </section>
            <nav class="layout-nav">
                <ul>
                    <li class="nav-home"><router-link to="/">{{$t('home')}}</router-link></li>
                    <li v-if="$root.isLogin" ><router-link to="/explore">{{$t('explore')}}</router-link></li>
                </ul>
            </nav>
        </article>
        <section class="layout-info" v-if="$root.isLogin">
            <span class="avatar">
                <img :src="$root.fileUrl($root.loginUser.avatar, '/res/user.png')" />
                <ul class="sub-menu">
                    <li><router-link :to="`/u/${$root.loginUser.username}`">{{$t('my_code')}}</router-link></li>
                    <li><router-link :to="`/u/${$root.loginUser.username}/star`">{{$t('my_star')}}</router-link></li>
                    <li><router-link :to="`/u/${$root.loginUser.username}/fork`">{{$t('my_fork')}}</router-link></li>
                    <li class="divider"></li>
                    <li><router-link to="/setting">{{$t('setting')}}</router-link></li>
                    <li><router-link to="/login">{{$t('logout')}}</router-link></li>
                </ul>
            </span>
            <span class="menu">
                <Poptip placement="bottom" width="200" transfer  v-model="noticeVisible" popper-class="notice-poptip">
                    <span>
                        <Button type="text" class="icon-btn">
                            <Badge dot :count="unreaded.length">
                                <Icon custom="fa fa-bell-o" />
                            </Badge>
                        </Button>
                    </span>
                    <section slot="content" class="notice">
                        <p v-if="activities.length == 0">{{$t('no_notice')}}</p>
                        <ul v-else>
                            <li v-for="(item, index) in activities" :key="index" class="notice-item">
                                <span class="notice-content">
                                    <router-link :to="`/u/${item.username}`" :title="item.username">
                                        {{item.username}}
                                    </router-link>
                                    {{ item.type == 3 ? $t('comment_your_snippet') : $t('reply_your_comment')}}
                                </span>
                                <Badge dot :count="item.readed ? 0 : 1" class="small">
                                    <a href="javascript:void(0)" @click.prevent.stop="readNotice(item)">{{$t('check')}}</a>
                                </Badge>
                            </li>
                        </ul>
                        <section class="notice-read-all">
                            <a href="javascript:void(0)" @click="readAll">{{$t('read_all')}}</a>
                        </section>
                    </section>
                </Poptip>
                <Tooltip :content="$t('new_snippet')">
                    <Button type="text" class="icon-btn" @click="$router.push('/editor')"><Icon custom="fa fa-plus" /></Button>
                </Tooltip>
            </span>
        </section>
        <section class="layout-info" v-if="!$root.isLogin">
            <span class="menu">
                <router-link to="/login"><Button type="text" class="text-btn">{{$t('login')}}</Button></router-link>
                <router-link to="/register"><Button type="default" ghost class="text-btn">{{$t('register')}}</Button></router-link>
            </span>
        </section>
    </Header>
</template>

<script>
export default {
    data() {
        return {
            activities: [],
            loading: false,
            total: 0,
            noticeVisible: false,
            type: [3, 4] // 3: comment, 4: reply
        }
    },
    mounted() {
        if (this.$root.isLogin) {
            this.getNotice();
        }
    },
    watch: {
        isLogin(val) {
            if (val) {
                this.getNotice();
            } else {
                this.activities = [];
            }
        }
    },
    computed: {
        isLogin() {
            return this.$root.isLogin;
        },
        unreaded() {
            return this.activities.filter(a => !a.readed);
        }
    },
    methods: {
        async getNotice() {
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
        },
        readNotice(activity) {
            if (activity.readed) {
                return;
            }
            this.$store.dispatch('account/makeReaded', {
                id: activity.id
            }).then((rsp) => {
                if (rsp.state != 0) {
                    this.$Message.error(rsp.msg || 'Something Wrong...');
                    return;
                }
                activity.readed = true;
                this.noticeVisible = false;
            });
            this.$router.push(`/s/${activity.snippet}#comment${activity.source.id}`);
        },
        readAll() {
            const unreaded = this.unreaded;
            if (unreaded.length == 0) {
                return;
            }
            this.$store.dispatch('account/makeReaded', {}).then((rsp) => {
                if (rsp.state != 0) {
                    this.$Message.error(rsp.msg || 'Something Wrong...');
                    return;
                }
                this.activities.forEach(a => {
                    this.$set(a, 'readed', true);
                });
                this.noticeVisible = false;
            });
        }
    }
}
</script>

<style scoped lang="less">
.layout-header {
    display: flex;
    justify-content: space-between;
    position: relative;
    padding: 0 1em;
    background: #24292e;
    color: #FFF;
}
.layout-menu {
    display: flex;
    justify-content: start;
}
.layout-logo {
    display: flex;
    align-items: center;
    text-align: left;
    font-size: 1.8em;
    font-weight: 500;
    padding-right: 1.5em;
    a { 
        color: inherit;
        vertical-align: middle;
    }
    img {
        width: 1.5em;
        vertical-align: middle;
    }
    span {
        vertical-align: middle;
    }
}
.layout-nav {
    flex: 1;
    line-height: 4;
    display: flex;
    li {
        vertical-align: middle;
        display: inline-block;
        font-weight: thin;
        margin: 0 .5em;
        :hover {
            font-weight: bold;
        }
        a {
            vertical-align: middle;
            color: inherit;
        }
    }
}
.layout-info {
    display: flex;
    flex-direction: row-reverse;
    .avatar {
        margin: 0 .8em;
        display: inline-block;
        cursor: pointer;
        img {
            position: relative;
            z-index: 30;
            width: 2em;
            height: 2em;
            vertical-align: middle;
            background: #FFF;
            border-radius: 50%;
            padding: 1px;
        }
    }
    .menu {
        position: relative;
        z-index: 30;
        translate: color .5s;
    }
    .notice{
        i{
            color: #2196F3;
            text-shadow: 0 0 2px #607D8B;
            &:before {
                content: "\f0f3";
            }
        }
    } 
    .icon-btn, .text-btn {
        color: inherit;
        padding: 0;
        background: transparent;
        margin: 0 .5em;
    }
    .text-btn {
        font-size: 1em;
        margin: 0 .1em;
        padding: 5px 15px 6px;
    }
    .fa {
        font-size: 150%;
    }
}
.avatar {
    position: relative;
    &:hover {
        .sub-menu {
            right: -.8em;
        }
        +.menu {
            color: #cecac3;;
        }
    }
    .sub-menu {
        list-style: none;
        color: #e8e6e3;;
        position: absolute;
        top: .5em;
        right: -20em;
        width: 8em;
        background: #181a1b;;
        border: 1px solid #CCC;
        border-radius: 0.5em;
        padding: 3em 0 1em;
        z-index: 20;
        transition: right .5s ease;
        li {
            line-height: 2;
            a {
                padding: 0 1em;
                display: inline-block;
                width: 100%;
                transition: all 0.3s ease;
                &:hover {
                    background: #0366d6;
                    color: #FFF;
                }
            }
        }
        .divider {
            height: 0px;
            padding: 0;
            margin: .5em 0;
            border-bottom: 1px solid #CCC;
        }
    }
}

.notice {
    padding-bottom: 2em;
}

.notice-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .notice-content {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        padding-right: 3px;
        flex: 1;
        a {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
    }
}

.notice-read-all {
    border-top: 1px dashed currentColor;
    position: absolute;
    padding: .5em 0 .8em;
    text-align: center;
    bottom: 0; left: 0; right: 0;
    color: #555657;
}

@media (max-width: 600px) {
    .title, li.nav-home {
        display: none;
    }
    .layout-logo {
        padding-right: .5em;
    }
    .layout-nav {
        color: #FFF;
        li {
            font-weight: bold;
        }
        &:before{
            content: '|'
        }
    }
}
</style>