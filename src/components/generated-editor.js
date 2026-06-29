import { canvasToBlob, createCanvas, disposeCanvas } from '../image/canvas-utils.js';

/**
 * Populates the generated PNG selector.
 * @param {HTMLSelectElement} select
 * @param {Array} files
 */
export function populateEditFileSelect(select, files) {
  select.innerHTML = '';
  files
    .filter((file) => file.type === 'image/png')
    .forEach((file, index) => {
      const option = document.createElement('option');
      option.value = file.path;
      option.textContent = `${file.path} (${file.width}x${file.height})`;
      if (index === 0) option.selected = true;
      select.appendChild(option);
    });
}

/**
 * Renders a generated file into the editor canvas with current edits.
 * @param {object} file
 * @param {HTMLCanvasElement} canvas
 * @param {object} editSettings
 */
export async function renderEditableImage(file, canvas, editSettings) {
  if (!file) return;
  const image = await blobToImage(file.blob);
  const maxDisplaySize = 320;
  const scaleToFit = Math.min(1, maxDisplaySize / Math.max(file.width, file.height));
  const displayWidth = Math.max(160, Math.round(file.width * scaleToFit));
  const displayHeight = Math.max(80, Math.round(file.height * scaleToFit));
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, displayWidth, displayHeight);

  const background = getEditBackground(editSettings);
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, displayWidth, displayHeight);
  }

  const scale = editSettings.scale / 100;
  const drawWidth = displayWidth * scale;
  const drawHeight = displayHeight * scale;
  context.save();
  context.globalAlpha = editSettings.opacity / 100;
  context.translate(displayWidth / 2, displayHeight / 2);
  context.rotate((editSettings.rotate * Math.PI) / 180);
  context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  context.restore();
}

/**
 * Applies editor changes to the actual generated icon blob size.
 * @param {object} file
 * @param {object} editSettings
 * @returns {Promise<Blob>}
 */
export async function createEditedBlob(file, editSettings) {
  const image = await blobToImage(file.blob);
  const { canvas, context } = createCanvas(file.width, file.height);
  const background = getEditBackground(editSettings);
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, file.width, file.height);
  } else {
    context.clearRect(0, 0, file.width, file.height);
  }

  const scale = editSettings.scale / 100;
  const drawWidth = file.width * scale;
  const drawHeight = file.height * scale;
  context.save();
  context.globalAlpha = editSettings.opacity / 100;
  context.translate(file.width / 2, file.height / 2);
  context.rotate((editSettings.rotate * Math.PI) / 180);
  context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  context.restore();

  const blob = await canvasToBlob(canvas, 'image/png');
  disposeCanvas(canvas);
  return blob;
}

function getEditBackground(settings) {
  if (settings.background === 'white') return '#ffffff';
  if (settings.background === 'black') return '#000000';
  if (settings.background === 'custom') return settings.customColor;
  return null;
}

function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load generated image for editing.'));
    };
    image.src = url;
  });
}
