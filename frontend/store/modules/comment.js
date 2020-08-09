import axios from 'axios';

var state = {
};
const mutations = {
};
const actions = {
    async create({ state, commit }, comment) {
        try {
            let rsp = await axios.post('/comment/new', comment);

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async update({ state, commit }, comment) {
        try {
            let rsp = await axios.post('/comment/set', comment);

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async get({ state, commit }, id) {
        try {
            let rsp = await axios.get(`/comment/get/${id}`);

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async del({ state, commit }, id) {
        try {
            let rsp = await axios.post(`/comment/del/`, { id });

            return rsp.data;
        } catch (e) {
            console.error(e.message);
            throw e;
        }
    },
    async query({ commit }, { index, count = 10, query = {}, order}) {
        try {
            let rsp = await axios.post('/comment/query/', {
                index, count, query, order
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