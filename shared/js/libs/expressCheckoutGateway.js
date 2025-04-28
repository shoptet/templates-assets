// @ts-check

/**
 * @typedef {object} SuccessPayload
 * @property {string} status
 * @property {string} [redirectUrl]
 */

/**
 * @typedef {object} SuccessResponse
 * @property {SuccessPayload} payload
 */

const isHTMLElement = value => value instanceof HTMLElement;

/**
 * @param {string} cartId
 */
async function checkIfGatewayPaymentFinished(cartId) {
  try {
    const response = await fetch('/action/ExpressCheckout/checkCartPayment/?cart=' + cartId, {
      headers: {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      },
    });
    /** @type {SuccessResponse} */
    const data = await response.json();

    if (data.payload.status === 'PENDING') {
      setTimeout(function () {
        checkIfGatewayPaymentFinished(cartId);
      }, 3000);

      return;
    }

    if (data.payload.redirectUrl) {
      window.location.href = data.payload.redirectUrl;
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * @param {Element} container
 */
function listenForGatewayPaymentFinished(container) {
  const gatewayRoot = container.querySelector('#stpGwRoot');

  gatewayRoot?.addEventListener('shoptet-pay-gw:paymentFinished', function () {
    const loadingHtml = container.querySelector('.js-loading-gateway-template')?.innerHTML;
    const cartIdContainer = container.querySelector('.js-express-checkout-gateway-data');

    if (!isHTMLElement(cartIdContainer)) {
      return;
    }

    const cartId = cartIdContainer.dataset.cartId;

    if (loadingHtml && cartId) {
      container.innerHTML = loadingHtml;

      checkIfGatewayPaymentFinished(cartId);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const gatewayContainer = document.querySelector('.js-express-checkout-gateway-container');

  if (gatewayContainer) {
    listenForGatewayPaymentFinished(gatewayContainer);
  }
});
