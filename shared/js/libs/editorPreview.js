const EDITOR_PARAM = 'editorPreview';
const MOBILE_DEVICE_PARAM = 'isMobileDevice';

const EDITOR_ORIGIN = window.location.origin;

// Apply only if in editor preview mode
if (shoptet?.editorPreview) {

	// Capture link clicks
	document.addEventListener('click', function (e) {
		if (e.defaultPrevented) {
			return;
		}

		const link = e.target?.closest('a');

		if (link && link.href) {
			let url;
			try {
				url = new URL(link.href);
			} catch (e) {
				return;
			}

			if (link.target === '_blank') {
				return;
			}

			if (!url.origin || url.origin === 'null') {
				return;
			}

			if (url.origin !== window.location.origin) {
				e.preventDefault();
				return;
			}

			if (url.pathname === window.location.pathname && url.href.includes('#')) {
				return;
			}

			e.preventDefault();
			const nextUrl = getNextUrl(url);
			sendMessage({ type: 'pageIsLoading' });
			window.location.assign(nextUrl);
		}
	});

	// Capture navigation to another page
	window.addEventListener('pagehide', function () {
		sendMessage({ type: 'pageIsLoading' });
	});
}

// Receive messages
window.addEventListener('message', function (e) {
	if (e.origin !== EDITOR_ORIGIN) {
		return;
	}

	if (e.data.type === 'reload') {
		const nextUrl = getNextUrl(new URL(window.location.href), e.data.options);
		sendMessage({ type: 'pageIsLoading' });

		// Use location.reload where possible to maintain scroll position
		if (nextUrl.href === window.location.href) {
			window.location.reload();
		} else {
			window.location.replace(nextUrl);
		}
	}

	if (e.data.type === 'navigate') {
		const url = new URL(e.data.url, window.location.origin);
		const nextUrl = getNextUrl(url);
		sendMessage({ type: 'pageIsLoading' });
		window.location.assign(nextUrl);
	}
});

// Post messages
sendMessage({
	type: 'pageLoaded',
	pageType: shoptet?.editorPreview?.pageType ?? 'not-editable',
});

function sendMessage(message) {
	window.parent.postMessage(message, EDITOR_ORIGIN);
}

/**
 * @param {URL} urlObject
 * @param {{deviceMode: 'mobile' | 'desktop'}} [options]
 * @returns {URL}
 */
function getNextUrl(urlObject, options) {
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
