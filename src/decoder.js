import { MAGIC } from './constants.js';
import { decodePngRGBA, bufferToDataUrl, dataUrlToBuffer } from './pngUtil.js';

/**
 * decode(pngBuffer) => [{name, data: Buffer}]
 */
function readUint16BE(buf, offset) {
  return (buf[offset] << 8) | buf[offset+1];
}
function readUint32BE(buf, offset) {
  return ((buf[offset] << 24) >>> 0) + (buf[offset+1] << 16) + (buf[offset+2] << 8) + buf[offset+3];
}

export function decode(pngBuffer) {
  const { data } = decodePngRGBA(pngBuffer); // Buffer RGBA
  // reconstruct payload: strip trailing nulls after payload length detection
  // first check magic at start
  if (data.length < 7) throw new Error('Invalid data');
  // find magic in first bytes
  if (data[0] !== MAGIC[0] || data[1] !== MAGIC[1] || data[2] !== MAGIC[2] || data[3] !== MAGIC[3]) {
    throw new Error('Invalid magic');
  }
  let off = 4;
  const version = data[off++]; // not used now
  const fileCount = readUint16BE(data, off); off += 2;
  const out = [];
  for (let i=0;i<fileCount;i++) {
    const nameLen = readUint16BE(data, off); off +=2;
    const name = data.slice(off, off+nameLen).toString('utf8'); off += nameLen;
    const size = readUint32BE(data, off); off +=4;
    const fileBytes = Buffer.from(data.slice(off, off+size)); off += size;
    out.push({ name, data: fileBytes });
  }
  return out;
}

/**
 * decodeFromDataUrl(dataUrl) => [{name, data: Buffer, dataUrl: string}]
 */
export function decodeFromDataUrl(dataUrl) {
  const buf = dataUrlToBuffer(dataUrl);
  const files = decode(buf);
  // add dataUrl for each file
  return files.map(f => {
    return { name: f.name, data: f.data, dataUrl: bufferToDataUrl(f.data) };
  });
}
