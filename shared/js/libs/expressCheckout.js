(function(shoptet) {
    let mainStepHtml = '';

    function openModal(html, onComplete) {
        shoptet.modal.open({
            html,
            className: 'express-checkout',
            maxWidth: '550px',
            width: '100%',
            onComplete,
        });
    }

    // General function to rerender express checkout data in modal
    function rerenderExpressCheckoutModal(response, onComplete) {
        const content = response.getFromPayload('content');
        mainStepHtml = content;

        openModal(content, onComplete);
    }

    function addToCart() {
        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckoutMock/mockAddProduct/',
            shoptet.ajax.requestTypes.post,
            '',
            {
                'success': function(response) {
                    rerenderExpressCheckoutModal(response, handleApplePayGdprVisibility);
                }
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function getMainData() {
        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckoutMock/mockGetMainData/',
            shoptet.ajax.requestTypes.get,
            '',
            {
                'success': function(response) {
                    rerenderExpressCheckoutModal(response, handleApplePayGdprVisibility);
                }
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        )
    }

    function changeProductQuantity(amount) {
        clearTimeout(shoptet.runtime.setPcsTimeout);

        shoptet.runtime.setPcsTimeout = setTimeout(function() {
            showSpinner();
            shoptet.ajax.makeAjaxRequest(
                '/action/ExpressCheckoutMock/mockChangeProductQuantity/',
                shoptet.ajax.requestTypes.post,
                `amount=${amount}`,
                {
                    'success': function(response) {
                        shoptet.variantsCommon.hideQuantityTooltips();
                        rerenderExpressCheckoutModal(response);
                        hideSpinner();
                    },
                },
                {
                    'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                }
            );
        }, shoptet.config.updateQuantityTimeout);
    }

    function updateShippingMethod() {
        const shippingMethod = document.querySelector('.js-shipping-method-radio:checked').value;

        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckoutMock/mockUpdateShippingMethod/',
            shoptet.ajax.requestTypes.post,
            `id=${shippingMethod}`,
            {
                'success': rerenderExpressCheckoutModal,
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function updateBillingMethod() {
        const billingMethod = document.querySelector('.js-billing-method-radio:checked').value;

        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckoutMock/mockUpdateBillingMethod/',
            shoptet.ajax.requestTypes.post,
            `id=${billingMethod}`,
            {
                'success': rerenderExpressCheckoutModal,
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function handleApplePayGdprVisibility() {
        const withApplePay = document.querySelector('.js-with-apple-pay');
        const withoutApplePay = document.querySelector('.js-without-apple-pay');

        if (!withApplePay || !withoutApplePay) {
            return;
        }

        if (shoptet.helpers.isApplePayAvailable()) {
            withApplePay.classList.add('visible');
            withoutApplePay.classList.remove('visible');
        } else {
            withApplePay.classList.remove('visible');
            withoutApplePay.classList.add('visible');
        }
    }

    function expressCheckoutClickListeners(event) {
        const target = event.target;

        if (target.classList.contains('js-go-to-login-step')) {
            const loginFormHtml = document.querySelector('.js-login-form-template').innerHTML;

            if (loginFormHtml) {
                openModal(loginFormHtml, function() {
                    shoptet.validator.shoptetFormValidator.init(document.querySelector('#ec-login-form'));
                });
            }
        }

        if (target.classList.contains('js-leave-login-form-step')) {
            openModal(mainStepHtml, handleApplePayGdprVisibility);
        }

        if (target.classList.contains('js-go-to-shipping-step') || target.closest('.js-go-to-shipping-step')) {
            const shippingHtml = document.querySelector('.js-shipping-template').innerHTML;
            openModal(shippingHtml);
        }

        if (target.classList.contains('js-leave-shipping-step')) {
            updateShippingMethod();
        }

        if (target.classList.contains('js-go-to-billing-step') || target.closest('.js-go-to-billing-step')) {
            const billingHtml = document.querySelector('.js-billing-template').innerHTML;
            openModal(billingHtml);
        }

        if (target.classList.contains('js-leave-billing-step')) {
            updateBillingMethod();
        }
    }

    function expressCheckoutChangeListeners(event) {
        const target = event.target;

        if (target.closest('.js-product-quantity') && target.classList.contains('amount')) {
            changeProductQuantity(target.value);
        }
    }

    function expressCheckoutKeydownListeners(event) {
        const target = event.target;
        const key = event.key;

        if (key !== 'Enter') {
            return;
        }

        if (target.classList.contains('js-go-to-shipping-step') || target.closest('.js-go-to-shipping-step')) {
            const shippingHtml = document.querySelector('.js-shipping-template').innerHTML;
            openModal(shippingHtml);
        }

        if (target.classList.contains('js-go-to-billing-step') || target.closest('.js-go-to-billing-step')) {
            const billingHtml = document.querySelector('.js-billing-template').innerHTML;
            openModal(billingHtml);
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        const addToCartButtons = document.querySelectorAll('.js-express-checkout-open');

        if (addToCartButtons) {
            addToCartButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    addToCart();
                });
            });

            const modal = document.querySelector('#colorbox');

            if (modal) {
                modal.addEventListener("click", expressCheckoutClickListeners);
                modal.addEventListener("change", expressCheckoutChangeListeners);
                modal.addEventListener("keydown", expressCheckoutKeydownListeners);
            }
        }

        const openExpressCheckoutOnLoad = document.querySelector('.js-open-express-checkout-on-load');

        // TODO: Get data instantly from template
        // Do not use extra request
        // Will be solved in https://shoptet.atlassian.net/browse/PAY-5543
        if (openExpressCheckoutOnLoad) {
            openExpressCheckoutOnLoad.remove();
            getMainData();
        }
    });
})(shoptet);
