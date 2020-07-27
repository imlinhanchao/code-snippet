/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */
import account from './account';
import snippet from './snippet';
import fav from './fav';

export default {
    account, snippet, fav
};