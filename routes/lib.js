var express = require('express');
var svgCaptcha = require('svg-captcha');
var upload = require('multer')();
var router = express.Router();
const modules = require(require('path').resolve(process.cwd(), 'modules.js'));
const App = modules.app;
const Lib = modules.lib;

router.post('/upload', upload.array('file'), (req, res, next) => {
    (async () => {
        try {
            res.json(await (new Lib).upload(req));
        } catch (err) {
            return res.json(App.err(err));
        }
    })();
});

router.get('/captcha', (req, res, next) => {
    let option = req.query;
    // 验证码，有两个属性，text是字符，data是svg代码
    let code = svgCaptcha.create(option);
    // 保存到session,忽略大小写
    req.session['captcha'] = code.text.toLowerCase();
    // 返回数据直接放入页面元素展示即可
    res.header('Content-Type', 'image/svg+xml');
    res.end(code.data);
});

module.exports = router;