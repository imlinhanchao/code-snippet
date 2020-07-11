<template>
    <Header class="layout-header">
        <article class="layout-menu">
            <section class="layout-logo">
                <router-link to="/">
                    <img src="../assets/logo.png" alt="" />
                    <span class="title">Code Snippit</span>
                </router-link>
            </section>
            <nav class="layout-nav">
                <ul>
                    <li v-if="$root.isLogin" class="nav-home"><router-link to="/">Home</router-link></li>
                    <li><router-link to="/explore">Explore</router-link></li>
                </ul>
            </nav>
        </article>
        <section class="layout-info" v-if="$root.isLogin">
            <span class="avatar">
                <img :src="$root.fileUrl($root.loginUser.avatar, '/img/user.png')" />
                <ul class="sub-menu">
                    <li><router-link :to="`/u/${$root.loginUser.username}`">My Codes</router-link></li>
                    <li><router-link :to="`/u/${$root.loginUser.username}/star`">My Star</router-link></li>
                    <li><router-link :to="`/u/${$root.loginUser.username}/fork`">My Fork</router-link></li>
                    <li class="divider"></li>
                    <li><router-link :to="`/settings`">Setting</router-link></li>
                    <li><router-link :to="`/login`">Sign out</router-link></li>
                </ul>
            </span>
            <span class="menu">
                <Button type="text" class="icon-btn"><Icon custom="fa fa-bell-o" /></Button>
                <Button type="text" class="icon-btn"><Icon custom="fa fa-plus" /></Button>
            </span>
        </section>
        <section class="layout-info" v-if="!$root.isLogin">
            <span class="menu">
                <router-link to="/login"><Button type="text" class="text-btn">Sign in</Button></router-link>
                <router-link to="/register"><Button type="default" ghost class="text-btn">Sign up</Button></router-link>
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
        font-weight: lighter;
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
            right: -.5em;
        }
        +.menu {
            color: #24292e;
        }
    }
    .sub-menu {
        list-style: none;
        color: #000;
        position: absolute;
        top: .7em;
        right: -20em;
        width: 8em;
        background: #FFF;
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