// AEROLAB Production Static HTTP Server
// Zero-external-dependency server with Gzip/Deflate compression, security headers, caching, and auto port finding
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { exec } = require('child_process');

let PORT = parseInt(process.env.PORT, 10) || 8080;
const IS_DEV = process.env.NODE_ENV === 'development' || process.env.DEV === '1';

// If dist/ exists and not explicitly in dev mode, serve production build
const HAS_DIST = fs.existsSync(path.join(__dirname, 'dist', 'index.html'));
const SERVE_DIR = (!IS_DEV && HAS_DIST) ? path.join(__dirname, 'dist') : __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.js', '.mjs', '.jsx', '.css', '.json', '.svg', '.txt']);

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  // Handle favicon gracefully
  if (reqPath === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Locate file in target directory
  let filePath = path.join(SERVE_DIR, reqPath);

  // Fallback to root or src if in dev mode
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const rootPath = path.join(__dirname, reqPath);
    if (fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
      filePath = rootPath;
    } else {
      const srcPath = path.join(__dirname, 'src', reqPath);
      if (fs.existsSync(srcPath) && fs.statSync(srcPath).isFile()) {
        filePath = srcPath;
      }
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Production Security & Cache Headers
    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Smart Caching Policy - prevent stale scripts during active evaluation
    if (ext === '.html' || ext === '.js' || ext === '.css' || ext === '.json') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=86400';
    }

    // Gzip / Deflate Compression
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const canCompress = COMPRESSIBLE_EXTS.has(ext) && stats.size > 512;

    if (canCompress && /\bgzip\b/.test(acceptEncoding)) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      const raw = fs.createReadStream(filePath);
      raw.pipe(zlib.createGzip()).pipe(res);
    } else if (canCompress && /\bdeflate\b/.test(acceptEncoding)) {
      headers['Content-Encoding'] = 'deflate';
      res.writeHead(200, headers);
      const raw = fs.createReadStream(filePath);
      raw.pipe(zlib.createDeflate()).pipe(res);
    } else {
      headers['Content-Length'] = stats.size;
      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

function startServer(p) {
  server.listen(p, () => {
    const mode = (!IS_DEV && HAS_DIST) ? 'PRODUCTION (Precompiled AOT Bundle)' : 'DEVELOPMENT (Source View)';
    console.log(`\n==============================================================`);
    console.log(` AEROLAB — DRONE FLIGHT CONTROLLER DIGITAL TWIN`);
    console.log(` Mode:         ${mode}`);
    console.log(` Serving From: ${SERVE_DIR}`);
    console.log(` Local URL:    http://localhost:${p}`);
    console.log(`==============================================================\n`);
    console.log(`Press Ctrl+C to stop the station.\n`);

    // Auto-open browser only if not suppressed
    if (!process.env.NO_OPEN && process.env.NODE_ENV !== 'test') {
      const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${startCmd} http://localhost:${p}`, () => {});
    }
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, probing port ${PORT + 1}...`);
    PORT++;
    startServer(PORT);
  } else {
    console.error('Server error:', err);
  }
});

// Graceful Termination
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

if (require.main === module) {
  startServer(PORT);
}

module.exports = { server, startServer, PORT };
