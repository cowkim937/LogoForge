import './styles/main.css';
import { APP, QUALITY_SETTINGS } from './constants.js';
import { createEditedBlob, populateEditFileSelect, renderEditableImage } from './components/generated-editor.js';
import { setupUploader } from './components/uploader.js';
import { renderGeneratedGrid, renderSourcePreview } from './components/preview.js';
import { buildHtmlSnippet, buildManifest, createIcoBlob, generateIconSet } from './image/image-generator.js';
import { loadSourceImage } from './image/image-loader.js';
import { createLogoZip, downloadZip } from './zip/zip-exporter.js';
import { $, $$, clearAlert, setProgress, showAlert } from './utils/dom.js';

const state = {
  source: null,
  generated: null,
  zipBlob: null
};

const elements = {
  alertRegion: $('#alertRegion'),
  dropZone: $('#dropZone'),
  fileInput: $('#fileInput'),
  selectImageBtn: $('#selectImageBtn'),
  replaceImageBtn: $('#replaceImageBtn'),
  appPanels: $('#appPanels'),
  sourcePreview: $('#sourcePreview'),
  imageMeta: $('#imageMeta'),
  tabFavicon: $('#tabFavicon'),
  qualitySelect: $('#qualitySelect'),
  qualityIndicator: $('#qualityIndicator'),
  generateBtn: $('#generateBtn'),
  downloadBtn: $('#downloadBtn'),
  progressWrap: $('#progressWrap'),
  progressBar: $('#progressBar'),
  resultsPanel: $('#resultsPanel'),
  iconGrid: $('#iconGrid'),
  htmlCode: $('#htmlCode'),
  manifestCode: $('#manifestCode'),
  copyHtmlBtn: $('#copyHtmlBtn'),
  copyManifestBtn: $('#copyManifestBtn'),
  editFileSelect: $('#editFileSelect'),
  editCanvas: $('#editCanvas'),
  editBackground: $('#editBackground'),
  editCustomColor: $('#editCustomColor'),
  editOpacity: $('#editOpacity'),
  editScale: $('#editScale'),
  editRotate: $('#editRotate'),
  applyEditBtn: $('#applyEditBtn')
};

setupUploader(elements, handleFile, (message) => showAlert(elements.alertRegion, message, 'danger'));
setupControls();

async function handleFile(file) {
  try {
    clearAlert(elements.alertRegion);
    elements.generateBtn.disabled = true;
    releaseCurrentSource();
    const source = await loadSourceImage(file);
    state.source = source;
    state.generated = null;
    state.zipBlob = null;
    renderSourcePreview(source, elements);
    elements.dropZone.classList.add('d-none');
    elements.appPanels.classList.remove('d-none');
    elements.resultsPanel.classList.add('d-none');
    elements.downloadBtn.disabled = true;
    elements.generateBtn.disabled = false;
    showAlert(elements.alertRegion, 'Image loaded. Adjust settings and generate your icon ZIP.', 'success');
  } catch (error) {
    showAlert(elements.alertRegion, error.message, 'danger');
  }
}

function setupControls() {
  elements.qualitySelect.addEventListener('change', () => {
    elements.qualityIndicator.textContent = QUALITY_SETTINGS[elements.qualitySelect.value].label;
  });

  elements.generateBtn.addEventListener('click', async () => {
    if (!state.source) {
      showAlert(elements.alertRegion, 'Upload an image first.', 'warning');
      return;
    }
    await generate();
  });

  elements.downloadBtn.addEventListener('click', () => {
    if (state.zipBlob) {
      downloadZip(state.zipBlob);
    }
  });

  elements.copyHtmlBtn.addEventListener('click', () => copyText(elements.htmlCode.value, 'HTML code copied.'));
  elements.copyManifestBtn.addEventListener('click', () => copyText(elements.manifestCode.value, 'Manifest copied.'));

  [elements.editFileSelect, elements.editBackground, elements.editCustomColor, elements.editOpacity, elements.editScale, elements.editRotate].forEach((control) => {
    control.addEventListener('input', renderCurrentEditPreview);
    control.addEventListener('change', renderCurrentEditPreview);
  });

  elements.applyEditBtn.addEventListener('click', applyGeneratedEdit);

  $$('[data-preview-bg]').forEach((button) => {
    button.addEventListener('click', () => {
      $$('[data-preview-bg]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      elements.resultsPanel.dataset.previewBg = button.dataset.previewBg;
    });
  });

  $('[data-safe-zone]').addEventListener('click', (event) => {
    event.currentTarget.classList.toggle('active');
    elements.resultsPanel.classList.toggle('show-safe-zone');
  });

  window.addEventListener('beforeunload', releaseCurrentSource);
}

async function generate() {
  try {
    clearAlert(elements.alertRegion);
    elements.generateBtn.disabled = true;
    elements.downloadBtn.disabled = true;
    state.zipBlob = null;
    setProgress(elements.progressWrap, elements.progressBar, 4);

    const settings = getSettings();
    const generated = await generateIconSet(state.source, settings, (progress) => {
      setProgress(elements.progressWrap, elements.progressBar, progress);
    });
    state.generated = generated;
    setProgress(elements.progressWrap, elements.progressBar, 88);

    state.zipBlob = await createLogoZip(generated, settings);
    setProgress(elements.progressWrap, elements.progressBar, 100);

    renderGeneratedGrid(generated.files, elements.iconGrid);
    populateEditFileSelect(elements.editFileSelect, generated.files);
    await renderCurrentEditPreview();
    elements.htmlCode.value = buildHtmlSnippet();
    elements.manifestCode.value = buildManifest(settings);
    elements.resultsPanel.classList.remove('d-none');
    elements.downloadBtn.disabled = false;
    showAlert(elements.alertRegion, `Generated ${generated.files.length + (generated.icoBlob ? 1 : 0)} files. ZIP is ready.`, 'success');

    if (settings.autoDownload) {
      downloadZip(state.zipBlob);
    }
  } catch (error) {
    showAlert(elements.alertRegion, error.message || 'Icon generation failed.', 'danger');
  } finally {
    elements.generateBtn.disabled = false;
    window.setTimeout(() => elements.progressWrap.classList.add('d-none'), 1400);
  }
}

function getSettings() {
  return {
    fitMode: document.querySelector('input[name="fitMode"]:checked').value,
    paddingEnabled: $('#paddingEnabled').checked,
    paddingPercent: Number($('#paddingRange').value),
    backgroundMode: document.querySelector('input[name="backgroundMode"]:checked').value,
    customColor: $('#customColor').value,
    quality: elements.qualitySelect.value,
    optimizePng: $('#optimizePng').checked,
    includeIco: $('#includeIco').checked,
    includeWebp: $('#includeWebp').checked,
    includeJpg: $('#includeJpg').checked,
    autoDownload: $('#autoDownload').checked,
    retinaMode: $('#retinaMode').checked,
    maskableEnabled: $('#maskableEnabled').checked,
    appName: $('#appName').value.trim() || APP.name,
    themeColor: $('#themeColor').value,
    colorToTransparent: $('#colorToTransparent').checked,
    transparentColor: $('#transparentColor').value,
    transparentTolerance: Number($('#transparentTolerance').value)
  };
}

async function renderCurrentEditPreview() {
  if (!state.generated) return;
  const file = getSelectedGeneratedFile();
  if (!file) return;
  await renderEditableImage(file, elements.editCanvas, getEditSettings());
}

async function applyGeneratedEdit() {
  if (!state.generated) {
    showAlert(elements.alertRegion, 'Generate icons before editing.', 'warning');
    return;
  }

  const file = getSelectedGeneratedFile();
  if (!file) {
    showAlert(elements.alertRegion, 'Select a generated PNG to edit.', 'warning');
    return;
  }

  try {
    elements.applyEditBtn.disabled = true;
    const editedBlob = await createEditedBlob(file, getEditSettings());
    file.blob = editedBlob;
    if (state.generated.icoBlob) {
      const icoSources = state.generated.files.filter((item) => item.folder === 'favicon' && [16, 32, 48].includes(item.width) && item.type === 'image/png');
      state.generated.icoBlob = await createIcoBlob(icoSources);
    }
    state.zipBlob = await createLogoZip(state.generated, getSettings());
    renderGeneratedGrid(state.generated.files, elements.iconGrid);
    await renderCurrentEditPreview();
    elements.downloadBtn.disabled = false;
    showAlert(elements.alertRegion, `${file.path} was updated in the ZIP.`, 'success');
  } catch (error) {
    showAlert(elements.alertRegion, error.message || 'Failed to apply the edit.', 'danger');
  } finally {
    elements.applyEditBtn.disabled = false;
  }
}

function getSelectedGeneratedFile() {
  return state.generated?.files.find((file) => file.path === elements.editFileSelect.value);
}

function getEditSettings() {
  return {
    background: elements.editBackground.value,
    customColor: elements.editCustomColor.value,
    opacity: Number(elements.editOpacity.value),
    scale: Number(elements.editScale.value),
    rotate: Number(elements.editRotate.value)
  };
}

async function copyText(value, message) {
  try {
    await navigator.clipboard.writeText(value);
    showAlert(elements.alertRegion, message, 'success');
  } catch {
    showAlert(elements.alertRegion, 'Clipboard permission was blocked. Select and copy the text manually.', 'warning');
  }
}

function releaseCurrentSource() {
  if (state.source?.url) {
    URL.revokeObjectURL(state.source.url);
  }
}
