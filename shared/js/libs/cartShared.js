// @ts-check

(function (shoptet) {
  /**
   * @typedef {{
   *  priceId: number,
   *  amount?: number
   * } | {
   *  productId: number
   *  parameterValueId: Record<number, number>
   *  amount?: number
   * } | {
   *  productCode: string,
   *  amount?: number
   * }} Payload
   */

  /**
   * This function adds an item to the cart.
   * @param {Payload} payload - The data to be sent with the request.
   * @param {boolean} [silent] - True to prevent displaying loader and the advanced order modal window. (optional)
   * @param {string} [configUrlType] - The URL to send the request to. (optional)
   */
  function addToCart(payload, silent, configUrlType) {
    if (typeof payload !== 'object') {
      shoptet.scripts.signalCustomEvent('ShoptetCartAddCartItemFailed');
      throw new Error('Invalid function arguments');
    }
    const configUrl = configUrlType || shoptet.config.addToCartUrl;

    const form = document.createElement('form');
    form.setAttribute('action', configUrl);

    for (const key in payload) {
      if (typeof payload[key] === 'object') {
        for (const j in payload[key]) {
          const input = document.createElement('input');
          input.setAttribute('name', key + '[' + j + ']');
          input.setAttribute('value', payload[key][j]);
          form.appendChild(input);
        }
      } else {
        const input = document.createElement('input');
        input.setAttribute('name', key);
        input.setAttribute('value', payload[key]);
        form.appendChild(input);
      }
    }

    if (shoptet.abilities.about.generation !== 3) {
      //  @ts-expect-error Shoptet global functions are not defined yet.
      window.ajaxAddToCart(configUrl, form, !silent);
    } else {
      shoptet.cart.ajaxSubmitForm(configUrl, form, 'functionsForCart', 'cart', !silent, document);
    }
  }

  /**
   * This function removes an item from the cart.
   * @param {Payload} payload - The data to be sent with the request.
   * @param {boolean} [silent] - True to prevent displaying loader. (optional)
   */
  function removeFromCart(payload, silent) {
    addToCart(payload, silent, shoptet.config.removeFromCartUrl);
  }

  /**
   * This function updates the quantity of an item in the cart.
   * @param {Payload} payload - The data to be sent with the request.
   * @param {boolean} [silent] - True to prevent displaying loader. (optional)
   */
  function updateQuantityInCart(payload, silent) {
    addToCart(payload, silent, shoptet.config.updateCartUrl);
  }

  shoptet.cartShared = shoptet.cartShared || {};
  shoptet.scripts.libs.cartShared.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'cartShared');
  });
  // @ts-expect-error Shoptet object is not defined yet.
})(shoptet);
