const routers = [{
    path: '/',
    meta: {
        title: 'Home'
    },
    component: () => import('../views/index'),
    async beforeRouteEnter(to, from, next) {
        if (to.meta.login && !this.$root.isLogin) {
            this.$router.replace('/login');
        }
    },
    children: [
        {
            path: '',
            meta: {
                title: 'Home'
            },
            component: () => import('../views/home')
        },
        {
            path: 'editor',
            meta: {
                title: 'Editor'
            },
            component: () => import('../views/editor')
        },
        {
            path: 'setting',
            meta: {
                title: 'Setting',
                login: true
            },
            component: () => import('../views/setting')
        },
        {
            path: 'setting/:menu',
            meta: {
                title: 'Setting',
                login: true
            },
            component: () => import('../views/setting')
        },
        {
            path: 'u/:user',
            meta: {
                title: 'User',
                notitle: true
            },
            component: () => import('../views/user')
        },
        {
            path: 'u/:user/:type/:page',
            meta: {
                title: 'User',
                notitle: true
            },
            component: () => import('../views/user')
        },
        {
            path: ':username/verification/:token',
            meta: {
                title: 'Verify Email',
                notitle: true
            },
            component: () => import('../views/verify')
        },
        {
            path: 'u/:user/:type',
            meta: {
                title: 'User',
                notitle: true
            },
            component: () => import('../views/user')
        }, {
            path: 'edit/:id',
            meta: {
                title: 'Edit Snippet',
                login: true
            },
            component: () => import('../components/editor')
        }, {
            path: '/s/:id',
            meta: {
                title: 'Snippet',
                notitle: true
            },
            component: () => import('../views/snippet')
        }, {
            path: '/s/:id/:type',
            meta: {
                title: 'Snippet',
                notitle: true
            },
            component: () => import('../views/snippet')
        }, {
            path: '/s/:id/:type/:page',
            meta: {
                title: 'Snippet',
                notitle: true
            },
            component: () => import('../views/snippet')
        }, {
            path: '/explore',
            meta: {
                title: 'Explore'
            },
            component: () => import('../views/explore')
        }
    ]
}, {
    path: '/login',
    meta: {
        title: 'Login'
    },
    component: () => import('../views/login'),
    async beforeRouteEnter(to, from, next) {
        console.log(to)
    }
}, {
    path: '/register',
    meta: {
        title: 'Register'
    },
    component: () => import('../views/login')
}, {
    path: '/embed/:id',
    meta: {
        title: 'Embed'
    },
    component: () => import('../views/embed')
},{
    path: '*',
    redirect: '/'
}];
export default routers;