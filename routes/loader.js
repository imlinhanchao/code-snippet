const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
const App = modules.app;

function loader(Module) {
    var express = require('express');
    var router = express.Router();
    router.all('/:fn*', function (req, res, next) {
        let fn = req.params.fn;
        if (Module.cache && Module.cache[fn]) {
            res.header('Cache-Control', `public,max-age=${Module.cache[fn]}`);
        }
        next();
    });

    router.post('/:fn', function (req, res) {
        (async () => {
            try {
                let module = new Module(req.session);
                let fn = req.params.fn;
                let ret = null;
                if (module[fn]) ret = await module[fn](Object.assign({}, req.body));
                else if (Module[fn]) ret = await Module[fn](Object.assign({}, req.body));
                else throw (module.error.param);
                if (ret instanceof Buffer) {
                    res.write(ret);
                    res.end();
                } else {
                    res.json(ret);
                }
            } catch (err) {
                return res.json(App.err(err));
            }
        })();
    });

    router.get('/:fn/:param', function (req, res) {
        (async () => {
            try {
                let module = new Module(req.session);
                let fn = req.params.fn;
                let param = req.params.param;
                let ret = null;
                if (module[fn]) ret = await module[fn](param);
                else if (Module[fn]) ret = await Module[fn](param);
                else throw (module.error.param);
                if (ret instanceof Buffer) {
                    res.write(ret);
                    res.end();
                } else {
                    res.json(ret);
                }
            } catch (err) {
                return res.json(App.err(err));
            }
        })();
    });

    router.get('/:fn', function (req, res) {
        (async () => {
            try {
                let module = new Module(req.session);
                let fn = req.params.fn;
                let param = req.query;
                let ret = null;
                if (module[fn]) ret = await module[fn](param);
                else if (Module[fn]) ret = await Module[fn](param);
                else throw (module.error.param);
                if (ret instanceof Buffer) {
                    res.write(ret);
                    res.end();
                } else {
                    res.json(ret);
                }

            } catch (err) {
                return res.json(App.err(err));
            }
        })();
    });
    
    return router;
}
module.exports = loader;