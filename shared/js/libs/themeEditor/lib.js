// @ts-check

const EDITOR_PARAM = 'editorPreview';
const MOBILE_DEVICE_PARAM = 'isMobileDevice';

/**
 * @returns {boolean}
 */
export function detectEditorPreview() {
  return new URLSearchParams(window.location.search).has(EDITOR_PARAM);
}

/**
 * @param {string} url
 * @returns {string}
 */
export function preserveEditorPreviewUrl(url) {
  try {
    if (!detectEditorPreview()) {
      return url;
    }

    return getNextUrl(new URL(url, window.location.href)).href;
  } catch {
    return url;
  }
}

/**
 * @param {URL} urlObject URL object to be modified
 * @param {{deviceMode: 'mobile' | 'desktop'}} [options]
 * @returns {URL}
 */
export function getNextUrl(urlObject, options) {
  const currentUrlObject = new URL(window.location.href);
  const nextUrlObject = new URL(urlObject.href);

  // Preserve edit mode
  nextUrlObject.searchParams.set(EDITOR_PARAM, '');

  // Preserve current device mode if not specified
  if (!options?.deviceMode && currentUrlObject.searchParams.has(MOBILE_DEVICE_PARAM)) {
    nextUrlObject.searchParams.set(MOBILE_DEVICE_PARAM, '');
  }

  // Set device mode if specified
  if (options?.deviceMode) {
    if (options.deviceMode === 'mobile') {
      nextUrlObject.searchParams.set(MOBILE_DEVICE_PARAM, '');
    } else {
      nextUrlObject.searchParams.delete(MOBILE_DEVICE_PARAM);
    }
  }

  return nextUrlObject;
}
