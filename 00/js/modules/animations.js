// @ts-check

import { isHTMLElement, ensureEvery } from '../../../shared/js/typeAssertions';

/**
 * Fade in elements with CSS transition.
 * Adds `.fade-in`, then `.start` (double requestAnimationFrame).
 * Removes classes after the given timeout or skips if reduced motion.
 * @param {HTMLElement | ArrayLike<HTMLElement>} el - Element or collection (NodeList, jQuery, …)
 * @param {number} [cleanupMs=900] - Timeout (ms) to remove classes
 */
function fadeIn(el, cleanupMs = 900) {
  if (!el || shoptet.a11y.reducedMotion) return;

  /** @type {HTMLElement[]} */
  const items = isHTMLElement(el) ? [el] : ensureEvery(Array.from(el), isHTMLElement);

  if (!items.length) return;

  items.forEach(node => node.classList.add('fade-in'));

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      items.forEach(node => {
        node.classList.add('start');
        setTimeout(() => node.classList.remove('fade-in', 'start'), cleanupMs);
      });
    });
  });
}

(function (shoptet) {
  shoptet.scripts.libs.animations = ['fadeIn'];

  shoptet.animations = shoptet.animations || {};
  shoptet.scripts.libs.animations.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'animations');
  });
})(shoptet);
