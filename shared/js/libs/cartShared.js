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
   * This function checks if cart cannot be delivered into a box.
   * @return Promise<boolean>
   */
  function isDeliveryIntoBoxRestricted() {
    return new Promise((resolve, reject) => {
      shoptet.ajax
        .makeAjaxRequest(
          shoptet.config.isDeliveryIntoBoxRestrictedUrl,
          shoptet.ajax.requestTypes.post,
          shoptet.csrf.enabled ? `__csrf__=${encodeURIComponent(shoptet.csrf.token)}` : '',
          {
            success: function (/** @type {AjaxResponse} */ response) {
              const result = response.getFromPayload('isDeliveryIntoBoxRestricted');
              if (result === null) {
                reject(new Error('isDeliveryIntoBoxRestricted API call result is missing'));
                return;
              }
              if (typeof result !== 'boolean') {
                reject(new Error(`isDeliveryIntoBoxRestricted API call result is not a boolean: ${typeof result}`));
                return;
              }
              resolve(result);
            },
          },
          {
            'X-Shoptet-XHR': 'Shoptet_Coo7ai',
          }
        )
        .catch(function (/** @type {unknown} */ error) {
          const reason =
            error && typeof error === 'object' && 'status' in error && 'statusText' in error
              ? `code=${error.status} text=${error.statusText}`
              : 'unknown reason';
          reject(new Error(`isDeliveryIntoBoxRestricted API call has failed: ${reason}`));
        });
    });
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
