import axios from 'axios';
import langs from '../../../langs.json'

var state = {
    langs
};
const mutations = {
};
const actions = {
    async create({ state, commit }, snippet) {
        try {
            let rsp = await axios.post('/snippet/new', snippet);

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async update({ state, commit }, snippet) {
        try {
            let rsp = await axios.post('/snippet/set', snippet);

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async get({ state, commit }, id) {
        try {
            let rsp = await axios.get(`/snippet/get/${id}`);

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async del({ state, commit }, id) {
        try {
            let rsp = await axios.post(`/snippet/del/`, { id });

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async query({ commit }, { index, count = 10, query = {}}) {
        try {
            let rsp = await axios.post('/snippet/query/', {
                index, count, query
            });
            rsp = rsp.data;
            return rsp;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    }
};
const getters = {
    langs: (state) => {
        return state.langs;
    }
};
export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};