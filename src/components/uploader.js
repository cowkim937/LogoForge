import { getClipboardImage, validateImageFile } from '../utils/file-utils.js';

/**
 * Wires file input, drag/drop, keyboard, and clipboard upload.
 * @param {object} elements
 * @param {(file:File)=>void} onFile
 * @param {(message:string)=>void} onError
 */
export function setupUploader(elements, onFile, onError) {
  const { dropZone, fileInput, selectImageBtn, replaceImageBtn } = elements;

  const openPicker = () => fileInput.click();
  selectImageBtn.addEventListener('click', openPicker);
  replaceImageBtn.addEventListener('click', openPicker);
  dropZone.addEventListener('click', (event) => {
    if (event.target === selectImageBtn) return;
    openPicker();
  });
  fileInput.addEventListener('change', () => {
    handleFile(fileInput.files?.[0], onFile, onError);
    fileInput.value = '';
  });

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('is-dragging');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-dragging'));
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
    handleFile(event.dataTransfer?.files?.[0], onFile, onError);
  });

  document.addEventListener('paste', (event) => {
    const file = getClipboardImage(event);
    if (file) {
      handleFile(file, onFile, onError);
    }
  });
}

function handleFile(file, onFile, onError) {
  try {
    validateImageFile(file);
    onFile(file);
  } catch (error) {
    onError(error.message);
  }
}
