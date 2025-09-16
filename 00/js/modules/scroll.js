// @ts-check

import { isHTMLElement, ensure } from '../../../shared/js/typeAssertions';

/**
 * Smoothly scrolls the page to a target element (an HTMLElement or the first item of a jQuery collection), respects prefers-reduced-motion, temporarily sets --scroll-extra-offset from .messages .msg, and restores it after scrolling.
 *
 * @param {HTMLElement | {jquery: any, length: number, 0?: HTMLElement}} $el - Target element or a jQuery collection containing it.
 *   If empty or invalid, the function exits without action.
 * @returns {void}
 */
function scrollToEl($el) {
  const raw = $el && typeof $el === 'object' && 'jquery' in $el ? $el[0] : $el;
  const el = ensure(raw, isHTMLElement);

  const msg = document.querySelector('.messages .msg');
  const messageHeight = msg?.getBoundingClientRect().height || 0;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--scroll-extra-offset', `${messageHeight + 10}px`);

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = prefersReduced ? 'auto' : 'smooth';

  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior, block: 'start', inline: 'nearest' });
    setTimeout(() => rootStyle.removeProperty('--scroll-extra-offset'), prefersReduced ? 0 : 700);
  });
}

// Backward compatibility
window.scrollToEl = scrollToEl;

(function (shoptet) {
  shoptet.scripts.libs.scroll = ['scrollToEl'];

  shoptet.scroll = shoptet.scroll || {};
  shoptet.scripts.libs.scroll.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'scroll');
  });
})(shoptet);
