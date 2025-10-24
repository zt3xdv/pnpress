import fs from 'fs/promises';
import path from 'path';
import { encode, decode } from '../src/index.js';

async function readAllFilesRecursive(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...await readAllFilesRecursive(full, base));
    } else if (ent.isFile()) {
      const data = await fs.readFile(full);
      const rel = path.relative(base, full).replace(/\\/g, '/');
      files.push({ name: rel, data });
    }
  }
  return files;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function compressFolder(srcDir, outPngPath) {
  const files = await readAllFilesRecursive(srcDir);
  if (files.length === 0) throw new Error('No files to compress');
  const pngBuffer = encode(files);
  await fs.writeFile(outPngPath, pngBuffer);
  console.log(`Compressed ${files.length} file(s) -> ${outPngPath}`);
}

async function extractToFolder(pngPath, destDir) {
  const pngBuf = await fs.readFile(pngPath);
  const files = decode(pngBuf);
  for (const f of files) {
    const outPath = path.join(destDir, f.name);
    await ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, f.data);
  }
  console.log(`Extracted ${files.length} file(s) -> ${destDir}`);
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  if (cmd === 'compress') {
    const srcDir = argv[1] || './input';
    const outPng = argv[2] || './out.png';
    await compressFolder(srcDir, outPng);
  } else if (cmd === 'extract') {
    const inPng = argv[1] || './out.png';
    const dest = argv[2] || './output';
    await extractToFolder(inPng, dest);
  } else {
    console.log('Usage: compress <srcDir> <out.png> | extract <in.png> <destDir>');
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(2); });
