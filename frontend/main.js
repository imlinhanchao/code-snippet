import Vue from 'vue'
import Vuex from 'vuex';
import App from './app.vue'
import iView from 'iview';
import VueRouter from 'vue-router';
import Routers from './router';
import store from './store';
import Util from './util';
import VueHighlightJS from 'vue-highlightjs';
import 'iview/dist/styles/iview.css';
import './theme/index.less';
import 'highlight.js/styles/github-gist.css'
import axios from 'axios';
import config from '../config.json'

const isDebug = process.env.NODE_ENV !== 'production';
Vue.config.debug = isDebug;
Vue.config.devtools = isDebug;
Vue.config.productionTip = isDebug;

// axios config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '/api/';
Vue.prototype.$axios = axios;
Vue.prototype.$util = Util;

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(iView)
Vue.use(VueHighlightJS);

// Router config
const RouterConfig = {
    mode: 'history',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
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

CodeMirror.modeURL = 'https://libs.cdnjs.net/codemirror/5.55.0/mode/%N/%N.min.js';

new Vue({
    el: '#app',
    router,
    store,
    data: {
        msg: {
            type: 0,
            content: '',
            _title: '',
            get name() {
                return ['info', 'success', 'warning', 'error'][this.type]
            },
            get title() {
                return this._title === '' ? ['Notice:', 'Success:', 'Warning:', 'Error:'][this.type] : this._title
            },
        },
        editorOptions: {
            tabSize: 4,
            indentUnit: 4,
            mode: 'clike',
            theme: 'github',
            lineNumbers: true,
            lineWrapping: true,
            indentWithTabs: true,
            cursorHeight: .7
        }
    },
    render: h => h(App),
    methods: {
        message(type, content, title='') {
            this.msg.type = type;
            this.msg.content = content;
            this.msg._title = title;
            this.$router.replace('#');
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
        getCodeMode(ext) {
            return CodeMirror.findModeByExtension(ext) || CodeMirror.findModeByExtension('text');
        },
        getCodeExt(f) {
            return f.filename.split('.').slice(-1).join('');
        },
        getCodeOptions(f, readOnly=false) {
            return Object.assign(this.editorOptions, {
                mode: this.getCodeMode(this.getCodeExt(f)).mime,
                readOnly
            })
        }
    },
    computed: {
        maxSize() {
            return config.file.maxSize * 1024;
        },
        uploadInterface() {
            return '/api/lib/upload';
        },
        loginUser() {
            return this.isLogin ? this.$store.getters['account/info'] : {};
        },
        name() {
            return this.loginUser ? this.loginUser.nickname : '';
        },
        isLogin() {
            return this.$store.getters['account/isLogin'];
        },
    }
});