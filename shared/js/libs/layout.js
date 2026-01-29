// @ts-check
/// <reference path="../../../types.d.ts" />

import { ensure, isNumber } from '../typeAssertions';

/** @type {ShoptetLayoutState} */
const state = {
  vh: undefined,
  scrollBarWidth: undefined,
  detectResolution: undefined,
  showApplePay: undefined,
};

/** @type {ShoptetType<"layout", "clearCache">} */
function clearCache(key) {
  if (!Object.keys(state).includes(key)) {
    throw new Error(
      `[clearCache Error]: Invalid key. Key must be one of the following: ${Object.keys(state).join(', ')}`
    );
  }
  state[key] = undefined;
}

/** @type {ShoptetType<"layout", "getScrollBarWidth">} */
function getScrollBarWidth() {
  const cache = state.scrollBarWidth;
  if (cache !== undefined) {
    return cache;
  }
  const outer = document.createElement('div');
  const inner = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.appendChild(inner);
  document.documentElement.appendChild(outer);
  state.scrollBarWidth = outer.offsetWidth - inner.offsetWidth;
  document.documentElement.removeChild(outer);

  return state.scrollBarWidth;
}

/** @type {ShoptetType<"layout", "getViewHeight">} */
function getViewHeight() {
  const cache = state.vh;
  if (cache !== undefined) {
    return cache;
  }
  state.vh = window.innerHeight / 100;

  return state.vh;
}

/** @type {ShoptetType<"layout", "detectResolution">} */
function detectResolution(resolution) {
  ensure(resolution, isNumber);
  const cache = state.detectResolution?.[resolution];
  if (cache !== undefined) {
    return cache;
  }
  state.detectResolution = state.detectResolution || {};
  state.detectResolution[resolution] = window.innerWidth + getScrollBarWidth() > resolution;

  return state.detectResolution[resolution];
}

/** @type {ShoptetType<"layout", "showApplePay">} */
function showApplePay() {
  const cache = state.showApplePay;
  if (cache !== undefined) {
    return cache;
  }

  try {
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      state.showApplePay = true;
    } else {
      state.showApplePay = false;
    }
  } catch {
    state.showApplePay = false;
  }

  return state.showApplePay;
}

document.documentElement.style.setProperty('--scrollbar-width', `${getScrollBarWidth()}px`);
document.documentElement.style.setProperty('--vh', `${getViewHeight()}px`);

if (showApplePay()) {
  document.documentElement.classList.add('apple-pay-available');
}

shoptet.layout ??= /** @type {Shoptet["layout"]} */ ({});
shoptet.layout.clearCache = clearCache;
shoptet.layout.getScrollBarWidth = getScrollBarWidth;
shoptet.layout.getViewHeight = getViewHeight;
shoptet.layout.detectResolution = detectResolution;
shoptet.layout.showApplePay = showApplePay;

// Backward compatibility for Shoptet Partners
window.getScrollBarWidth = function () {
  shoptet.dev.deprecated('2026-12-31', 'window.getScrollBarWidth()', 'shoptet.layout.getScrollBarWidth()');
  return shoptet.layout.getScrollBarWidth();
};
window.getViewHeight = function () {
  shoptet.dev.deprecated('2026-12-31', 'window.getViewHeight()', 'shoptet.layout.getViewHeight()');
  return shoptet.layout.getViewHeight();
};
window.detectResolution = function (resolution) {
  shoptet.dev.deprecated(
    '2026-12-31',
    'window.detectResolution(resolution)',
    'shoptet.layout.detectResolution(resolution)'
  );
  return shoptet.layout.detectResolution(resolution);
};
