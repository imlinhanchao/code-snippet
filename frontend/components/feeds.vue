<template>
<article class="snippet-layout">
    <section v-for="activity in activities" :key="activity.id" class="activity">
        <section v-if="activity.type == 0 || activity.type == 1 || activity.type == 2">
            <p class="activity-header">
                <img :src="`/api/account/avatar/${activity.username}`" />
                <span class="activity-title">
                    <span>
                        <router-link :to="`/u/${activity.username}`">{{activity.username}}</router-link>
                        <span> {{[$t('created_snippet'), $t('stared_snippet'), $t('forked_snippet')][activity.type]}} </span>
                    </span>
                    <p class="time"><Time :time="activity.create_time"></Time></p>
                </span>
            </p>
            <section class="activity-content">
                <section class="activity-info">
                    <p>
                        <FileIcon class="icon" :filename="activity.description"></FileIcon>
                        <router-link :to="`/u/${activity.username}`">{{activity.username}}</router-link>
                        <span>/</span>
                        <router-link :to="`/s/${activity.source.id}`">{{activity.description}}</router-link>
                    </p>
                    <p class="activity-desc">{{activity.source.description}}</p>
                </section>
                <section class="activity-action">
                    <section>
                        <Button class="action-btn count-btn" @click="OnStar">
                            <Icon custom="fa fa-star-o" v-if="!activity.snippet.stared"></Icon>
                            <Icon custom="fa fa-star" v-if="activity.snippet.stared"></Icon> 
                            <span> {{$t('star')}}</span>
                        </Button><router-link :to="`/s/${activity.source.id}/star`" class="count">{{activity.snippet.stars || 0}}</router-link>
                    </section>
                </section>
            </section>
        </section>
        <section v-if="activity.type == 5">
            <p class="activity-header">
                <img :src="`/api/account/avatar/${activity.username}`" />
                <span class="activity-title">
                    <span>
                        <router-link :to="`/u/${activity.username}`">{{activity.username}}</router-link>
                        <span> {{isCurrentUser(activity) ? $t('followed_you') : $t('followed')}} </span>
                    </span>
                    <p class="time"><Time :time="activity.create_time"></Time></p>
                </span>
            </p>
            <section class="activity-content" v-if="activity.source">
                <section class="activity-info">
                    <p>
                        <img :src="`/api/account/avatar/${activity.source.username}`" />
                        <router-link :to="`/u/${activity.source.username}`">{{activity.source.nickname}}</router-link>
                    </p>
                    <p class="activity-desc">{{activity.source.motto}}</p>
                </section>
                <section class="activity-action">
                    <section>
                        <Button class="action-btn" @click="OnFollow(activity.source)">
                            <span> {{activity.source.isfollow ? $t('cancel_follow') : $t('follow')}}</span>
                        </Button>
                    </section>
                </section>
            </section>
        </section>
    </section>
</article>
</template>

<script>
import CodeRender from './coderender'
export default {
    components: {
        CodeRender,
        FileIcon: () => import('./fileicon'), 
    },
    props: {
        activities: {
            default: []
        },
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
        async OnStar(snippet) {
            try {
                if (!this.$root.isLogin) return this.$root.plsLogin();
                let rsp = await this.$store.dispatch(snippet.stared ? 'fav/del' : 'fav/create', this.snippet.id);
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                snippet.stared = !snippet.stared;
                snippet.stars = (snippet.stars || 0) + (snippet.stared ? 1 : -1);
            } catch (error) {
                console.error(error.message);
                this.$root.message($m.ERROR, error.message);
            }
        },
        onFollow(follow) {
            this.$store.dispatch("account/follow", { target: follow.username, follow: !follow.isfollow }).then(rsp => {
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                this.$set(follow, 'isfollow', !follow.isfollow);
            }).catch(err => {
                this.$root.message($m.ERROR, err.message);
            });
        },
        isCurrentUser(user) {
            return this.$root.isLogin && this.$root.loginUser.username == user.description;
        },
    }
}
</script>

<style lang="less" scoped>
.activity {
    background-color: #0d1117;
    border-radius: 10px;
    border: 1px solid #3d444d;
    padding: 8px;
    margin: 8px;
    .activity-header {
        display: flex;
        align-items: center;
        padding-bottom: 8px;
        margin-bottom: 8px;
        .activity-title {
            flex: 1;
            margin-left: 1em;
            a {
                font-weight: bold;
            }
            .time {
                font-size: .8em;
                color: #8b949e;
                margin-top: .2em;
            }
        }
    }
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
    .activity-content {
        background-color: #151b23;
        padding: 8px 12px;
        border-radius: 10px;
        display: flex;
        justify-content: space-between;
        .activity-info {
            color: white;
            .activity-desc {
                color: #8b949e;
                margin-top: .5em;
            }
        }
    }
}
.count-btn {
    border-radius: 4px 0 0 4px;
    height: 100%;
}
.count {
    font-size: 12px;
    vertical-align: middle;
    display: inline-block;
    border: 1px solid #373c3e;
    border-left: 0;
    padding: 3px 1em 5px;
    border-radius: 0 4px 4px 0;
    height: 100%;
}
</style>