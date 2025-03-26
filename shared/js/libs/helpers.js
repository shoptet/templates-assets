// @ts-check

(function (shoptet) {
  /**
   * This function replaces decimal separator of given value with a dot to make it a valid float.
   * @param {string | number} value a value to be converted
   * @returns {number}
   */
  function toFloat(value) {
    return parseFloat(String(value).replace(shoptet.config.decSeparator, '.'));
  }

  /**
   * This function converts a number to a localized float.
   * @param {number} value a number to be converted
   * @param {number} [decimals] number of decimal places (optional)
   * @param {boolean} [trim] True if trailing zeros should be removed (optional)
   * @returns {string}
   */
  function toLocaleFloat(value, decimals, trim) {
    let finalValue = String(value);
    if (typeof value === 'number') {
      finalValue = value.toFixed(typeof decimals === 'undefined' ? 0 : decimals);

      if (trim && finalValue.includes('.')) {
        finalValue = finalValue.replace(/\.?0*$/, '');
      }
      return finalValue.replace('.', shoptet.config.decSeparator);
    }
    return finalValue;
  }

  /**
   * This function returns a character that is used as a decimal separator.
   * @param {string} [decimalSeparator] separator of decimals (optional)
   * @returns {string}
   */
  function resolveDecimalSeparator(decimalSeparator) {
    if (typeof decimalSeparator !== 'undefined') {
      return decimalSeparator;
    }
    return shoptet.config.decSeparator;
  }

  /**
   * This function returns a character that is used as a thousand separator.
   * @param {string} [thousandSeparator] separator of thousands (optional)
   * @returns {string}
   */
  function resolveThousandSeparator(thousandSeparator) {
    if (typeof thousandSeparator !== 'undefined') {
      return thousandSeparator;
    }
    return shoptet.config.thousandSeparator;
  }

  /**
   * This function returns a number of decimal places.
   * @param {number} [decimalPlaces] number of decimal places (optional)
   * @returns {number}
   */
  function resolveDecimalPlaces(decimalPlaces) {
    if (typeof decimalPlaces !== 'undefined') {
      if (!isNaN(decimalPlaces)) {
        return Math.abs(decimalPlaces);
      }
    }
    if (!isNaN(shoptet.config.decPlaces)) {
      return Math.abs(shoptet.config.decPlaces);
    }
    return 0;
  }

  /**
   * This function returns a currency symbol.
   * @param {string} [symbol] symbol or code of currency (optional)
   * @returns {string}
   */
  function resolveCurrencySymbol(symbol) {
    if (typeof symbol !== 'undefined') {
      return symbol;
    }
    return shoptet.config.currencySymbol;
  }

  /**
   * This function returns a boolean value that determines if the currency symbol is located left to the number.
   * @param {boolean} [symbolPositionLeft] True to place the symbol left to the number (optional)
   * @returns {boolean}
   */
  function resolveCurrencySymbolPosition(symbolPositionLeft) {
    if (typeof symbolPositionLeft !== 'undefined') {
      return symbolPositionLeft;
    }
    return Boolean(parseInt(shoptet.config.currencySymbolLeft));
  }

  /**
   * This function formats a number based on the backend settings. If you omit all arguments, default values will be used.
   * @param {number} [decimalPlaces] number of decimal places (optional)
   * @param {string} [decimalSeparator] separator of decimals (optional)
   * @param {string} [thousandSeparator] separator of thousands (optional)
   * @returns {string}
   */
  function formatNumber(decimalPlaces, decimalSeparator, thousandSeparator) {
    let number = this;
    let decSep, decPlaces;
    const thSep = resolveThousandSeparator(thousandSeparator);
    if (!Number.isInteger(number.valueOf())) {
      decSep = resolveDecimalSeparator(decimalSeparator);
      decPlaces = resolveDecimalPlaces(decimalPlaces);
    } else {
      decSep = 0;
      decPlaces = 0;
    }
    const s = number < 0 ? '-' : '';
    const i = String(parseInt((number = Math.abs(+number || 0).toFixed(decPlaces))));
    const j = i.length > 3 ? i.length % 3 : 0;

    return (
      s +
      (j ? i.slice(0, j) + thSep : '') +
      i.slice(j).replace(/(\d{3})(?=\d)/g, '$1' + thSep) +
      (decPlaces
        ? decSep +
          Math.abs(number - Number(i))
            .toFixed(decPlaces)
            .slice(2)
        : '')
    );
  }

  /**
   * Format currency the same way as on backend. If you omit all arguments, default values of currency will be used.
   *
   * @param {string} [currencySymbol] symbol or code of currency (optional)
   * @param {boolean} [currencyPositionLeft] whether the symbol is located left to the number (optional)
   * @param {number} [decimalPlaces] number of decimal places (optional)
   * @param {string} [decimalSeparator] separator of decimals (optional)
   * @param {string} [thousandSeparator] separator of thousands (optional)
   */
  function formatAsCurrency(currencySymbol, currencyPositionLeft, decimalPlaces, decimalSeparator, thousandSeparator) {
    const number = this;
    const symbol = resolveCurrencySymbol(currencySymbol);
    const positionLeft = resolveCurrencySymbolPosition(currencyPositionLeft);
    return (
      (positionLeft ? symbol : '') +
      number.ShoptetFormatNumber(decimalPlaces, decimalSeparator, thousandSeparator) +
      (!positionLeft ? ' ' + symbol : '')
    ).trim();
  }

  /**
   * This function rounds the number to the nearest 5 (for Slovak market).
   * @param {number} price Price to be rounded
   * @returns {number}
   */
  function roundForSk(price) {
    if (price === 0) {
      return 0.0;
    }

    if (Math.abs(price) <= 0.02) {
      return (0.05 * price) / Math.abs(price);
    }

    return (Math.round((price * 100) / 5) / 100) * 5;
  }

  /**
   * This function rounds the price to the nearest 5 (for Hungarian market).
   * @param {number} price Price to be rounded
   * @returns {number}
   */
  function roundForHu(price) {
    return Math.round(price / 5) * 5;
  }

  /**
   * This function rounds the number to the nearest value based on the document rounding mode.
   * @param {number} [rounding]  The rounding mode (optional)
   * @param {number} [documentPriceDecimalPlaces] The number of decimal places (optional)
   * @returns {number}
   * @see PriceHelper.php::roundForDocumentWithMode()
   */
  function roundForDocument(
    rounding = Number(shoptet.config.documentsRounding),
    documentPriceDecimalPlaces = Number(shoptet.config.documentPriceDecimalPlaces)
  ) {
    const number = this;
    const pow = Math.pow(10, Number(documentPriceDecimalPlaces));

    switch (Number(rounding)) {
      case 1:
        return Math.ceil(number * pow) / pow;
      case 2:
        return Math.floor(number * pow) / pow;
      case 3:
        return Math.round(number * pow) / pow;
      case 4:
        return roundForHu(number);
      case 5:
        return roundForSk(number);
      default:
        return number;
    }
  }

  /**
   * This function resolves minimum amount based on decimal places.
   * @param {number} decimals Amount of decimal places
   * @returns {number}
   */
  function resolveMinimumAmount(decimals) {
    switch (decimals) {
      case 1:
        return 0.1;
      case 2:
        return 0.01;
      case 3:
        return 0.001;
      default:
        return 1;
    }
  }

  /**
   * This function checks if the device is a touch device.
   * @returns {boolean}
   */
  function isTouchDevice() {
    const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    if ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
      return true;
    }
    const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return window.matchMedia(query).matches;
  }

  /**
   * This function enables the local preview of the update with the given code for the next year.
   * @param {string} updateCode
   */
  function enableUpdatePreview(updateCode) {
    shoptet.cookie.create(`update_management_preview_${updateCode}`, 1, { years: 1 });
    window.location.reload();
  }

  /**
   * This function checks if the Apple Pay is available in the browser.
   * @returns {boolean}
   */
  function isApplePayAvailable() {
    try {
      if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  if (shoptet.config.ums_product_quantity) {
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
      let value = toFloat(el.value);
      if (isNaN(value)) return false;

      decimals = toFloat(decimals ?? 0);
      min = toFloat(min ?? resolveMinimumAmount(decimals));
      max = toFloat(max ?? shoptet.config.defaultProductMaxAmount);
      const step = toFloat(el.getAttribute('step') || '1');

      let quantity = toFloat(el.dataset.quantity || '');
      let diff = quantity - value;

      value = calculateQuantity(value, step, decimals, action);

      if (!isNaN(quantity)) {
        quantity = calculateQuantity(quantity, step, decimals, action);
        value = quantity;
      }

      if (value < min) {
        if (action === 'decrease') {
          announceQuantityLimits(el, 'decrease');
          return false;
        }
        value = min;
      } else if (value > max) {
        if (action === 'increase') {
          announceQuantityLimits(el, 'increase');
          return false;
        }
        value = max;
      } else {
        shoptet.variantsCommon.hideQuantityTooltips();
      }

      if (!isNaN(quantity)) {
        $(el).attr('data-quantity', quantity);
        value = quantity - diff;
      }

      announceToScreenReader(`${shoptet.messages['newQuantity']} ${value}`);
      el.value = value.toFixed(decimals);

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
      value = toFloat((action === 'increase' ? value + step : value - step).toFixed(decimals));
      return value;
    }

    // TODO: Remove this in issue 11049 -- START
  } else {
    /**
     * Increase/decrease quantity of products in input by clickin' on arrows.
     * Decimals, min and max values are passed by data-attributes
     * @param {HTMLInputElement} el input field that have to be updated
     * @param {number | undefined} min minimum allowed amount
     * @param {number | undefined} max maximum allowed amount
     * @param {number | undefined} decimals allowed decimal places
     * @param {'increase' | 'decrease'} action accepts 'increase' or 'decrease'
     * @param {() => void} [callback] optional callback after quantity update (optional)
     * @returns {boolean}
     */
    function updateQuantity(el, min, max, decimals, action, callback) {
      let value = toFloat(el.value);

      if (isNaN(value)) {
        return false;
      }

      decimals = typeof decimals !== 'undefined' ? toFloat(decimals) : 0;

      min = typeof min !== 'undefined' ? toFloat(min) : resolveMinimumAmount(decimals);
      max = typeof max !== 'undefined' ? toFloat(max) : toFloat(shoptet.config.defaultProductMaxAmount);

      let quantity = toFloat(el.dataset.quantity || '');
      const diff = quantity - value;

      value = updateQuantityInner(value, min, decimals, action);

      if (!isNaN(quantity)) {
        quantity = updateQuantityInner(quantity, min, decimals, action);
        value = quantity;
      }

      if (value < min) {
        if (action === 'decrease') {
          $(el).siblings('.js-decrease-tooltip').tooltip('show');
          $(el).siblings('.js-remove-pcs-tooltip').tooltip().show();
          return false;
        }
        value = min;
      } else if (value > max) {
        if (action === 'increase') {
          $(el).siblings('.js-increase-tooltip').tooltip('show');
          $(el).siblings('.js-add-pcs-tooltip').tooltip().show();
          return false;
        }
        value = max;
      } else {
        shoptet.variantsCommon.hideQuantityTooltips();
      }

      if (!isNaN(quantity)) {
        el.dataset.quantity = String(quantity);
        value = quantity - diff;
      }

      el.value = String(value);

      if (typeof callback === 'function') {
        callback();
      }

      return true;
    }

    /**
     * Increase/decrease quantity of products in input
     * @param {number} value - current value
     * @param {number} min - minimum allowed amount
     * @param {number} decimals - allowed decimal places
     * @param {'increase' | 'decrease'} action accepts 'increase' or 'decrease'
     * @returns {number}
     */
    function updateQuantityInner(value, min, decimals, action) {
      if (action === 'increase') {
        value += min > 1 ? 1 : min;
      } else if (action === 'decrease') {
        value -= min > 1 ? 1 : min;
      }

      return toFloat(value.toFixed(decimals));
    }
  }
  // TODO: Remove this in issue 11049 -- END

  /**
   * Announce quantity limits via tooltip and screen reader
   *
   * @param {HTMLInputElement} el - input element
   * @param {'increase'|'decrease'} action - action type
   * @returns {void}
   */
  function announceQuantityLimits(el, action) {
    if (!el) return;

    let quantityForm = $(el).closest('form');
    let tooltipText = '';

    if (action === 'decrease') {
      let decreaseTooltip = quantityForm.find('.js-decrease-tooltip');

      decreaseTooltip.tooltip('show');
      quantityForm.find('.js-remove-pcs-tooltip').tooltip().show();

      tooltipText = decreaseTooltip.attr('data-original-title');
    } else if (action === 'increase') {
      let increaseTooltip = quantityForm.find('.js-increase-tooltip');

      increaseTooltip.tooltip('show');
      quantityForm.find('.js-add-pcs-tooltip').tooltip().show();

      tooltipText = increaseTooltip.attr('data-original-title');
    }

    setTimeout(() => {
      let inputValue = el.value;
      announceToScreenReader(`${tooltipText} ${shoptet.messages['currentQuantity']} ${inputValue}`, 'assertive');
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
    const min = toFloat(el.min ?? resolveMinimumAmount(decimals));
    const max = toFloat(el.max ?? shoptet.config.defaultProductMaxAmount);
    let value = el.value === '' ? NaN : toFloat(el.value);

    if (isNaN(value)) {
      const quantityRangeText = shoptet.messages['quantityRange'].replace('%1', min).replace('%2', max);
      announceToScreenReader(quantityRangeText);
    } else {
      announceToScreenReader(`${shoptet.messages['newQuantity']} ${value}`);
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

  /**
   * Announces a message to screen readers using an ARIA live region.
   *
   * @param {string} message - the message to be announced by the screen reader
   * @param {'polite' | 'assertive'} [liveType="polite"] - the type of announcement
   *  - polite (default): Announces the message at the next available opportunity.
   *  - assertive: Announces the message immediately, interrupting any current speech.
   * @returns {void}
   */
  function announceToScreenReader(message, liveType = 'polite') {
    const announcer = document.getElementById('screen-reader-announcer');
    if (!announcer) return;

    announcer.setAttribute('aria-live', 'off');

    announcer.textContent = '';

    setTimeout(() => {
      announcer.setAttribute('aria-live', liveType);
      announcer.textContent = message;
    }, 10);
  }

  if (shoptet.config.ums_product_quantity) {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('input', event => {
        if (!(event.target instanceof HTMLInputElement) || !event.target.classList.contains('amount')) return;
        enforceAndAnnounceLimits(event.target, event);
      });
    });
  }

  $('html').on('click', function (e) {
    if (!$(e.target).is('.decrease, .increase, .remove-pcs, .add-pcs, .quantity-discounts__item')) {
      if ($('.tooltip').length) {
        shoptet.variantsCommon.hideQuantityTooltips();
      }
    }
  });

  $('.cart-widget, .product').on('mouseleave', function () {
    if ($('.tooltip').length) {
      shoptet.variantsCommon.hideQuantityTooltips();
    }
  });

  document.addEventListener('ShoptetCartUpdated', function () {
    if ($('.tooltip').length) {
      shoptet.variantsCommon.hideQuantityTooltips();
    }
  });

  Number.prototype.ShoptetFormatNumber = formatNumber;
  Number.prototype.ShoptetFormatAsCurrency = formatAsCurrency;
  Number.prototype.ShoptetRoundForDocument = roundForDocument;

  shoptet.helpers = shoptet.helpers || {};
  shoptet.scripts.libs.helpers.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'helpers');
  });
})(shoptet);
