import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const forbidden = ['example.com', 'localhost', 'chrome-extension://'];
const textExt = new Set(['.html', '.xml', '.css', '.json', '.txt']);
const files = [];
let checkedFiles = 0;

function isPublicArtifact(file) {
  const rel = relative(root, file);
  return rel && !rel.startsWith(`server${sep}`);
}

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
  if (!isPublicArtifact(file)) continue;
  const ext = file.slice(file.lastIndexOf('.'));
  if (!textExt.has(ext)) continue;
  checkedFiles += 1;
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

const hasSitemap = files.some((f) => isPublicArtifact(f) && /sitemap.*\.xml$/i.test(f));
if (!hasSitemap) throw new Error('sitemap 누락');
console.log(`빌드 검증 완료: 공개 텍스트 산출물 ${checkedFiles}개 파일, 금지 문자열 없음.`);
