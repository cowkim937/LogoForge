import { APP } from '../constants.js';
import { createCanvas, disposeCanvas, hasTransparentPixels } from './canvas-utils.js';

/**
 * Loads a File into an image bitmap compatible object.
 * @param {File} file
 */
export async function loadSourceImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageElement(url);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (width < APP.minImageSize || height < APP.minImageSize) {
      throw new Error('Image is too small. Use an image at least 16x16 pixels.');
    }

    const { canvas, context } = createCanvas(width, height);
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0);
    const isTransparent = hasTransparentPixels(canvas);
    disposeCanvas(canvas);

    return { file, image, url, width, height, isTransparent };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/**
 * Loads an HTMLImageElement.
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be decoded. The file may be damaged.'));
    image.src = url;
  });
}

