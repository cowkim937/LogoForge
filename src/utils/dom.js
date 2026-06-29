/**
 * Returns a required DOM element.
 * @template {HTMLElement} T
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {T}
 */
export function $(selector, root = document) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

/**
 * Returns all matching DOM elements.
 * @template {HTMLElement} T
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {T[]}
 */
export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Shows a Bootstrap-compatible alert.
 * @param {HTMLElement} region
 * @param {string} message
 * @param {'success'|'danger'|'warning'|'info'} [type]
 */
export function showAlert(region, message, type = 'info') {
  region.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}

/** Clears an alert region. */
export function clearAlert(region) {
  region.innerHTML = '';
}

/**
 * Updates a progress bar.
 * @param {HTMLElement} wrap
 * @param {HTMLElement} bar
 * @param {number} percent
 */
export function setProgress(wrap, bar, percent) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  wrap.classList.remove('d-none');
  wrap.setAttribute('aria-valuenow', String(safePercent));
  bar.style.width = `${safePercent}%`;
  bar.textContent = `${safePercent}%`;
}

