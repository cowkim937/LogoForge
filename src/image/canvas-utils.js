/**
 * Creates a canvas with a 2D context.
 * @param {number} width
 * @param {number} height
 */
export function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    throw new Error('Canvas is not supported in this browser.');
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return { canvas, context };
}

/**
 * Releases canvas backing memory.
 * @param {HTMLCanvasElement|null|undefined} canvas
 */
export function disposeCanvas(canvas) {
  if (!canvas) return;
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Converts a canvas to a Blob.
 * @param {HTMLCanvasElement} canvas
 * @param {string} type
 * @param {number} [quality]
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, type = 'image/png', quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode canvas.'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

/**
 * Reads a pixel alpha sample to detect transparency.
 * @param {HTMLCanvasElement} canvas
 * @returns {boolean}
 */
export function hasTransparentPixels(canvas) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;
  const step = Math.max(1, Math.floor(Math.sqrt((canvas.width * canvas.height) / 16000)));
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = context.getImageData(x, y, 1, 1).data[3];
      if (alpha < 255) return true;
    }
  }
  return false;
}

