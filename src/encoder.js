import { MAGIC, VERSION } from './constants.js';
import { encodePngRGBA } from './pngUtil.js';

/**
 * Layout:
 * [MAGIC(4)] [VERSION(1)] [fileCount(2, big-endian)]
 * For each file:
 *   [nameLen(2)] [name(bytes UTF-8)] [size(4 BE)] [data bytes]
 *
 * Then pack the whole payload bytes into pixels:
 * - Each pixel contains 4 bytes (RGBA). We'll write payload bytes sequentially into RGBA bytes.
 * - If payload length not multiple of 4, pad zeros.
 * - Create PNG with width chosen to be ceil(sqrt(pixelCount)) to make near-square, height accordingly.
 *
 * encode(files) where files = [{name: string, data: Uint8Array|Buffer}]
 * returns PNG Buffer (image/png) representing packed archive.
 */

function writeUint16BE(buf, offset, val) {
  buf[offset] = (val >> 8) & 0xff;
  buf[offset+1] = val & 0xff;
}
function writeUint32BE(buf, offset, val) {
  buf[offset] = (val >>> 24) & 0xff;
  buf[offset+1] = (val >>> 16) & 0xff;
  buf[offset+2] = (val >>> 8) & 0xff;
  buf[offset+3] = val & 0xff;
}

export function encode(files) {
  // reasonable default: files is array of {name, data}
  const entries = files.map(f => {
    const nameBytes = Buffer.from(String(f.name), 'utf8');
    const data = Buffer.from(f.data);
    return { nameBytes, data };
  });

  // compute total size for payload
  let payloadLength = 0;
  payloadLength += 4 + 1 + 2; // MAGIC + VERSION + fileCount
  for (const e of entries) {
    payloadLength += 2; // nameLen
    payloadLength += e.nameBytes.length;
    payloadLength += 4; // size
    payloadLength += e.data.length;
  }

  const payload = Buffer.alloc(payloadLength);
  let off = 0;
  payload.set(Buffer.from(MAGIC), off); off += MAGIC.length;
  payload[off++] = VERSION;
  writeUint16BE(payload, off, entries.length); off += 2;

  for (const e of entries) {
    writeUint16BE(payload, off, e.nameBytes.length); off += 2;
    payload.set(e.nameBytes, off); off += e.nameBytes.length;
    writeUint32BE(payload, off, e.data.length); off +=4;
    payload.set(e.data, off); off += e.data.length;
  }

  // pack into pixels (RGBA)
  const pixelCount = Math.ceil(payload.length / 4);
  const width = Math.ceil(Math.sqrt(pixelCount));
  const height = Math.ceil(pixelCount / width);
  const totalPixels = width * height;
  const totalBytes = totalPixels * 4;
  const rgba = Buffer.alloc(totalBytes, 0);
  payload.copy(rgba, 0);

  return encodePngRGBA(width, height, rgba);
}
