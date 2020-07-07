import config from '../config.json'

let util = {
    title(title) {
        title = title ? title + ' - ' + config.base.name: config.base.name;
        window.document.title = title;
    }
};


export default util;