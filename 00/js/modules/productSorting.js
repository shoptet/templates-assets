// @ts-check

import { maybe, ensure, isHTMLElement } from '../../../shared/js/typeAssertions';

const isHTMLButtonElement = value => value instanceof HTMLButtonElement;
const isElement = value => value instanceof Element;
const isNode = value => value instanceof Node;
const isString = value => typeof value === 'string';

/**
 * Unified initProductSorting with a single hook .js-listSorting
 * - everything is searched relative to the root
 * - dropdown mode: root has .listSorting--dropdown
 * - open/close: .listSorting--open on root + aria-expanded on toggle
 */

/** @type {null | (() => void)} */
let unregisterListeners = null;

/**
 * Initializes sorting controls, sets up event listeners.
 * If called again, previous listeners are removed first.
 * @returns {void}
 */
function initProductSorting() {
  const root = maybe(document.querySelector('.js-listSorting'), isHTMLElement);
  if (!root) return;

  unregisterListeners?.();
  unregisterListeners = registerListeners(root);
}

/**
 * @param {HTMLElement} root
 * @returns {() => void} Teardown function
 */
function registerListeners(root) {
  const wrapper = ensure(root.querySelector('.listSorting__controls'), isHTMLElement);

  /** @type {null | (() => void)} */
  let closeDropdown = null;

  /** @param {MouseEvent} e */
  const onClick = e => {
    const t = maybe(e.target, isElement);
    const btn = maybe(t?.closest('.listSorting__control'), isHTMLButtonElement);
    if (!btn || !wrapper.contains(btn)) return;

    if (btn.classList.contains('listSorting__control--current')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    closeDropdown?.();
    sort(btn);
  };
  wrapper.addEventListener('click', onClick);

  /** @type {null | (() => void)} */
  let teardownDropdown = null;

  if (root.classList.contains('listSorting--dropdown')) {
    const toggle = ensure(root.querySelector('.sortingToggle'), isHTMLButtonElement);

    const syncAriaExpanded = () => {
      const isOpen = root.classList.contains('listSorting--open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };
    syncAriaExpanded();

    const openDropdownMenu = () => {
      if (root.classList.contains('listSorting--open')) return;
      root.classList.add('listSorting--open');
      syncAriaExpanded();
    };
    const closeDropdownMenu = () => {
      if (!root.classList.contains('listSorting--open')) return;
      root.classList.remove('listSorting--open');
      syncAriaExpanded();
    };
    closeDropdown = closeDropdownMenu;

    /** @param {MouseEvent} e */
    const onToggleClick = e => {
      e.preventDefault();
      e.stopPropagation();
      root.classList.contains('listSorting--open') ? closeDropdownMenu() : openDropdownMenu();
    };

    /** @param {PointerEvent} e */
    const onDocPointerDown = e => {
      const t = maybe(e.target, isNode);
      if (!t || root.contains(t)) return;
      closeDropdownMenu();
    };

    /** @param {KeyboardEvent} e  */
    const onKeydownEsc = e => {
      if (e.key !== 'Escape') return;
      closeDropdownMenu();
      requestAnimationFrame(() => toggle.focus());
    };

    /** @param {KeyboardEvent} e */
    const onKeydownTabBoundaries = e => {
      if (e.key !== 'Tab') return;
      if (!root.classList.contains('listSorting--open')) return;

      const lastBtn = ensure(root.querySelector('.listSorting__control:last-child'), isHTMLElement);
      const activeElement = document.activeElement;

      if (!e.shiftKey && activeElement === lastBtn) {
        closeDropdownMenu();
        return;
      }
      if (e.shiftKey && activeElement === toggle) {
        closeDropdownMenu();
        return;
      }
    };

    toggle.addEventListener('click', onToggleClick);
    document.addEventListener('pointerdown', onDocPointerDown, { capture: true });
    root.addEventListener('keydown', onKeydownEsc);
    root.addEventListener('keydown', onKeydownTabBoundaries);

    teardownDropdown = () => {
      toggle.removeEventListener('click', onToggleClick);
      document.removeEventListener('pointerdown', onDocPointerDown, { capture: true });
      root.removeEventListener('keydown', onKeydownEsc);
      root.removeEventListener('keydown', onKeydownTabBoundaries);
    };
  }

  return () => {
    wrapper.removeEventListener('click', onClick);
    teardownDropdown?.();
  };
}

/**
 * Activates sorting by making an AJAX request to the URL specified in the button's data-url attribute.
 * Triggers a loading announcer for screen readers during the request.
 * After the request, re-initializes sorting controls and focuses the appropriate element.
 * @param {HTMLButtonElement} btn
 * @returns {void}
 */
function sort(btn) {
  const url = ensure(btn.dataset.url, isString);

  const products = maybe(document.querySelector('#products') || document.querySelector('.products'), isHTMLElement);
  const loadingAnnouncer = shoptet.screenReader.createLoadingAnnouncer({
    finalMessage: shoptet.messages['productsSorted'],
  });
  products ? loadingAnnouncer.begin(products) : loadingAnnouncer.begin();

  const callback = () => {
    initProductSorting();
    loadingAnnouncer.end();

    const freshRoot = maybe(document.querySelector('.js-listSorting'), isHTMLElement);
    if (!freshRoot) return;

    const freshToggle = maybe(freshRoot.querySelector('.sortingToggle'), isHTMLButtonElement);
    if (freshToggle) {
      requestAnimationFrame(() => freshToggle.focus());
    } else {
      const freshCurrentBtn = ensure(freshRoot.querySelector('.listSorting__control--current'), isHTMLElement);
      requestAnimationFrame(() => freshCurrentBtn.focus());
    }
  };

  unregisterListeners?.();

  // @ts-expect-error Shoptet global functions are not defined yet.
  window.makeFilterAjaxRequest(url, true, callback, btn, 'ShoptetPageSortingChanged');
}

//  @ts-expect-error Shoptet object is not defined yet.
if (shoptet.config.ums_a11y_category_page) {
  document.addEventListener('DOMContentLoaded', () => {
    initProductSorting();
  });

  (function (shoptet) {
    shoptet.productSorting = shoptet.productSorting || {};
    shoptet.scripts.libs.productSorting.forEach(fnName => {
      const fn = eval(fnName);
      shoptet.scripts.registerFunction(fn, 'productSorting');
    });
    //  @ts-expect-error Shoptet object is not defined yet.
  })(shoptet);
}
