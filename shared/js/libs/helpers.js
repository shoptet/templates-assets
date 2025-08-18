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
      case 6:
        return Math.round(number);
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
