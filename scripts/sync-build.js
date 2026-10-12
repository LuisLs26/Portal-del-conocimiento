import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distHtml = path.join(rootDir, 'dist', 'index.source.html');
const distTargetHtml = path.join(rootDir, 'dist', 'index.html');
const rootHtml = path.join(rootDir, 'index.html');
const distAssets = path.join(rootDir, 'dist', 'assets');
const rootAssets = path.join(rootDir, 'assets');

// 1. Ensure dist/index.html is created from dist/index.source.html
if (fs.existsSync(distHtml)) {
  fs.copyFileSync(distHtml, distTargetHtml);
  console.log('✓ Created dist/index.html from dist/index.source.html');
}

// 2. Overwrite root index.html with the compiled production bundle
if (fs.existsSync(distTargetHtml)) {
  fs.copyFileSync(distTargetHtml, rootHtml);
  console.log('✓ Synchronized root index.html with compiled production bundle');
}

// 3. Sync dist/assets to root assets/
if (fs.existsSync(distAssets)) {
  if (!fs.existsSync(rootAssets)) {
    fs.mkdirSync(rootAssets, { recursive: true });
  }
  const files = fs.readdirSync(distAssets);
  // Remove obsolete generated chunks, leaving other assets intact.
  for (const file of fs.readdirSync(rootAssets)) {
    if (/\.(js|css)$/.test(file) && !files.includes(file)) {
      fs.unlinkSync(path.join(rootAssets, file));
    }
  }
  for (const file of files) {
    fs.copyFileSync(path.join(distAssets, file), path.join(rootAssets, file));
  }
  console.log(`✓ Synchronized ${files.length} production assets into root /assets`);
}

// 4. Ensure _redirects for Cloudflare Pages SPA deep routing
const redirectsContent = '/* /index.html 200\n';
fs.writeFileSync(path.join(rootDir, '_redirects'), redirectsContent);
if (fs.existsSync(path.join(rootDir, 'dist'))) {
  fs.writeFileSync(path.join(rootDir, 'dist', '_redirects'), redirectsContent);
}
console.log('✓ Synchronized _redirects in root and dist/');
