import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const forbidden = ['example.com', 'localhost', 'chrome-extension://'];
const textExt = new Set(['.html', '.xml', '.css', '.json', '.txt']);
const files = [];

async function walk(dir) {
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) await walk(full);
    else files.push(full);
  }
}

await walk(root);
for (const file of files) {
  const ext = file.slice(file.lastIndexOf('.'));
  if (!textExt.has(ext)) continue;
  const text = await readFile(file, 'utf8');
  for (const needle of forbidden) {
    if (text.includes(needle)) throw new Error(`금지 문자열 발견: ${needle} (${file})`);
  }
  if (file.endsWith('.xml') && /sitemap/i.test(file)) {
    if (/<lastmod>/i.test(text)) throw new Error(`sitemap에 lastmod가 포함됨: ${file}`);
    const locs = [...text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      if (!/^https:\/\//.test(loc)) throw new Error(`sitemap 절대 URL 오류: ${loc}`);
    }
  }
}

const hasSitemap = files.some((f) => /sitemap.*\.xml$/i.test(f));
if (!process.env.SITE_URL?.trim() && hasSitemap) {
  throw new Error('SITE_URL이 비어 있는데 sitemap이 생성되었습니다.');
}
console.log(`빌드 검증 완료: ${files.length}개 파일, 금지 문자열 없음.`);
