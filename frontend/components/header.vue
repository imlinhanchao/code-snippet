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
                <Tooltip :content="$t('developing')"><Button type="text" class="icon-btn"><Icon custom="fa fa-bell-o" /></Button></Tooltip>
                <Button type="text" class="icon-btn" @click="$router.push('/')"><Icon custom="fa fa-plus" /></Button>
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
    methods: {

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
    .notice i{
        color: #2196F3;
        text-shadow: 0 0 2px #607D8B;
        &:before {
            content: "\f0f3";
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

@media (max-width: 480px) {
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