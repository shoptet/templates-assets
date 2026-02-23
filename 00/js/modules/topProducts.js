// @ts-check

/**
 * @typedef {Object} TopProductContext
 * @property {HTMLElement} wrapper - Section wrapper
 * @property {HTMLElement[]} products - List of product elements
 * @property {HTMLButtonElement} toggleButton - Toggle button for showing more products
 * @property {number} defaultVisibleCount - Number of products visible by default
 */

import { ensureEvery, maybe } from '../../../shared/js/typeAssertions';

const isHTMLElement = value => value instanceof HTMLElement;
const isHTMLButtonElement = value => value instanceof HTMLButtonElement;

let unregisterListeners = null;

/**
 * Finds and validates all DOM elements needed for top products block.
 * @returns {Omit<TopProductContext, 'defaultVisibleCount'> | null}
 */
function getTopProductElements() {
  const productContainer = maybe(document.getElementById('productsTop'), isHTMLElement);
  const wrapper = maybe(productContainer?.closest('.products-top-wrapper'), isHTMLElement);
  const toggleButton = maybe(wrapper?.querySelector('.toggle-top-products'), isHTMLButtonElement);
  if (!productContainer || !wrapper || !toggleButton) return null;

  const products = ensureEvery(Array.from(productContainer.querySelectorAll('.product')), isHTMLElement);

  return { wrapper, products, toggleButton };
}

/**
 * Updates visibility state of top products block based on expanded state and screen size.
 * Adds appropriate classes and a11y attributes.
 * @param {TopProductContext} context
 */
function updateTopProductsState({ wrapper, products, toggleButton, defaultVisibleCount }) {
  const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
  const isSmallScreen = !shoptet.layout.detectResolution(shoptet.config.breakpoints.lg);

  products.forEach((product, index) => {
    product.classList.remove('active', 'inactive', 'revealed');

    const shouldBeActive = isSmallScreen ? index < 2 : index < defaultVisibleCount;
    const shouldBeRevealed = !shouldBeActive && isExpanded;
    const productName = product.querySelector('.name');

    if (shouldBeActive) {
      product.classList.add('active');
      product.setAttribute('aria-hidden', 'false');
      if (productName) productName.removeAttribute('tabindex');
    } else if (shouldBeRevealed) {
      product.classList.add('revealed');
      product.setAttribute('aria-hidden', 'false');
      if (productName) productName.removeAttribute('tabindex');
    } else {
      product.classList.add('inactive');
      product.setAttribute('aria-hidden', 'true');
      if (productName) productName.setAttribute('tabindex', '-1');
    }
  });

  const hasInactive = products.some(p => p.classList.contains('inactive'));
  const hasRevealed = products.some(p => p.classList.contains('revealed'));

  wrapper.classList.toggle('has-inactive', hasInactive);
  wrapper.classList.toggle('has-revealed', hasRevealed);
}

/**
 * Handles the toggle button click to expand/collapse additional products.
 * @param {TopProductContext} context
 */
function handleToggleClick({ wrapper, products, toggleButton, defaultVisibleCount }) {
  const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
  const newExpanded = !isExpanded;

  const labelShow = toggleButton.dataset.labelShow || '';
  const labelHide = toggleButton.dataset.labelHide || '';

  toggleButton.setAttribute('aria-expanded', String(newExpanded));
  toggleButton.textContent = newExpanded ? labelHide : labelShow;

  updateTopProductsState({ wrapper, products, toggleButton, defaultVisibleCount });

  if (newExpanded) {
    const firstRevealed = products.find(p => p.classList.contains('revealed'));
    const focusTarget = firstRevealed?.querySelector('.name');
    if (focusTarget instanceof HTMLElement) {
      setTimeout(() => focusTarget.focus(), 50);
    }
  } else {
    toggleButton.focus();
    toggleButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Registers all listeners needed for top products toggle.
 * Returns a cleanup function that removes those listeners to prevent duplication.
 * @param {TopProductContext} context
 * @returns {() => void} - Cleanup function to remove event listeners
 */
function registerTopProductsListeners({ wrapper, products, toggleButton, defaultVisibleCount }) {
  const onClick = () => handleToggleClick({ wrapper, products, toggleButton, defaultVisibleCount });
  const onResize = () => updateTopProductsState({ wrapper, products, toggleButton, defaultVisibleCount });

  toggleButton.addEventListener('click', onClick);
  document.addEventListener('resizeEnd', onResize);

  return () => {
    toggleButton.removeEventListener('click', onClick);
    document.removeEventListener('resizeEnd', onResize);
  };
}

/**
 * Initializes top products block: visibility logic, toggle behavior, a11y.
 * Can be safely called multiple times — previous event listeners are removed before reinitialization.
 */
function initTopProducts() {
  unregisterListeners?.();

  const els = getTopProductElements();
  if (!els) return;

  const firstInactiveIndex = els.products.findIndex(product => !product.classList.contains('active'));
  const defaultVisibleCount = firstInactiveIndex === -1 ? els.products.length : firstInactiveIndex;

  updateTopProductsState({ ...els, defaultVisibleCount });
  unregisterListeners = registerTopProductsListeners({ ...els, defaultVisibleCount });
}

document.addEventListener('DOMContentLoaded', initTopProducts);

(function (shoptet) {
  shoptet.topProducts = shoptet.topProducts || {};
  shoptet.scripts.libs.topProducts.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'topProducts');
  });
  //  @ts-expect-error Shoptet object is not defined yet.
})(shoptet);
