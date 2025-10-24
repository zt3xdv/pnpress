import { PNG } from 'pngjs';

/**
 * Encode raw RGBA buffer into PNG data (Buffer)
 * width, height, and a Buffer/Uint8Array of length width*height*4
 */
export function encodePngRGBA(width, height, rgbaBuffer) {
  const png = new PNG({ width, height });
  png.data = Buffer.from(rgbaBuffer);
  return PNG.sync.write(png);
}

/**
 * Decode PNG Buffer into {width, height, data: Buffer (RGBA)}
 */
export function decodePngRGBA(buffer) {
  const png = PNG.sync.read(buffer);
  return {
    width: png.width,
    height: png.height,
    data: Buffer.from(png.data) // RGBA
  };
}

/**
 * Convert buffer -> data URL (image/png)
 */
export function bufferToDataUrl(buffer) {
  const b64 = buffer.toString('base64');
  return `data:image/png;base64,${b64}`;
}

/**
 * Convert data URL -> buffer
 */
export function dataUrlToBuffer(dataUrl) {
  const match = dataUrl.match(/^data:.*?;base64,(.*)$/);
  if (!match) throw new Error('Invalid data URL');
  return Buffer.from(match[1], 'base64');
}
