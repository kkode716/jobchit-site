// A small static server for tests and PDF builds, shaped like GitHub Pages: the site sits under a path prefix,
// folders redirect to a trailing slash, and missing paths get 404.html with a 404 status.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

export function serve(dir, port = 0, prefix = '/') {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const notFound = async () => {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      res.end(await readFile(join(root, '404.html')).catch(() => 'Not found'));
    };
    if (!pathname.startsWith(prefix)) return notFound();
    let file = resolve(root, '.' + decodeURIComponent(pathname.slice(prefix.length - 1)));
    if (file !== root && !file.startsWith(root + sep)) return notFound();
    try {
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(301, { location: pathname + '/' });
          return res.end();
        }
        file = join(file, 'index.html');
      }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      return notFound();
    }
  });
  return new Promise((done) => server.listen(port, () => done(server)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [dir = '_site', port = '8080', prefix = '/'] = process.argv.slice(2);
  const server = await serve(dir, Number(port), prefix);
  console.log(`Serving ${dir} at http://localhost:${server.address().port}${prefix}`);
}
