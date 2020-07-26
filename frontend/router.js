const Index = () => import('./views/index')

const routers = [{
    path: '/',
    meta: {
        title: 'Home'
    },
    component: Index,
    children: [
        {
            path: '',
            meta: {
                title: 'Home'
            },
            component: () => import('./views/home')
        },
        {
            path: 'u/:user',
            meta: {
                title: 'User'
            },
            component: () => import('./views/user')
        },
        {
            path: 'u/:user/p/:page',
            meta: {
                title: 'User'
            },
            component: () => import('./views/user')
        }, {
            path: 'edit/:id',
            meta: {
                title: 'Edit Snippet',
                login: true
            },
            component: () => import('./components/editor')
        }, {
            path: '/s/:id',
            meta: {
                title: 'Snippet'
            },
            component: () => import('./views/snippet')
        }, {
            path: '/explore',
            meta: {
                title: 'Explore'
            },
            component: () => import('./views/explore')
        }
    ]
}, {
    path: '/login',
    meta: {
        title: 'Login'
    },
    component: () => import('./views/login')
}, {
    path: '/register',
    meta: {
        title: 'Register'
    },
    component: () => import('./views/login')
},{
    path: '*',
    redirect: '/'
}];
export default routers;