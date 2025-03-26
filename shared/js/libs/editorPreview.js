const EDITOR_PARAM = 'editorPreview';
const MOBILE_DEVICE_PARAM = 'isMobileDevice';

const EDITOR_ORIGIN = window.location.origin;

let lastHover = null;

// Capture link clicks
document.addEventListener('click', function (e) {
  if (!shoptet?.editorPreview) return;

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

  if (e.data.type === 'inspectConfig') {
    prevConfig = inspectConfig;
    inspectConfig = { ...inspectConfig, ...e.data.config };
    toggleInspectMode();

    if (prevConfig.activeElementId !== inspectConfig.activeElementId) {
      setActiveElement(findElementInView(inspectConfig.activeElementId));
    }
  }

  if (e.data.type === 'inspectHover') {
    setHoveredElement(findElementInView(e.data.hoverElementId));
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

/*********************
 * Inspect mode
 *********************/

// State
let inspectConfig = {
  enabled: false,
  activeElementId: null,
  titles: {},
}

let activeElement = null;
let hoveredElement = null;

// Shadow DOM overlay
const overlay = document.createElement('div');
const shadow = overlay.attachShadow({ mode: 'open' });

const style = document.createElement('style');
style.textContent = `
  :host {
    all: initial;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100000;
    letter-spacing: 0.1px;
    font-family: 'Inter', sans-serif;
    display: none;
  }

  .label-outline {
    position: absolute;
    transition: outline 0s;
  }

  .label-text {
    position: absolute;
    background-color: #ffe91c;
    color: #000;
    font-weight: 700;
    padding: 2px 8px;
    font-size: 12px;
    line-height: 16px;
    border-radius: 2px;
  }
`;

shadow.appendChild(style);

const labelContainer = document.createElement('div');
shadow.appendChild(labelContainer);
document.body.appendChild(overlay);

function toggleInspectMode() {
  overlay.style.display = inspectConfig.enabled ? 'block' : 'none';
}

// Labels
const MIN_INNER_LABEL_HEIGHT = 48;

function createOrUpdateLabel(element) {
  if (!element) return;

  const isActive = element === activeElement;
  const isHovered = element === hoveredElement;
  const id = element.dataset.editorid;

  // this enables to have multiple elements with the same id (e.g. viewport-dependent elements)
  // once one is hidden, if another is visible, it will be highlighted
  if (isActive) {
    const currentlyVisible = findElementInView(id);
    if (currentlyVisible && findElementInView(id) !== element) {
      setActiveElement(currentlyVisible);
      return;
    }
  }

  // Handle elements with the same id
  let index = 0;
  const elements = document.querySelectorAll(`[data-editorid="${id}"]`);
  elements.forEach((el, i) => {
    if (el === element) {
      index = i;
    }
  });

  let labelInfo = shadow.querySelector(`[data-for="${id}"][data-for-index="${index}"]`);

  if (!labelInfo) {
    labelInfo = document.createElement('div');
    labelInfo.dataset.for = id;
    labelInfo.dataset.forIndex = index;
    labelContainer.appendChild(labelInfo);
  }

  const rect = element.getBoundingClientRect();
  const labelTextPosition = getLabelTextPosition(rect);

  labelInfo.innerHTML = `
    <div class="label-outline" style="
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      outline-offset: ${isActive ? '-4px' : '-2px'};
      outline: ${isActive ? '4px solid #ffe91c' : (isHovered ? '2px solid #ffe91c' : 'none')};
    "></div>
    <div class="label-text" style="
      ${labelTextPosition}
      display: ${isActive || isHovered ? 'block' : 'none'};
      z-index: ${isHovered ? '100000' : '99999'};
    ">${inspectConfig.titles[id]}</div>
  `;
}

function getPositionCss(position) {
  return Object.entries(position).map(([key, value]) => `${key}: ${value}px;`).join(' ');
}

function getLabelTextPosition(rect) {
  if (rect.height < MIN_INNER_LABEL_HEIGHT) {
    const left = rect.left;

    if (window.innerHeight - rect.bottom < 24) {
      // Label would be cut off by the bottom edge, place it above the element
      return getPositionCss({
        left,
        bottom: window.innerHeight - rect.top + 2,
      });
    }
    return getPositionCss({
      left,
      top: rect.bottom + 2,
    });
  } else {
    return getPositionCss({
      left: rect.left + 8,
      bottom: Math.min(window.innerHeight - 8 - 20, Math.max(8, window.innerHeight - rect.bottom + 8)),
    });
  }
}

// Blacklist for elements that should not trigger inspect mode
const INSPECT_MODE_ELEMENTS_BLACKLIST = ['.product-slider-navigation'];

// Event handlers
document.body.addEventListener('click', (event) => {
  if (!inspectConfig.enabled) return;

  // Ignore the clicks on a blacklisted elements or their children
  if (INSPECT_MODE_ELEMENTS_BLACKLIST.some(selector => event.target.closest(selector))) return;

  const element = event.target.closest(`[data-editorid]${isMobileView() ? '' : ':not([data-editormobileonly])'}`);
  if (element && element !== activeElement) {
    event.preventDefault();
    event.stopImmediatePropagation();
    inspectConfig.activeElementId = element.dataset.editorid;
    setActiveElement(element);
    sendMessage({ type: 'inspecting', activeElementId: inspectConfig.activeElementId });
  }
});

document.addEventListener('mouseover', (event) => {
  if (!inspectConfig.enabled) return;

  const element = event.target.closest(`[data-editorid]${isMobileView() ? '' : ':not([data-editormobileonly])'}`);
  if (element) {
    setHoveredElement(element);

    // use lastHover to prevent sending multiple messages for the same element
    if (lastHover === null || lastHover !== element.dataset.editorid) {
      sendMessage({ type: 'inspectHover', hoverElementId: element.dataset.editorid });
      lastHover = element.dataset.editorid;
    }
  } else {
    setHoveredElement(null);

    if (lastHover !== null) {
      lastHover = null;
      sendMessage({ type: 'inspectHover', hoverElementId: null });
    }
  }
});

document.addEventListener('mouseout', (event) => {
  if (!inspectConfig.enabled) return;

  setHoveredElement(null);

  if (lastHover !== null) {
    lastHover = null;
    sendMessage({ type: 'inspectHover', hoverElementId: null });
  }
});

function setActiveElement(el) {
  if (el === activeElement) return;

  const prevActive = activeElement;
  activeElement = el;

  if (prevActive) createOrUpdateLabel(prevActive);
  if (activeElement) {
    createOrUpdateLabel(activeElement);
    // We don't know the exact position of the carousel item (because of the carousel animation),
    // so we scroll to the carousel container instead
    if (isCarouselItem(activeElement)) {
      const container = activeElement.closest('[data-editorid="carousel"]');
      scrollToElement(container);
    } else {
      scrollToElement(activeElement);
    }
    handleSpecialElements(activeElement);
  }
}

function setHoveredElement(el) {
  const prevHovered = hoveredElement;
  hoveredElement = el;

  if (prevHovered) createOrUpdateLabel(prevHovered);
  if (hoveredElement) createOrUpdateLabel(hoveredElement);
}

function updateAllLabels() {
  if (activeElement) createOrUpdateLabel(activeElement);
  if (hoveredElement) createOrUpdateLabel(hoveredElement);
}

window.addEventListener('scroll', updateAllLabels);
window.addEventListener('resize', updateAllLabels);

// Positioning functions
function scrollToElement(element) {
  const rect = element.getBoundingClientRect();
  const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

  // Check if element is already fully visible
  if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
    return;
  }

  const margin = 20;
  let targetScrollTop;

  // Check if element can fit entirely in viewport
  if (rect.height <= window.innerHeight - 2 * margin) {
    // Element can fit – center it in viewport
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    targetScrollTop = currentScrollTop + elementCenter - viewportCenter;
  } else {
    // Element is too tall – just scroll to top with margin
    targetScrollTop = currentScrollTop + rect.top - margin;
  }

  window.scrollTo({
    top: targetScrollTop,
    behavior: 'smooth'
  });
}

function findElementInView(id) {
  const elements = document.querySelectorAll(`[data-editorid="${id}"]${isMobileView() ? '' : ':not([data-editormobileonly])'}`);
  if (!elements.length) return null;

  const viewableElements = Array.from(elements).filter(el => isElementViewable(el));
  if (!viewableElements.length) return null;

  const isElementInView = (el) => {
    const rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  const visibleElement = Array.from(viewableElements).find(isElementInView);
  return visibleElement || viewableElements[0];
}

function isElementViewable(element) {
  if (!element) return false;

  if (isCarouselItem(element)) {
    return true;
  }

  // Use checkVisibility if supported
  if ('checkVisibility' in element) {
    return element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  }

  let current = element;
  while (current) {
      const style = window.getComputedStyle(current);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }

      current = current.parentElement;
  }

  return true;
}

// Special elements (carousel etc.)
function handleSpecialElements(element) {
  handleCarousel(element);
}

function isCarouselItem (element) {
  return element.closest('[data-editorid="carousel"]') !== null;
}

function handleCarousel(element) {
  if (!$?.fn?.carousel) return;

  $carousel = $('[data-editorid="carousel"]');
  if (!$carousel.length) return;

  if (!element || element.dataset.editorid === 'carousel' || !element.closest('[data-editorid="carousel"]')) {
    $carousel.carousel('cycle');
  } else {
    element.closest('[data-editorid="carousel"]').querySelectorAll('[data-editorid]').forEach((el, i) => {
      if (el === element) {
        setTimeout(() => {
          $carousel.carousel(i);
          $carousel.carousel('pause');
          $carousel.one('slid.bs.carousel', function() {
            updateAllLabels();
          });
        }, 100);
      }
    });
  }
}

// since the data-editormobileonly is used in Classic theme only, we use the same selector as Classic does. If it
// were to be used elsewhere, more research should be done on how the mobile view is handled in various themes.
function isMobileView() {
	return window.matchMedia('(max-width: 767px)').matches;
}
