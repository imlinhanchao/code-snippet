import config from '../config.json'

let util = {
    title(title) {
        title = title ? title + ' | ' + config.base.name: config.base.name;
        window.document.title = title;
    },
    open(url) {
        window.open(url);
    },
    format(tpl, data) {
        Object.keys(data).forEach(k => {
            tpl = tpl.replace(new RegExp(`{{${k}}}`, 'g'), data[k]);
        })
        return tpl;
    }
};


export default util;