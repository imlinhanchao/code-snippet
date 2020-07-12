import axios from 'axios';
import langs from '../../../langs.json'

var state = {
    langs
};
const mutations = {
};
const actions = {

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