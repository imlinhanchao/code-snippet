const Index = () => import('./views/index')

const routers = [{
    path: '/',
    meta: {
        title: 'Home'
    },
    component: Index,
    props: {
        loginPage: false
    },
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
}, {
    path: '/s/:id',
    meta: {
        title: 'Snippet'
    },
    component: () => import('./views/snippet')
},{
    path: '*',
    redirect: '/'
}];
export default routers;