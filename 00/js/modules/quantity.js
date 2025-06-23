// @ts-check

(function (shoptet) {
  /**
   * Increase/decrease quantity of products in input by buttons next to it
   * Min and max values are passed by native attributes
   * Decimals are passed by data-attributes
   * @param {HTMLInputElement} el input field that have to be updated
   * @param {number | undefined} min minimum allowed amount
   * @param {number | undefined} max maximum allowed amount
   * @param {number | undefined} decimals allowed decimal places
   * @param {'increase' | 'decrease'} action accepts 'increase' or 'decrease'
   * @param {() => void} [callback] optional callback after quantity update (optional)
   * @returns {boolean}
   */
  function updateQuantity(el, min, max, decimals, action, callback) {
    let value = shoptet.helpers.toFloat(el.value);
    if (isNaN(value)) return false;

    const safeDecimals = shoptet.helpers.toFloat(decimals ?? 0);
    const safeMin = shoptet.helpers.toFloat(min ?? shoptet.helpers.resolveMinimumAmount(decimals));
    const safeMax = shoptet.helpers.toFloat(max ?? shoptet.config.defaultProductMaxAmount);
    const step = shoptet.helpers.toFloat(el.getAttribute('step') || '1');

    let quantity = shoptet.helpers.toFloat(el.dataset.quantity || '');
    let diff = quantity - value;

    value = calculateQuantity(value, step, safeDecimals, action);

    if (!isNaN(quantity)) {
      quantity = calculateQuantity(quantity, step, safeDecimals, action);
      value = quantity;
    }

    if (value < safeMin) {
      if (action === 'decrease') {
        announceQuantityLimits(el, 'decrease');
        return false;
      }
      value = safeMin;
    } else if (value > safeMax) {
      if (action === 'increase') {
        announceQuantityLimits(el, 'increase');
        return false;
      }
      value = safeMax;
    } else {
      shoptet.variantsCommon.hideQuantityTooltips();
    }

    if (!isNaN(quantity)) {
      $(el).attr('data-quantity', quantity);
      value = quantity - diff;
    }

    shoptet.screenReader.announceToScreenReader(`${shoptet.messages['newQuantity']} ${value}`);
    el.value = value.toFixed(safeDecimals);

    if (typeof callback === 'function') callback();
    return true;
  }

  /**
   * Calculate new quantity based on action
   *
   * @param {number} value - current value
   * @param {number} step - step size for increasing/decreasing
   * @param {number} decimals - allowed decimal places
   * @param {'increase'|'decrease'} action - accepts 'increase' or 'decrease'
   * @returns {number} - new value
   */
  function calculateQuantity(value, step, decimals, action) {
    value = shoptet.helpers.toFloat((action === 'increase' ? value + step : value - step).toFixed(decimals));
    return value;
  }

  /**
   * Announce quantity limits via tooltip and screen reader
   *
   * @param {HTMLInputElement} el - input element
   * @param {'increase'|'decrease'} action - action type
   * @returns {void}
   */
  function announceQuantityLimits(el, action) {
    if (!el) return;
    const $el = $(el);

    const container = $el.closest('.quantity');
    if (!container.length) return;

    let tooltipElement;
    if (action === 'decrease') {
      tooltipElement = container.find('.js-decrease-tooltip');
    } else if (action === 'increase') {
      tooltipElement = container.find('.js-increase-tooltip');
    } else {
      return;
    }

    if (!tooltipElement.length) return;
    tooltipElement.tooltip?.('show');

    const tooltipText = tooltipElement.attr('data-original-title') || '';
    const inputValue = el.value;
    setTimeout(() => {
      shoptet.screenReader.announceToScreenReader(
        `${tooltipText} ${shoptet.messages['currentQuantity']} ${inputValue}`,
        'assertive'
      );
    }, 0);
  }

  /**
   * Enforces minimum and maximum quantity limits for quantity input field and announces the changes to screen readers.
   *
   * This function validates the entered quantity, ensuring it falls within defined minimum and maximum limits.
   * If the value is invalid or outside the allowed range, it adjusts the input field accordingly and provides
   * feedback via screen reader announcements. It also manages tooltips related to quantity limits.
   * Used when adjusting quantity using the ArrowUp and ArrowDown keys or when applied in quantity discounts.
   *
   * @param {HTMLInputElement} el - The input element representing the quantity field.
   * @param {Event} event - The event that triggered the function (typically an 'input' event).
   *
   * @returns {void} - This function does not return anything
   */
  function enforceAndAnnounceLimits(el, event) {
    const eventInputType = event instanceof InputEvent ? event.inputType : '';
    const decimals = Number(el.dataset.decimals || 0);
    const min = shoptet.helpers.toFloat(el.min ?? shoptet.helpers.resolveMinimumAmount(decimals));
    const max = shoptet.helpers.toFloat(el.max ?? shoptet.config.defaultProductMaxAmount);
    let value = el.value === '' ? NaN : shoptet.helpers.toFloat(el.value);

    if (isNaN(value)) {
      const quantityRangeText = shoptet.messages['quantityRange'].replace('%1', min).replace('%2', max);
      shoptet.screenReader.announceToScreenReader(quantityRangeText);
    } else {
      shoptet.screenReader.announceToScreenReader(`${shoptet.messages['newQuantity']} ${value}`);
      if (value <= min) {
        value = min;
        announceQuantityLimits(el, 'decrease');
      } else if (value >= max) {
        value = max;
        announceQuantityLimits(el, 'increase');
      }

      if (!(eventInputType == 'insertText' || eventInputType == 'deleteContentBackward')) {
        el.value = value.toFixed(decimals);
      }
    }

    if (value === min || value === max) {
      setTimeout(() => {
        shoptet.variantsCommon.hideQuantityTooltips();
      }, 5000);
    } else if (value > min && value < max) {
      shoptet.variantsCommon.hideQuantityTooltips();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('input', event => {
      if (!(event.target instanceof HTMLInputElement) || !event.target.classList.contains('amount')) return;
      enforceAndAnnounceLimits(event.target, event);
    });
  });

  shoptet.scripts.libs.quantity = ['updateQuantity', 'announceQuantityLimits', 'enforceAndAnnounceLimits'];

  shoptet.helpers.updateQuantity = (el, min, max, decimals, action, callback) => {
    shoptet.dev.deprecated(
      '2025-12-31',
      'shoptet.helpers.updateQuantity(el, min, max, decimals, action, callback)',
      'shoptet.quantity.updateQuantity(el, min, max, decimals, action, callback)'
    );
    return shoptet.quantity.updateQuantity(el, min, max, decimals, action, callback);
  };

  shoptet.helpers.announceQuantityLimits = (el, action) => {
    shoptet.dev.deprecated(
      '2025-12-31',
      'shoptet.helpers.announceQuantityLimits(el, action)',
      'shoptet.quantity.announceQuantityLimits(el, action)'
    );
    return shoptet.quantity.announceQuantityLimits(el, action);
  };

  shoptet.helpers.enforceAndAnnounceLimits = (el, event) => {
    shoptet.dev.deprecated(
      '2025-12-31',
      'shoptet.helpers.enforceAndAnnounceLimits(el, event)',
      'shoptet.quantity.enforceAndAnnounceLimits(el, event)'
    );
    return shoptet.quantity.enforceAndAnnounceLimits(el, event);
  };

  shoptet.quantity = shoptet.quantity || {};
  shoptet.scripts.libs.quantity.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'quantity');
  });
})(shoptet);
