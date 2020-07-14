const { createProxyMiddleware } = require('http-proxy-middleware');
const Bundler = require('parcel-bundler');
const express = require('express');
const net = require('net');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync(path.join(__dirname, 'config.json'))) {
    console.info('[Info] Please execute `npm run init` to initialization config.')
    process.exit(0);
}

const config = require('./config.json');
let port = Number(process.env.PORT || 8080);

const bundler = new Bundler('frontend/index.html', {
    cache: false
})

function portIsOccupied(port, cb = (err, port) => {}) {
    const server = net.createServer().listen(port)
    server.on('listening', () => {
        server.close()
        cb(null, port)
    })

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            portIsOccupied(port + 1, cb)
        } else {
            cb(err)
        }
    })

}

const app = express();

app.use(
    '/api',
    createProxyMiddleware({
        target: `http://localhost:${config.base.port}`
    })
);
app.use(
    '/img',
    createProxyMiddleware({
        target: `http://localhost:${config.base.port}`
    })
);
app.use(
    '/upload',
    createProxyMiddleware({
        target: `http://localhost:${config.base.port}`
    })
);

app.use(bundler.middleware());

let cmd;
if (process.platform == 'win32') {
    cmd = 'explorer';
} else if (process.platform == 'linux') {
    cmd = 'xdg-open';
} else if (process.platform == 'darwin') {
    cmd = 'open';
}

portIsOccupied(port, (err, port) => {
    console.log(`\rLaunch http://localhost:${port} .`)
    app.listen(port, () => {
        let url = 'http://localhost:' + port;
        require('child_process').exec(`${cmd} "${url}"`);
    });
});