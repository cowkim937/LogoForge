import { ACCEPTED_TYPES, APP } from '../constants.js';

/**
 * Validates an input file before decoding.
 * @param {File} file
 */
export function validateImageFile(file) {
  if (!file) {
    throw new Error('Please select an image file.');
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Unsupported image type. Please use PNG or SVG.');
  }
  if (file.size > APP.maxFileSizeBytes) {
    throw new Error('The file is larger than 30MB.');
  }
}

/**
 * Formats bytes as a compact label.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

/**
 * Builds an object URL and returns a cleanup function.
 * @param {Blob} blob
 */
export function createObjectUrl(blob) {
  const url = URL.createObjectURL(blob);
  return { url, revoke: () => URL.revokeObjectURL(url) };
}

/**
 * Reads the first image from clipboard items.
 * @param {ClipboardEvent} event
 * @returns {File|null}
 */
export function getClipboardImage(event) {
  const items = Array.from(event.clipboardData?.items ?? []);
  const imageItem = items.find((item) => ACCEPTED_TYPES.includes(item.type));
  const file = imageItem?.getAsFile();
  return file ?? null;
}

