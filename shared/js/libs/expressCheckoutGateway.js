async function checkIfGatewayPaymentFinished(cartId) {
    try {
        const response = await fetch('/action/ExpressCheckout/checkCartPayment/?cart=' + cartId, {
            headers: {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai',
            }
        });
        const data = await response.json();

        if (data.payload.status === 'PENDING') {
            setTimeout(function() {
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

function listenForGatewayPaymentFinished(container) {
    const gatewayRoot = container.querySelector('#stpGwRoot');

    gatewayRoot?.addEventListener('shoptet-pay-gw:paymentFinished', function() {
        const loadingHtml = container.querySelector('.js-loading-gateway-template').innerHTML;
        const { cartId } = container.querySelector('.js-express-checkout-gateway-data').dataset;

        container.innerHTML = loadingHtml;

        checkIfGatewayPaymentFinished(cartId);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const gatewayContainer = document.querySelector('.js-express-checkout-gateway-container');

    if (gatewayContainer) {
        listenForGatewayPaymentFinished(gatewayContainer);
    }
});
