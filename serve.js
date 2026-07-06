const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = 'C:\\div4';

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/magnet-link-bms.html' : req.url.split('?')[0];
  const fp = path.join(ROOT, urlPath.replace(/\//g, path.sep));
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + fp); return; }
    const ext = path.extname(fp).toLowerCase();
    const ct  = ext === '.html' ? 'text/html; charset=utf-8'
              : ext === '.js'   ? 'application/javascript'
              : ext === '.css'  ? 'text/css'
              : ext === '.json' ? 'application/json'
              : ext === '.png'  ? 'image/png'
              : 'text/plain';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running at http://localhost:3000');
});
