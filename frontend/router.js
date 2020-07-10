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
        title: 'Home'
    },
    component: () => import('./components/login')
},{
    path: '*',
    redirect: '/'
}];
export default routers;