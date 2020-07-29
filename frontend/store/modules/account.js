import axios from 'axios';

var state = {
    loginUser: null
};
const mutations = {
    setLoginUser(state, user) {
        state.loginUser = user;
    }
};
const actions = {
    async login({ state, commit }, user) {
        try {
            let rsp = await axios.post('/account/login', user);
            rsp = rsp.data;
            if (rsp.state == 0) {
                commit('setLoginUser', rsp.data);
            }
            return rsp;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    },
    async logout({ commit }) {
        try {
            let rsp = await axios.get('/account/logout')
            rsp = rsp.data;
            if (rsp.state == 0) {
                commit('setLoginUser', null);
            }
            return rsp;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    },
    async checklogin({ commit }) {
        try {
            let rsp = await axios.get('/account/info')
            rsp = rsp.data;
            if (rsp.state == 0) {
                commit('setLoginUser', rsp.data);
            }
            return rsp;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    },
    async getInfo({ commit }, username) {
        try {
            let rsp = await axios.post('/account/query', { username: [ username ] })
            rsp = rsp.data;
            return rsp;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    },
    async query({ commit }, query) {
        try {
            let rsp = await axios.post('/account/query', query)
            rsp = rsp.data;
            return rsp;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    },
    async exist({ commit }, { username, other }) {
        try {
            if (username) {
                let rsp = await axios.get('/account/exist/' + username)
                rsp = rsp.data;
                return rsp;
            } else if(other) {
                let rsp = await axios.post('/account/exists/', other)
                rsp = rsp.data;
                return rsp;
            }
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    },
    async set({ commit }, info) {
        try {
            let rsp = await axios.post('/account/update', info)
            rsp = rsp.data;
            if (rsp.state == 0) {
                commit('setLoginUser', rsp.data);
            }
            return rsp;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    },
    async create({ state, commit }, user) {
        try {
            let rsp = await axios.post('/account/create', user)
            rsp = rsp.data;
            return rsp;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }
};
const getters = {
    isLogin: (state) => {
        return !!state.loginUser;
    },
    info: (state) => {
        return state.loginUser;
    }
};
export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};