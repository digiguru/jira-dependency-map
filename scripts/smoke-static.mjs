import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const routes = new Map([
  ['/', 'index.html'],
  ['/app.mjs', 'app.mjs'],
  ['/mock-jira-data.tsv', 'mock-jira-data.tsv'],
  ['/core/toDot.mjs', 'core/toDot.mjs'],
  ['/core/remapper.mjs', 'core/remapper.mjs'],
  ['/web/spreadsheetParser.mjs', 'web/spreadsheetParser.mjs'],
  ['/vendor/viz/viz.js', 'vendor/viz/viz.js'],
]);

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  const relativePath = routes.get(pathname);
  if (!relativePath) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  try {
    response.writeHead(200);
    response.end(await readFile(join(distDir, relativePath)));
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end('Unable to read built asset');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Unable to determine smoke-test server address.');
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  for (const pathname of routes.keys()) {
    const response = await fetch(`${baseUrl}${pathname}`);
    const body = await response.text();
    if (!response.ok) throw new Error(`${pathname} returned ${response.status}`);
    if (!body.length) throw new Error(`${pathname} returned an empty response`);
    if (pathname === '/' && !body.includes('Render graph')) throw new Error('Homepage is missing graph controls.');
    if (pathname === '/app.mjs' && !body.includes("from '/core/toDot.mjs'")) throw new Error('Web demo is not wired to the CLI toDot module.');
  }
  console.log('CLI-backed static demo smoke test passed.');
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}
