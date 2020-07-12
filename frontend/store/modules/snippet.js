import axios from 'axios';

var state = {
    langs: [{
        language: 'C',
        icon: '/img/icon/c.svg'
    }, {
        language: 'C#',
        icon: '/img/icon/c-sharp.svg'
    }, {
        language: 'C++',
        icon: '/img/icon/cpp.svg'
    }, {
        language: 'D',
        icon: '/img/icon/d.svg'
    }, {
        language: 'Go',
        icon: '/img/icon/go.svg'
    }, {
        language: 'Java',
        icon: '/img/icon/java.svg'
    }, {
        language: 'Node.js',
        icon: '/img/icon/nodejs.svg'
    }, {
        language: 'Perl',
        icon: '/img/icon/perl.svg'
    }, {
        language: 'Perl6',
        icon: '/img/icon/perl6.svg'
    }, {
        language: 'PHP',
        icon: '/img/icon/php.svg'
    }, {
        language: 'Python',
        icon: '/img/icon/python.svg'
    }, {
        language: 'Ruby',
        icon: '/img/icon/ruby.svg'
    }, {
        language: 'Shell',
        icon: '/img/icon/bash.svg'
    }, {
        language: 'Swift',
        icon: '/img/icon/swift.svg'
    }]
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