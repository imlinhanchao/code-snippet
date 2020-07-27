import axios from 'axios';

var state = {
};
const mutations = {
};
const actions = {
    async create({ state, commit }, snippet) {
        try {
            let rsp = await axios.post('/fav/new', { snippet });

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async get({ state, commit }, id) {
        try {
            let rsp = await axios.get(`/fav/get/${id}`);

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async del({ state, commit }, snippet) {
        try {
            let rsp = await axios.post(`/fav/del/`, { snippet });

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async query({ commit }, { index, count = 10, query = {}}) {
        try {
            let rsp = await axios.post('/fav/query/', {
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
};
export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};