const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8'
};

const SITE_DIR = fs.existsSync(path.join(BASE_DIR, 'fathimath.com')) ? 'fathimath.com' : 'bermawy.com';

function resolveFilePath(reqUrl) {
    let cleanPath = decodeURIComponent(reqUrl.split('?')[0]);
    if (cleanPath === '/' || cleanPath === '/index.html') {
        return path.join(BASE_DIR, SITE_DIR, 'index.html');
    }

    // Direct path relative to BASE_DIR
    let candidate = path.join(BASE_DIR, cleanPath);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
    }

    // Inside SITE_DIR (e.g. fathimath.com)
    let siteCandidate = path.join(BASE_DIR, SITE_DIR, cleanPath);
    if (fs.existsSync(siteCandidate) && fs.statSync(siteCandidate).isFile()) {
        return siteCandidate;
    }

    // Fallback inside bermawy.com
    if (SITE_DIR !== 'bermawy.com') {
        let bermawyCandidate = path.join(BASE_DIR, 'bermawy.com', cleanPath);
        if (fs.existsSync(bermawyCandidate) && fs.statSync(bermawyCandidate).isFile()) {
            return bermawyCandidate;
        }
    }

    // Check with .html appended
    if (fs.existsSync(candidate + '.html') && fs.statSync(candidate + '.html').isFile()) {
        return candidate + '.html';
    }
    if (fs.existsSync(siteCandidate + '.html') && fs.statSync(siteCandidate + '.html').isFile()) {
        return siteCandidate + '.html';
    }
    if (SITE_DIR !== 'bermawy.com') {
        let bermawyCandidate = path.join(BASE_DIR, 'bermawy.com', cleanPath);
        if (fs.existsSync(bermawyCandidate + '.html') && fs.statSync(bermawyCandidate + '.html').isFile()) {
            return bermawyCandidate + '.html';
        }
    }

    return null;
}

const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const filePath = resolveFilePath(req.url);

    if (!filePath) {
        // Fallback for single page navigation or 404
        const fallback = path.join(BASE_DIR, SITE_DIR, 'index.html');
        if (fs.existsSync(fallback)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            fs.createReadStream(fallback).pipe(res);
            return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
