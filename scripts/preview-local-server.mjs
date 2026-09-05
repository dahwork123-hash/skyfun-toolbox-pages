import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const preferred = Number(process.argv[2] || 8787);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('Cannot find index.html in:', root);
  process.exit(1);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const rel = decoded.replace(/^\/+/, '') || 'index.html';
  const abs = path.normalize(path.join(root, rel));
  const rootLower = root.toLowerCase();
  if (!abs.toLowerCase().startsWith(rootLower)) return null;
  return abs;
}

function openBrowser(url) {
  if (process.platform === 'win32') {
    exec(`start "" "${url}"`, { shell: true });
  } else if (process.platform === 'darwin') {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

function listen(port) {
  const server = http.createServer((req, res) => {
    const target = safePath(req.url || '/');
    if (!target) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    fs.stat(target, (err, stat) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      let file = target;
      if (stat.isDirectory()) file = path.join(target, 'index.html');

      fs.readFile(file, (readErr, data) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        const ext = path.extname(file).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        res.end(data);
      });
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const next = port + 1;
      if (next <= port + 20) {
        console.log(`Port ${port} busy, trying ${next}...`);
        listen(next);
        return;
      }
    }
    console.error('Server error:', err.message);
    process.exit(1);
  });

  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}/index.html`;
    console.log(`Serving ${root}`);
    console.log(`Open ${url}`);
    console.log('Press Ctrl+C to stop.');
    openBrowser(url);
  });
}

listen(preferred);
