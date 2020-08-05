var express = require('express');
var router = express.Router();
const Snippet = require('../interface/snippet');
const Code = require('../interface/code');
const mime = require('mime-types');
const config = require('../config');

router.get('/:id/:file', async function (req, res, next) {
    if (req.hostname != config.base.preview_domain) {
        return next();
    }

    let snippet = new Snippet(req.session);
    let data = await snippet.query({
        query: { id: [req.params.id] }, count: 1, index: 0
    }, true);
    if (data.total == 0) return res.status(404).send('404 not found');
        
    let code = new Code(req.session);
    let file = await code.query({
        query: { snippet: req.params.id, filename: req.params.file },
        count: 1, index: 0
    }, true);
    if (file.total == 0) return res.status(404).send('404 not found');

    file = file.data[0];
    let contentType = mime.lookup(file.filename) || 'text/plain';
    res.header('Content-Type', `${contentType}; charset=utf-8`);
    res.end(file.content);
});

module.exports = router;
