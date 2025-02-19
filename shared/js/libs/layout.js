// @ts-check

import { ensure } from '../typeAssertions';

(function (shoptet) {
  const isNumber = value => typeof value === 'number';

  /** @type {{vh?: number, scrollBarWidth?: number, detectResolution?: Record<number, boolean>}} */
  const state = {
    vh: undefined,
    scrollBarWidth: undefined,
    detectResolution: undefined,
  };

  /**
   * Clear cache for a given key
   *
   * @param {keyof state} key - Key to clear cache for
   * @returns {void}
   */
  function clearCache(key) {
    if (!Object.keys(state).includes(key)) {
      throw new Error(
        `[clearCache Error]: Invalid key. Key must be one of the following: ${Object.keys(state).join(', ')}`
      );
    }
    state[key] = undefined;
  }

  /**
   * Detect width of system scrollbars
   *
   * @returns {number} - Width of system scrollbars in pixels
   */
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

  /**
   * Detect height of viewport
   *
   * @returns {number} - Height of the hundredth of the viewport in pixels
   */
  function getViewHeight() {
    const cache = state.vh;
    if (cache !== undefined) {
      return cache;
    }
    state.vh = window.innerHeight / 100;

    return state.vh;
  }

  /**
   * Detect width of display
   *
   * @param {Number} resolution - Value in pixels we want to test
   * @returns {boolean} - True if current resolution is bigger than the value
   */
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

  document.documentElement.style.setProperty('--scrollbar-width', `${getScrollBarWidth()}px`);
  document.documentElement.style.setProperty('--vh', `${getViewHeight()}px`);

  shoptet.layout = shoptet.layout || {};
  shoptet.layout.clearCache = clearCache;
  shoptet.layout.getScrollBarWidth = getScrollBarWidth;
  shoptet.layout.getViewHeight = getViewHeight;
  shoptet.layout.detectResolution = detectResolution;

  // Backward compatibility for Shoptet Partners
  window.getScrollBarWidth = getScrollBarWidth;
  window.getViewHeight = getViewHeight;
  window.detectResolution = detectResolution;
})(shoptet);
