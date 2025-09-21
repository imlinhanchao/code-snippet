import './vendors'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import Vuex from 'vuex';
import App from './app.vue'
import iView from 'iview';
import VueRouter from 'vue-router';
import Routers from './router/index';
import store from './store';
import Util from './util';
import VueHljs from 'vue-hljs-with-line-number';
import 'iview/dist/styles/iview.css';
import 'highlight.js/styles/atom-one-dark.css';
import 'vue-hljs-with-line-number/line-number.css';
import 'mavon-editor/dist/css/index.css'
import axios from 'axios';
import config from '../config.json'
import InfiniteScroll from 'vue-infinite-scroll'
import locale from 'iview/dist/locale/en-US';
import VueClipboard from 'vue-clipboard2';
import 'mavon-editor/dist/markdown/github-markdown.min.css'
import mavonEditor from 'mavon-editor'
import uweb from 'vue-uweb'
import './theme/index.less';
import VueI18n from 'vue-i18n';
import ivuEn from 'iview/dist/locale/en-US';
import ivuZhChs from 'iview/dist/locale/zh-CN';
import ivuZhCht from 'iview/dist/locale/zh-TW';
import en from '../i18n/en.json';
import zhChs from '../i18n/zh-chs.json';
import zhCht from '../i18n/zh-cht.json';
 
VueClipboard.config.autoSetContainer = true // add this line
const isDebug = process.env.NODE_ENV !== 'production';
Vue.config.debug = isDebug;
Vue.config.devtools = isDebug;
Vue.config.productionTip = isDebug;

// axios config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '/api/';
Vue.prototype.$win = window;
Vue.prototype.$uweb = uweb;
Vue.prototype.$axios = axios;
Vue.prototype.$util = Util;
Vue.prototype.$config = config;
Vue.prototype.$markdown = mavonEditor.mavonEditor;
console.dir(mavonEditor.mavonEditor);

Vue.use(mavonEditor)
Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VueHljs);
Vue.use(InfiniteScroll);
Vue.use(VueClipboard)
Vue.use(iView, { locale });
Vue.use(mavonEditor)
Vue.use(uweb, config.base.cnzz);
Vue.use(VueI18n)

// Router config
const RouterConfig = {
    mode: 'history',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    if(!to.meta.notitle) Util.title(to.meta.title);
    if(from.path != '/') uweb.trackPageview(to.path, config.base.domain + from.path);
    next();
});

router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

window.$m = {
    get INFO() { return 0 },
    get SUCCESS() { return 1 },
    get WARN() { return 2 },
    get ERROR() { return 3 },
};

if (location.hostname == config.base.preview_domain) location = config.base.domain + location.pathname;

const messages = {
    en: Object.assign(en, ivuEn),
    zhChs: Object.assign(zhChs, ivuZhChs),
    zhCht: Object.assign(zhCht, ivuZhCht)
};

function getLanguage() {
    let lang = navigator.language || navigator.userLanguage;
    if (lang.indexOf('zh') == 0) {
        switch(lang.toLowerCase()) {
            case 'zh':
            case 'zh-cn':
            case 'zh-chs': return 'zhChs';
            default: return 'zhCht';
        }
    }
    return 'en';
}

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: getLanguage(),  // set locale
    messages  // set locale messages
});

new Vue({
    el: '#app',
    router,
    store,
    i18n,
    data: {
        msg: {
            type: 0,
            content: '',
            _title: '',
            get name() {
                return ['info', 'success', 'warning', 'error'][this.type]
            },
            get title() {
                return this._title === '' ? [i18n.t('msg_notice'), i18n.t('msg_success'), i18n.t('msg_warning'), i18n.t('msg_error')][this.type] : this._title
            },
        }
    },
    render: h => h(App),
    methods: {
        message(type, content, title='', disappear=true) {
            this.msg.type = type;
            this.msg.content = content;
            this.msg._title = title;
            if (type == $m.SUCCESS && disappear) {
                setTimeout(() => this.msg.content = '', 5000);
            }
            window.scrollTo(0, 0);
        },
        fileFormatError(file) {
            this.message($m.WARN,
                `File format of ${file.name} is incorrect, please select jpg or png.`,
                'The file format is incorrect');
        },
        fileMaxSize (file) {
            this.message($m.WARN,
                `File ${file.name} is too large, no more than 2M.`,
                'Exceeding file size limit');
        },
        fileUrl (name, defaults) {
            let img = name.indexOf('http') == 0 ? name : config.file.fileurl + name;
            return name ? img : defaults;
        },
        getCodeExt(f) {
            return f.split('.').slice(-1).join('');
        },
        plsLogin() {
            localStorage.setItem('redirect', this.$route.path);
            this.$router.replace('/login');
        }
    },
    computed: {
        maxSize() {
            return config.file.maxSize * 1024;
        },
        uploadInterface() {
            return '/lib/upload';
        },
        loginUser() {
            return this.isLogin ? this.$store.getters['account/info'] : {};
        },
        name() {
            return this.loginUser ? this.loginUser.nickname : '';
        },
        isLogin() {
            return this.$store.getters['account/isLogin'];
        }
    },
    watch: {
        $route(to, from) {
            console.info(to);
            if (to.path == '/login') {
                localStorage.setItem('redirect', from.path);
            }
        }
    },
    mounted() {
        document.getElementById('loading').style.display = 'none';
        this.$markdown.externalLink = {
            markdown_css: false,
            hljs_js: false,
            hljs_css: false,
            hljs_lang: false,
            katex_css() {
                return 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.11.1/katex.min.css';
            },
            katex_js() {
                return 'https://cdn.bootcdn.net/ajax/libs/KaTeX/0.11.1/katex.min.js';
            },
        };
    }
});