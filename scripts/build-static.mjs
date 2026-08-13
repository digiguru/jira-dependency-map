import { cp, mkdir, rm } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const publicDir = new URL('./public/', root);
const distDir = new URL('./dist/', root);
const coreDir = new URL('./core/', distDir);
const webDir = new URL('./web/', distDir);
const vizSource = new URL('./node_modules/@viz-js/viz/dist/', root);
const vizTarget = new URL('./vendor/viz/', distDir);

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(publicDir, distDir, { recursive: true });

await mkdir(coreDir, { recursive: true });
await cp(new URL('./toDot.mjs', root), new URL('./toDot.mjs', coreDir));
await cp(new URL('./remapper.mjs', root), new URL('./remapper.mjs', coreDir));
await cp(new URL('./parse.mjs', root), new URL('./parse.mjs', coreDir));

await mkdir(webDir, { recursive: true });
await cp(new URL('./web/spreadsheetParser.mjs', root), new URL('./spreadsheetParser.mjs', webDir));

await mkdir(vizTarget, { recursive: true });
await cp(vizSource, vizTarget, { recursive: true });

console.log('Built CLI-backed static demo in dist/');
