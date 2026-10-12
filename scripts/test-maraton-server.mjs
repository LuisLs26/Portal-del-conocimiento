import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const output = path.resolve('node_modules/.cache/maraton-fixture.mjs');
await build({ entryPoints:['tests/maraton/fixture.ts'], outfile:output, bundle:true, platform:'node', format:'esm', packages:'external' });
const { raceServer } = await import(pathToFileURL(output).href);
const server = await raceServer(8787);
console.log(`Servidor local de prueba: ${server.url}`);
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, async()=>{ await server.close(); process.exit(0); });
