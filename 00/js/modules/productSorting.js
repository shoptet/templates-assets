// @ts-check

import { ensure, ensureEvery } from '../../../shared/js/typeAssertions';

const isString = item => typeof item === 'string';
const isHTMLElement = item => item instanceof HTMLElement;
const isHTMLInputElement = item => item instanceof HTMLInputElement;
const isHTMLLabelElement = item => item instanceof HTMLLabelElement;

/** @type {(() => void) | null} */
let unregisterListeners = null;

/**
 * This function initializes the sorting of products.
 */
function initProductSorting() {
  const isDropdown = !!document.querySelector('#category-header .dropdown input');
  unregisterListeners = registerListeners(isDropdown);
}

/**
 * This function registers the listeners for product sorting.
 * @param {boolean} isDropdown Indicates if the dropdown is used.
 * @returns {() => void} The function to unregister the listeners.
 */
function registerListeners(isDropdown) {
  const inputs = ensureEvery(
    Array.from(document.querySelectorAll('#category-header input[type="radio"]')),
    isHTMLInputElement
  );

  /**
   * This function handles the keydown event.
   * @param {KeyboardEvent} event The keydown event.
   */
  const keyDownHandler = event => {
    const input = ensure(event.target, isHTMLInputElement);

    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation();
      event.preventDefault();
      sort(input, isDropdown);
    }
  };

  /**
   * This function handles the click event.
   * @param {MouseEvent} event The click event.
   */
  const clickHandler = event => {
    const label = ensure(event.target, isHTMLLabelElement);
    const input = ensure(document.querySelector(`#${label.htmlFor}`), isHTMLInputElement);
    sort(input, isDropdown);
  };

  inputs.forEach(input => {
    const label = ensure(document.querySelector(`label[for="productSorting_${input.value}"]`), isHTMLLabelElement);
    label.addEventListener('click', clickHandler);
    input.addEventListener('keydown', keyDownHandler);
  });

  return () => {
    inputs.forEach(input => {
      const label = ensure(document.querySelector(`label[for="productSorting_${input.value}"]`), isHTMLLabelElement);
      label.removeEventListener('click', clickHandler);
      input.removeEventListener('keydown', keyDownHandler);
    });
  };
}

/**
 * This function sorts the products based on the selected sorting.
 * @param {HTMLInputElement} input The input element that was activated.
 * @param {boolean} isDropdown Indicates if the dropdown is used.
 */
function sort(input, isDropdown) {
  const url = ensure(input.dataset.url, isString);

  const callback = () => {
    if (isDropdown) {
      ensure(document.querySelector('.js-product-sorting'), isHTMLElement).focus();
    } else {
      ensure(document.querySelector(`#category-header #productSorting_${input.value}`), isHTMLInputElement).focus();
    }
  };

  unregisterListeners?.();
  //  @ts-expect-error Shoptet global functions are not defined yet.
  window.makeFilterAjaxRequest(url, true, callback, input, 'ShoptetPageSortingChanged');
}
//  @ts-expect-error Shoptet gobject is not defined yet.
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
    //  @ts-expect-error Shoptet gobject is not defined yet.
  })(shoptet);
}
