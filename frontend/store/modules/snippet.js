import axios from 'axios';
import langs from '../../../langs.json'

var state = {
    langs
};
const mutations = {
};
const actions = {
    async create({ state, commit }, snippt) {
        try {
            let rsp = await axios.post('/snippet/new', snippt);

            return rsp.data;
        } catch (e) {
            console.error(error.message);
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