// @ts-check
/// <reference path="../../../types.d.ts" />

import { ensure, isHTMLButtonElement, isHTMLElement, maybe, typedKeys } from '../../../shared/js/typeAssertions';

const TOOLTIP_BUTTON_SELECTOR = '.show-tooltip_new';
const TOOLTIP_QUESTION_BUTTON_SELECTOR = '.question-tooltip_new';
const TOOLTIP_CONTENT_ATTRIBUTE = 'data-title';
const TOOLTIP_ORIG_CONTENT_ATTRIBUTE = 'title';
const TOOLTIP_BUBBLE_ID = 'tooltip_bubble';
const TOOLTIP_BUBBLE_CLASS = 'tooltip_bubble';
const TOOLTIP_BUBBLE_CLASS_HIDDEN = 'tooltip_bubble--hidden';
const TOOLTIP_BUBBLE_CLASS_VISIBLE = 'tooltip_bubble--visible';
const TOOLTIP_BUBBLE_CONTENT_CLASS = 'tooltip_bubble__content';
const TOOLTIP_BUBBLE_ARROW_CLASS = 'tooltip_bubble__arrow';

/** @type {HTMLElement|null} */
let tooltipBubbleElement = null;
/** @type {HTMLButtonElement|null} */
let openTrigger = null;
/** @type {ReturnType<typeof setTimeout> | undefined} */
let tooltipTimeoutId;

/** @type {(button: HTMLButtonElement) => void} */
function positionTooltip(button) {
  const tooltipBubble = getTooltipBubble();
  const tooltipBubbleArrow = ensure(tooltipBubble.getElementsByClassName(TOOLTIP_BUBBLE_ARROW_CLASS)[0], isHTMLElement);

  const rect = button.getBoundingClientRect();
  const elementWidth = rect.width;
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const gap = 8;

  const tooltipRect = tooltipBubble.getBoundingClientRect();

  let top = rect.top + scrollY - tooltipRect.height - gap;
  let left = rect.left + scrollX + elementWidth / 2 - tooltipRect.width / 2;
  let arrowPosition = 'bottom';
  let arrowLeft = '50%';

  if (top < scrollY) {
    top = rect.bottom + scrollY + gap;
    arrowPosition = 'top';
  }

  if (left < 0) {
    left = 10;
    arrowLeft = `${rect.left + scrollX + elementWidth / 2 - 10}px`;
  }
  const maxLeft = scrollX + document.documentElement.clientWidth - tooltipRect.width - 10;
  if (left > maxLeft) {
    left = maxLeft;
    arrowLeft = `${rect.left + scrollX + elementWidth / 2 - left}px`;
  }

  tooltipBubble.style.setProperty('--tooltip-bubble-top-position', `${top}px`);
  tooltipBubble.style.setProperty('--tooltip-bubble-left-position', `${left}px`);
  tooltipBubbleArrow.style.setProperty(
    '--tooltip-bubble-arrow-top-position',
    arrowPosition === 'top' ? '-10px' : '100%'
  );
  tooltipBubbleArrow.style.setProperty('--tooltip-bubble-arrow-left-position', arrowLeft);
  tooltipBubbleArrow.style.setProperty(
    '--tooltip-bubble-arrow-transform',
    `translateX(-50%)${arrowPosition === 'top' ? ' rotate(180deg)' : ''}`
  );
}

/** @type {ShoptetFunction<"tooltips", "showTooltip">} */
function showTooltip(button, announceToScreenReader = false) {
  const tooltipBubble = getTooltipBubble();

  const content = button.getAttribute(TOOLTIP_CONTENT_ATTRIBUTE);
  if (!content) return;

  clearTimeout(tooltipTimeoutId);

  if (openTrigger !== button) {
    hideTooltip(true);

    updateTooltipBubbleContent(content);
    tooltipBubble.classList.remove(TOOLTIP_BUBBLE_CLASS_HIDDEN);

    if (announceToScreenReader) {
      shoptet.screenReader?.announceToScreenReader?.(content);
    }
    tooltipBubble.classList.add(TOOLTIP_BUBBLE_CLASS_VISIBLE);
    openTrigger = button;
  }

  requestAnimationFrame(() => {
    positionTooltip(button);
  });
}

/** @type {ShoptetFunction<"tooltips", "hideTooltip">} */
function hideTooltip(force = false) {
  const tooltipBubble = getTooltipBubble();

  if (force) {
    tooltipBubble.classList.add(TOOLTIP_BUBBLE_CLASS_HIDDEN);
    finish();
  } else {
    tooltipTimeoutId = setTimeout(() => {
      finish();
      tooltipBubble.classList.add(TOOLTIP_BUBBLE_CLASS_HIDDEN);
    }, 600);
  }

  function finish() {
    updateTooltipBubbleContent('');
    tooltipBubble.classList.remove(TOOLTIP_BUBBLE_CLASS_VISIBLE);
    openTrigger = null;
  }
}

/** @type {ShoptetFunction<"tooltips", "updateTooltipBubbleContent">} */
function updateTooltipBubbleContent(newContent) {
  const tooltipBubble = getTooltipBubble();

  const contentElement = tooltipBubble.getElementsByClassName(TOOLTIP_BUBBLE_CONTENT_CLASS)[0];
  if (contentElement) {
    contentElement.textContent = newContent;
  }
}

/** @type {ShoptetFunction<"tooltips", "repositionTooltipBubble">} */
function repositionTooltipBubble() {
  if (openTrigger) {
    positionTooltip(openTrigger);
  }
}

function createTooltipBubble() {
  const tooltipBubbleContent = document.createElement('div');
  tooltipBubbleContent.className = TOOLTIP_BUBBLE_CONTENT_CLASS;
  tooltipBubbleContent.dataset.testid = 'tooltipText';

  const tooltipBubbleArrow = document.createElement('div');
  tooltipBubbleArrow.className = TOOLTIP_BUBBLE_ARROW_CLASS;

  const tooltipBubble = document.createElement('div');
  tooltipBubble.id = TOOLTIP_BUBBLE_ID;
  tooltipBubble.classList.add(TOOLTIP_BUBBLE_CLASS, TOOLTIP_BUBBLE_CLASS_HIDDEN);
  tooltipBubble.role = 'tooltip';
  tooltipBubble.dataset.testid = 'tooltip';
  tooltipBubble.append(tooltipBubbleContent);
  tooltipBubble.append(tooltipBubbleArrow);

  document.body.append(tooltipBubble);
  tooltipBubbleElement = tooltipBubble;
  return tooltipBubble;
}

function getTooltipBubble() {
  return tooltipBubbleElement ?? createTooltipBubble();
}

/** @type {ShoptetFunction<"tooltips", "initTooltips">} */
function initTooltips() {
  const tooltipBubble = getTooltipBubble();

  const tooltips = document.querySelectorAll(TOOLTIP_BUTTON_SELECTOR);
  tooltips.forEach(button => {
    const origContent = button.getAttribute(TOOLTIP_ORIG_CONTENT_ATTRIBUTE);
    if (origContent) {
      button.setAttribute(TOOLTIP_CONTENT_ATTRIBUTE, origContent);
      button.removeAttribute(TOOLTIP_ORIG_CONTENT_ATTRIBUTE);
    }

    const buttonType = button.getAttribute('type');
    if (!buttonType) {
      button.setAttribute('type', 'button');
    }

    if (button.matches(TOOLTIP_QUESTION_BUTTON_SELECTOR)) {
      const ariaLabel = button.getAttribute('aria-label');
      if (!ariaLabel) {
        button.setAttribute('aria-label', shoptet.messages.moreInfo);
      }
    }
  });

  document.addEventListener('mouseover', event => {
    const element = maybe(event.target, isHTMLButtonElement);
    if (!element || !element.matches(TOOLTIP_BUTTON_SELECTOR)) return;

    showTooltip(element);
  });

  document.addEventListener('mouseout', event => {
    const element = maybe(event.target, isHTMLButtonElement);
    if (!element || !element.matches(TOOLTIP_BUTTON_SELECTOR)) return;

    hideTooltip();
  });

  document.addEventListener('focusout', event => {
    const element = maybe(event.target, isHTMLButtonElement);
    if (!element || !element.matches(TOOLTIP_BUTTON_SELECTOR)) return;

    hideTooltip(true);
  });

  document.addEventListener('click', event => {
    const element = maybe(event.target, isHTMLButtonElement);
    if (!element || !element.matches(TOOLTIP_BUTTON_SELECTOR)) return;

    if (openTrigger === element) {
      hideTooltip(true);
    } else {
      showTooltip(element, true);
    }
  });

  document.addEventListener('keydown', event => {
    if ((event.key === 'Escape' || event.key === 'Esc') && openTrigger) hideTooltip(true);
  });

  tooltipBubble.addEventListener('mouseover', () => {
    clearTimeout(tooltipTimeoutId);
  });

  tooltipBubble.addEventListener('mouseout', () => {
    hideTooltip();
  });

  window.addEventListener('resize', repositionTooltipBubble);
}

/*
TODO: Uncomment this after the jQuery tooltips are removed from the codebase.
document.addEventListener('DOMContentLoaded', () => {
  initTooltips();
});

(shoptet => {
  $.fn.tooltip = function () {
    shoptet.dev?.deprecated?.(
      '2026-12-31',
      '$.fn.tooltip',
      undefined,
      'Use one of the shoptet.tooltips function instead.'
    );
    return this;
  };
  window.initTooltips = () => {
    shoptet.dev?.deprecated?.('2026-12-31', 'window.initTooltips()', 'shoptet.tooltips.initTooltips()');
    initTooltips();
  };
  window.fixTooltipAfterChange = el => {
    const content = el.dataset.originalTitle || el.title || '';
    shoptet.dev?.deprecated?.(
      '2026-12-31',
      'window.fixTooltipAfterChange(el)',
      'shoptet.tooltips.updateTooltipBubbleContent(content)'
    );
    if (content) {
      updateTooltipBubbleContent(content);
    }
  };

  const functionsMap = {
    initTooltips: initTooltips,
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    updateTooltipBubbleContent: updateTooltipBubbleContent,
    repositionTooltipBubble: repositionTooltipBubble,
  };

  shoptet.tooltips ??= {};
  shoptet.scripts.libs.tooltips = typedKeys(functionsMap);
  shoptet.scripts.libs.tooltips.forEach(fnName => {
    const fn = functionsMap[fnName];
    shoptet.scripts.registerFunction(fn, 'tooltips');
  });
})(shoptet);
*/
