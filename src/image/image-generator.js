import imageCompression from 'browser-image-compression';
import picaFactory from 'pica';
import { ICON_GROUPS, QUALITY_SETTINGS } from '../constants.js';
import { canvasToBlob, createCanvas, disposeCanvas } from './canvas-utils.js';

const pica = picaFactory();

/**
 * Generates all configured icon files from one source image.
 * @param {object} source
 * @param {HTMLImageElement} source.image
 * @param {number} source.width
 * @param {number} source.height
 * @param {object} settings
 * @param {(progress:number, label:string)=>void} onProgress
 */
export async function generateIconSet(source, settings, onProgress = () => {}) {
  const files = [];
  const iconSpecs = getEnabledIconSpecs(settings);
  const total = iconSpecs.length;

  for (const [index, spec] of iconSpecs.entries()) {
    const pngBlob = await renderIconBlob(source.image, source, spec, settings, 'image/png');
    const optimizedBlob = settings.optimizePng ? await optimizePng(pngBlob, settings.quality) : pngBlob;
    files.push({ ...spec, blob: optimizedBlob, type: 'image/png', path: `${spec.folder}/${spec.name}` });

    if (settings.includeWebp) {
      const webpBlob = await renderIconBlob(source.image, source, spec, settings, 'image/webp');
      files.push({ ...spec, blob: webpBlob, type: 'image/webp', path: `${spec.folder}/${replaceExtension(spec.name, 'webp')}` });
    }

    if (settings.includeJpg) {
      const jpgBlob = await renderIconBlob(source.image, source, spec, { ...settings, backgroundMode: 'white' }, 'image/jpeg');
      files.push({ ...spec, blob: jpgBlob, type: 'image/jpeg', path: `${spec.folder}/${replaceExtension(spec.name, 'jpg')}` });
    }

    onProgress(((index + 1) / total) * 82, spec.name);
    await yieldToBrowser();
  }

  let icoBlob = null;
  if (settings.includeIco) {
    const icoSources = files.filter((file) => file.folder === 'favicon' && [16, 32, 48].includes(file.width) && file.type === 'image/png');
    icoBlob = await createIcoBlob(icoSources);
  }

  return { files, icoBlob };
}

/**
 * Renders one icon as a Blob.
 * @param {HTMLImageElement} image
 * @param {{width:number,height:number}} source
 * @param {{width:number,height:number,containOnly?:boolean,maskable?:boolean}} spec
 * @param {object} settings
 * @param {string} mimeType
 * @returns {Promise<Blob>}
 */
export async function renderIconBlob(image, source, spec, settings, mimeType = 'image/png') {
  const { canvas, context } = createCanvas(spec.width, spec.height);
  const background = getBackground(settings);
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, spec.width, spec.height);
  } else {
    context.clearRect(0, 0, spec.width, spec.height);
  }

  const draw = calculateDrawRect(source, spec, settings);
  const resizeCanvas = await resizeSource(image, draw.width, draw.height, settings.quality);
  context.drawImage(resizeCanvas, draw.x, draw.y);
  disposeCanvas(resizeCanvas);

  if (spec.maskable && settings.maskableEnabled) {
    applyMaskableSafeZone(context, spec.width, spec.height);
  }

  if (settings.colorToTransparent && mimeType !== 'image/jpeg') {
    makeColorTransparent(context, spec.width, spec.height, settings.transparentColor, settings.transparentTolerance);
  }

  const quality = mimeType === 'image/png' ? undefined : QUALITY_SETTINGS[settings.quality].compressionQuality;
  const blob = await canvasToBlob(canvas, mimeType, quality);
  disposeCanvas(canvas);
  return blob;
}

/**
 * Generates the manifest JSON string.
 * @param {object} settings
 */
export function buildManifest(settings) {
  return JSON.stringify(
    {
      name: settings.appName,
      short_name: settings.appName.slice(0, 12),
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: settings.themeColor,
      icons: [
        { src: '/pwa/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa/maskable-icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/pwa/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    null,
    2
  );
}

/** Builds browserconfig.xml. */
export function buildBrowserConfig(settings) {
  return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/microsoft/mstile-70x70.png"/>
      <square150x150logo src="/microsoft/mstile-150x150.png"/>
      <wide310x150logo src="/microsoft/mstile-310x310.png"/>
      <TileColor>${settings.themeColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
}

/** Builds copyable HTML icon tags. */
export function buildHtmlSnippet() {
  return [
    '<link rel="icon" href="/favicon/favicon.ico" sizes="any">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple/apple-touch-icon-180x180.png">',
    '<link rel="manifest" href="/manifest.webmanifest">',
    '<meta name="msapplication-config" content="/browserconfig.xml">'
  ].join('\n');
}

function getEnabledIconSpecs(settings) {
  return ICON_GROUPS.flatMap((group) =>
    group.files
      .filter((file) => !file.maskable || settings.maskableEnabled)
      .map((file) => ({ ...file, group: group.group, folder: group.folder }))
  );
}

function calculateDrawRect(source, spec, settings) {
  const useCover = settings.fitMode === 'cover' && !spec.containOnly;
  const scale = useCover
    ? Math.max(spec.width / source.width, spec.height / source.height)
    : Math.min(spec.width / source.width, spec.height / source.height);
  const paddingMultiplier = settings.paddingEnabled && !useCover ? 1 - settings.paddingPercent / 100 : 1;
  const width = Math.max(1, Math.round(source.width * scale * paddingMultiplier));
  const height = Math.max(1, Math.round(source.height * scale * paddingMultiplier));
  return {
    width,
    height,
    x: Math.round((spec.width - width) / 2),
    y: Math.round((spec.height - height) / 2)
  };
}

async function resizeSource(image, width, height, quality) {
  const { canvas: sourceCanvas, context } = createCanvas(image.naturalWidth, image.naturalHeight);
  context.drawImage(image, 0, 0);
  const { canvas: outputCanvas } = createCanvas(width, height);
  if (quality === 'fast') {
    const outputContext = outputCanvas.getContext('2d');
    outputContext.drawImage(sourceCanvas, 0, 0, width, height);
  } else {
    await pica.resize(sourceCanvas, outputCanvas, { quality: QUALITY_SETTINGS[quality].picaQuality });
  }
  disposeCanvas(sourceCanvas);
  return outputCanvas;
}

function getBackground(settings) {
  if (settings.backgroundMode === 'white') return '#ffffff';
  if (settings.backgroundMode === 'black') return '#000000';
  if (settings.backgroundMode === 'custom') return settings.customColor;
  return null;
}

function makeColorTransparent(context, width, height, color, tolerance) {
  const target = hexToRgb(color);
  if (!target) return;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  const limit = Number(tolerance) || 0;
  for (let index = 0; index < data.length; index += 4) {
    const distance = Math.max(
      Math.abs(data[index] - target.r),
      Math.abs(data[index + 1] - target.g),
      Math.abs(data[index + 2] - target.b)
    );
    if (distance <= limit) {
      data[index + 3] = 0;
    }
  }
  context.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '').trim();
  if (!/^[\da-f]{6}$/i.test(normalized)) return null;
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function applyMaskableSafeZone(context, width, height) {
  context.save();
  context.strokeStyle = 'rgba(37, 99, 235, 0.28)';
  context.lineWidth = Math.max(2, Math.round(width * 0.01));
  context.setLineDash([Math.max(4, width * 0.02), Math.max(4, width * 0.02)]);
  context.beginPath();
  context.arc(width / 2, height / 2, width * 0.4, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

async function optimizePng(blob, quality) {
  if (blob.size < 10 * 1024) return blob;
  try {
    return await imageCompression(blob, {
      maxSizeMB: 8,
      useWebWorker: true,
      initialQuality: QUALITY_SETTINGS[quality].compressionQuality,
      fileType: 'image/png'
    });
  } catch {
    return blob;
  }
}

export async function createIcoBlob(files) {
  const buffers = await Promise.all(files.map((file) => file.blob.arrayBuffer()));
  const headerSize = 6;
  const directorySize = 16 * buffers.length;
  let offset = headerSize + directorySize;
  const totalSize = offset + buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const ico = new ArrayBuffer(totalSize);
  const view = new DataView(ico);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, buffers.length, true);

  buffers.forEach((buffer, index) => {
    const file = files[index];
    const entry = headerSize + index * 16;
    view.setUint8(entry, file.width >= 256 ? 0 : file.width);
    view.setUint8(entry + 1, file.height >= 256 ? 0 : file.height);
    view.setUint8(entry + 2, 0);
    view.setUint8(entry + 3, 0);
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, buffer.byteLength, true);
    view.setUint32(entry + 12, offset, true);
    new Uint8Array(ico, offset, buffer.byteLength).set(new Uint8Array(buffer));
    offset += buffer.byteLength;
  });

  return new Blob([ico], { type: 'image/x-icon' });
}

function replaceExtension(name, extension) {
  return name.replace(/\.[a-z0-9]+$/i, `.${extension}`);
}

function yieldToBrowser() {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}
