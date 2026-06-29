import { PREVIEW_SIZES } from '../constants.js';
import { formatBytes } from '../utils/file-utils.js';

/**
 * Renders source metadata and preview image.
 * @param {object} source
 * @param {object} elements
 */
export function renderSourcePreview(source, elements) {
  elements.sourcePreview.src = source.url;
  elements.tabFavicon.style.backgroundImage = `url("${source.url}")`;
  const rows = [
    ['Width', `${source.width}px`],
    ['Height', `${source.height}px`],
    ['Transparent', source.isTransparent ? 'Yes' : 'No'],
    ['File Size', formatBytes(source.file.size)],
    ['Image Resolution', `${source.width} x ${source.height}`]
  ];
  elements.imageMeta.innerHTML = rows.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('');
}

/**
 * Renders generated icon previews.
 * @param {Array} files
 * @param {HTMLElement} grid
 */
export function renderGeneratedGrid(files, grid) {
  grid.innerHTML = '';
  const previewFiles = files.filter((file) => file.type === 'image/png' && PREVIEW_SIZES.has(file.width) && file.width === file.height);
  const seen = new Set();
  for (const file of previewFiles) {
    const key = `${file.folder}-${file.width}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const url = URL.createObjectURL(file.blob);
    const item = document.createElement('article');
    item.className = 'icon-preview-card';
    item.innerHTML = `
      <div class="icon-preview-image checkerboard">
        <img src="${url}" alt="${file.width} by ${file.height} ${file.group} icon preview" loading="lazy" />
        <span class="safe-zone-ring" aria-hidden="true"></span>
      </div>
      <strong>${file.width}</strong>
      <span>${file.folder}</span>
    `;
    const image = item.querySelector('img');
    image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    grid.appendChild(item);
  }
}

