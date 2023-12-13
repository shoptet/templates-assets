const EDITOR_PARAM = 'editorPreview';
const MOBILE_DEVICE_PARAM = 'isMobileDevice';

// Capture link clicks
document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (link) {
        e.preventDefault();
        const nextUrl = getNextUrl(link.href);

        sendMessage({type: 'pageIsLoading'});
        window.location.assign(nextUrl);
    }
});

// Receive messages
window.addEventListener('message', function(e) {
    if (e.data.type === 'reload') {
        const nextUrl = getNextUrl(window.location.href, e.data.options);
        window.location.replace(nextUrl);
    }

    if (e.data.type === 'navigate') {
        const href = new URL(e.data.url, window.location.origin).toString();
        const nextUrl = getNextUrl(href);
        window.location.assign(nextUrl);
    }
});

// Post messages
sendMessage({
    type: 'pageLoaded',
    pageType: shoptet.editorPreview.pageType
});

function sendMessage(message) {
    window.parent.postMessage(message, window.location.origin);
}

/**
 * @param {string} href
 * @param {{deviceMode?: 'mobile' | 'desktop'} | undefined} options
 * @returns {URL}
 */
function getNextUrl(href, options) {
  const urlObject = new URL(href);
  const currentUrlObject = new URL(window.location.href);

  // Preserve edit mode
  urlObject.searchParams.set(EDITOR_PARAM, '');

  // Preserve current device mode if not specified
  if (!options?.deviceMode && currentUrlObject.searchParams.has(MOBILE_DEVICE_PARAM)) {
    urlObject.searchParams.set(MOBILE_DEVICE_PARAM, '');
  }

  // Set device mode if specified
  if (options?.deviceMode) {
    if (options.deviceMode === 'mobile') {
      urlObject.searchParams.set(MOBILE_DEVICE_PARAM, '');
    } else {
      urlObject.searchParams.delete(MOBILE_DEVICE_PARAM);
    }
  }

  return urlObject;
}
