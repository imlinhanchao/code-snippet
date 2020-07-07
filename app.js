let express = require('express');
let fs = require('fs');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let robots = require('express-robots');
let FileStore = require('session-file-store')(session);
let partials = require('express-partials');
let files = require('./lib/files');

if (!fs.existsSync(path.join(__dirname, 'config.json'))) {
    console.info('[Info] Please execute `npm run init` to initialization config.')
    process.exit(0);
}

let api = require('./routes/api');
let config = require('./config');

let app = express();

files.mkdir(path.join(__dirname, 'public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(robots({ UserAgent: '*', Disallow: '/' }));
app.use(favicon(path.join(__dirname, 'frontend', 'assets', 'favicon.ico')));
app.use(partials());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name: config.base.identityKey,
    secret: config.base.secret,
    store: new FileStore(),
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60 * 60 * 24 * 1000 * 365  // 有效期，单位是毫秒
    }
}));

app.use('/api', api);

// 其他页面交给vue处理
app.use(function (req, res/*, next*/) {
    res.sendfile('public/index.html');
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;