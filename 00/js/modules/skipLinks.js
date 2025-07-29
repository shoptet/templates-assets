// @ts-check

import { ensureEvery } from '../../../shared/js/typeAssertions.js';

const isHTMLAnchorElement = value => value instanceof HTMLAnchorElement;

let unregisterListeners = null;

/**
 * Find skip links and their target elements.
 * @returns {{
 *   startLinks: HTMLAnchorElement[],
 *   endLinks: HTMLAnchorElement[],
 *   targets: HTMLElement[]
 * } | null}
 */
function getSkipLinksAndTargets() {
  const startLinks = ensureEvery(Array.from(document.querySelectorAll('.js-skip-link--start')), isHTMLAnchorElement);
  const endLinks = ensureEvery(Array.from(document.querySelectorAll('.js-skip-link--end')), isHTMLAnchorElement);

  if (!startLinks.length && !endLinks.length) return null;

  const allLinks = [...startLinks, ...endLinks];
  const targets = allLinks
    .map(link => {
      const href = link.getAttribute('href') || '';
      const id = href.startsWith('#') ? href.slice(1) : '';
      const target = document.getElementById(id);
      if (!target) {
        console.warn(`Skip link target not found for href: ${href}`);
      }
      return target;
    })
    .filter(el => el !== null);

  return { startLinks, endLinks, targets };
}

/**
 * Toggle skip link visibility and tabindex depending on navigation direction.
 * @param {boolean} goingBackward
 * @param {HTMLAnchorElement[]} startLinks
 * @param {HTMLAnchorElement[]} endLinks
 */
function toggleSkipLinkVisibility(goingBackward, startLinks, endLinks) {
  startLinks.forEach(link => {
    link.hidden = goingBackward;
    link.tabIndex = goingBackward ? -1 : 0;
  });

  endLinks.forEach(link => {
    link.hidden = !goingBackward;
    link.tabIndex = goingBackward ? 0 : -1;
  });
}

/**
 * Register event listeners and return a cleanup function.
 * @param {HTMLAnchorElement[]} startLinks
 * @param {HTMLAnchorElement[]} endLinks
 * @param {HTMLElement[]} targets
 * @returns {() => void}
 */
function registerListeners(startLinks, endLinks, targets) {
  /** @param {KeyboardEvent} e */
  const onKeyDown = e => {
    if (e.key === 'Tab') {
      toggleSkipLinkVisibility(e.shiftKey, startLinks, endLinks);
    }
  };

  const onFocus = () => {
    // @ts-expect-error Shoptet object is not defined yet.
    shoptet.screenReader.announceToScreenReader(shoptet.messages['skipped']);
  };

  document.addEventListener('keydown', onKeyDown);
  targets.forEach(target => target.addEventListener('focus', onFocus));

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    targets.forEach(target => target.removeEventListener('focus', onFocus));
  };
}

/**
 * Initialize skip links functionality (safe to call repeatedly).
 */
function initSkipLinks() {
  unregisterListeners?.();

  const elements = getSkipLinksAndTargets();
  if (!elements) return;

  toggleSkipLinkVisibility(false, elements.startLinks, elements.endLinks);
  unregisterListeners = registerListeners(elements.startLinks, elements.endLinks, elements.targets);
}

document.addEventListener('DOMContentLoaded', initSkipLinks);

(function (shoptet) {
  shoptet.skipLinks = shoptet.skipLinks || {};
  shoptet.scripts.libs.skipLinks.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'skipLinks');
  });
  // @ts-expect-error Shoptet object is not defined yet.
})(shoptet);
