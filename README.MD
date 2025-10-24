# pncode
A library to compress files using png codec.

## Usage:

Compress:
```js
import { encode } from "pnpress";

// File name/path needs to be relative to folder.
const files = [{ name: "hello.txt", data: "Hello World! (Buffer)" }, ...];
const pngBuffer = encode(files);
await fs.writeFile("out.png", pngBuffer);
```

Decompress:
```js
import { decode } from "pnpress";

const files = decode(pngBuf);
for (const f of files) {
  const outPath = path.join("./out", f.name);
  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, f.data);
}
```
