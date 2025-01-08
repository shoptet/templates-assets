(function(shoptet) {
    let mainStepHtml = '';

    function resetModalHeights() {
        const modal = document.getElementById('colorbox');
        const allElementsWithHeight = modal.querySelectorAll('[style*="height"]');

        allElementsWithHeight.forEach(function(element) {
            element.style.height = '';
        });
    }

    function openModal(html, onComplete, options) {
        shoptet.modal.open({
            html,
            className: 'express-checkout',
            maxWidth: '550px',
            width: '100%',
            onComplete: function() {
                resetModalHeights();
                document.body.style.overflowY = 'hidden';
                onComplete?.();
            },
            onClosed: function() {
                document.body.style.overflowY = '';
            },
            ...options,
        });
    }

    // General function to rerender express checkout data in modal
    function rerenderExpressCheckoutModal(response, onComplete, options) {
        const content = response.getFromPayload('content');
        mainStepHtml = content;

        openModal(content, onComplete, options);
    }


    function recreateModuleScripts() {
        const paymentButtons = document.querySelector('.express-checkout__quick-payment-buttons');
        const scriptElements = paymentButtons?.querySelectorAll('script[type="module"]');
        scriptElements?.forEach(function(element) {
            const allowedSrc = [
                'https://gw.labshoptetpay.com/',
                'https://gw.shoptetpay.com/'
            ];
            const scriptSrc = element.getAttribute('src');
            if (allowedSrc.every(function(src) {
                return !scriptSrc.startsWith(src);
            })) {
                return;
            }
            const newScript = document.createElement('script');
            newScript.type = 'module';
            newScript.src = scriptSrc;
            paymentButtons.appendChild(newScript);
        });
    }

    function listenForPaymentFinished() {
        document.getElementById('stpGwRoot')?.addEventListener('shoptet-pay-gw:paymentFinished', function() {
            const loadingHtml = document.querySelector('.js-loading-template').innerHTML;
            const cartId = document.querySelector('.js-express-checkout-cart-id').dataset.id;

            openModal(loadingHtml,
                function() {
                    getPaymentResult(cartId)
                },
                {
                    closeButton: false,
                    overlayClose: false,
                    escKey: false,
                }
            );
        });
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

    function initNotLoggedInUser() {
        recreateModuleScripts();
        handleApplePayGdprVisibility();
        listenForPaymentFinished();
    }

    function handleApplePayBillingMethodVisibility() {
        if (shoptet.helpers.isApplePayAvailable()) {
            const applePayMethod = document.querySelector('[data-submethod="applepay"]');
            applePayMethod?.setAttribute('style', 'display: block;');
        }
    }

    function initExpressCheckout() {
        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckout/',
            shoptet.ajax.requestTypes.get,
            '',
            {
                'success': function(response) {
                    rerenderExpressCheckoutModal(response, initNotLoggedInUser);
                }
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function changeProductQuantity(amount, itemId, priceId) {
        clearTimeout(shoptet.runtime.setPcsTimeout);

        shoptet.runtime.setPcsTimeout = setTimeout(function() {
            showSpinner();
            shoptet.ajax.makeAjaxRequest(
                '/action/ExpressCheckout/setCartItemAmount/',
                shoptet.ajax.requestTypes.post,
                `amount=${amount}&itemId=${itemId}&priceId=${priceId}`,
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

    function updateShippingMethod(value) {
        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckout/updateShippingMethod/',
            shoptet.ajax.requestTypes.post,
            `id=${value}`,
            {
                'success': rerenderExpressCheckoutModal,
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function updateBillingMethod(value) {
        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckout/updateBillingMethod/',
            shoptet.ajax.requestTypes.post,
            `id=${value}`,
            {
                'success': rerenderExpressCheckoutModal,
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function addErrorMessage(input, text) {
        const elementWrapper = input.closest('.js-validated-element-wrapper');
        const message = document.createElement('div');
        message.classList.add('js-validator-msg', 'msg-error');
        message.innerHTML = text;
        elementWrapper?.insertAdjacentElement('beforeend', message);
        input.classList.add('js-error-field');
    }

    function removeErrorMessage(input) {
        const elementWrapper = input.closest('.js-validated-element-wrapper');
        const messages = elementWrapper?.querySelectorAll('.js-validator-msg');

        if (!messages) {
            return;
        }

        messages.forEach(function(message) {
            elementWrapper.removeChild(message);
        });

        input.classList.remove('js-error-field');
    }

    function showErrorsFromServerValidation(errors, form) {
        Object.entries(errors).forEach(function([key, value]) {
            const input = form.querySelector(`[name="${key}"]`);

            if (!input) {
                return;
            }

            addErrorMessage(input, value);

            const inputValue = input.value;
            const listener = function(event) {
                if (event.target.value !== inputValue) {
                    removeErrorMessage(input);
                    input.removeEventListener('blur', listener);
                }
            }

            input.addEventListener('blur', listener);
        });

        const firstError = form.querySelector('.js-error-field');
        firstError?.focus();
    }

    function updateInvoicingData(form) {
        const data = new URLSearchParams(new FormData(form)).toString();

        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckout/updateInvoicingData/',
            shoptet.ajax.requestTypes.post,
            data,
            {
                'success': function(response) {
                    const errors = response.getFromPayload('errors');

                    if (errors) {
                        showErrorsFromServerValidation(errors, form);
                        return;
                    }

                    rerenderExpressCheckoutModal(response);
                },
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function initInvoicingStep() {
        const form = document.querySelector('#ec-invoicing-form');

        shoptet.validator.shoptetFormValidator.init(form);
        shoptet.validator.handleValidators(shoptet.validatorPhone.validators);
        shoptet.validator.handleValidators(shoptet.validatorRequired.validators);
        shoptet.validator.handleValidators(shoptet.validatorZipCode.validators);
        shoptet.validator.handleValidators(shoptet.validatorCompanyId.validators);
        shoptet.validatorCompanyId.updateCompanyIdValidPattern();
        shoptet.phoneInput.interconnectFlagsWithSelect();

        if (shoptet.abilities.feature.smart_labels) {
            $('.smart-label-wrapper').SmartLabels();
        }

        const anotherShipping = form.querySelector('#another-shipping');
        if (anotherShipping && anotherShipping.getAttribute('data-change')) {
            anotherShipping.setAttribute('checked', true);
            shoptet.global.toggleAnotherShipping(false);
        }

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            // Do not scroll on invalid field
            $('html, body').stop();
            const invalid = shoptet.validator.formContainsInvalidFields(event.target);

            if (invalid) {
                return;
            }

            updateInvoicingData(event.target);
        });
    }

    function addDiscountCoupon() {
        const input = document.querySelector('#discountCouponCode');
        const value = input.value;

        if (value.length === 0) {
            shoptet.validator.addErrorMessage(input, shoptet.validatorRequired.messageType);

            return;
        } else {
            shoptet.validator.removeErrorMessage(input);
        }

        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckout/addDiscountCoupon/',
            shoptet.ajax.requestTypes.post,
            `discountCouponCode=${value}`,
            {
                'success': rerenderExpressCheckoutModal,
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function removeDiscountCoupon() {
        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckout/removeDiscountCoupon/',
            shoptet.ajax.requestTypes.post,
            '',
            {
                'success': rerenderExpressCheckoutModal,
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function getPaymentResult(cartId) {
        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckout/checkCartPayment/?cart=' + cartId,
            shoptet.ajax.requestTypes.get,
            '',
            {
                'success': function(response) {
                    const status = response.getFromPayload('status');
                    const orderInfo = response.getFromPayload('createdOrder');

                    if (status === 'PENDING') {
                        setTimeout(function() {
                            getPaymentResult(cartId);
                        }, 3000);
                    }

                    if (status === 'FINISHED') {
                        const successHtml = document.querySelector('.js-success-template').innerHTML;
                        openModal(successHtml, function() {
                            const title = document.querySelector('.js-success-title');
                            title.textContent = title.textContent.replace('%1', orderInfo?.code ?? orderInfo?.id ?? '');
                        });
                    }

                    if (status === 'FAILED') {
                        const errorHtml = document.querySelector('.js-error-template').innerHTML;
                        openModal(errorHtml);
                    }
                },
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    function showInvalidDataInfo(button) {
        const errorMessage = button.closest('.express-checkout__summary').querySelector('.express-checkout__summary-error');
        errorMessage.classList.add('visible');
    }

    function confirmOrder(button) {
        const isInvoicingValid = Boolean(button.dataset.invoicingValid);

        if (!isInvoicingValid) {
            showInvalidDataInfo(button);
            return;
        }

        shoptet.ajax.makeAjaxRequest(
            '/action/ExpressCheckout/confirmOrder/',
            shoptet.ajax.requestTypes.post,
            '',
            {
                'success': function(response) {
                    const isValid = response.getFromPayload('isValid');

                    if (!isValid) {
                        showInvalidDataInfo(button);
                        return;
                    }

                    const targetUrl = response.getFromPayload('targetUrl');
                    window.location.href = targetUrl;
                }
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
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
            openModal(mainStepHtml, initNotLoggedInUser);
        }

        if (target.classList.contains('js-go-to-shipping-step') || target.closest('.js-go-to-shipping-step')) {
            const shippingHtml = document.querySelector('.js-shipping-template').innerHTML;
            openModal(shippingHtml);
        }

        if (target.classList.contains('js-leave-shipping-step')) {
            openModal(mainStepHtml);
        }

        if (target.classList.contains('js-go-to-billing-step') || target.closest('.js-go-to-billing-step')) {
            const billingHtml = document.querySelector('.js-billing-template').innerHTML;
            openModal(billingHtml, handleApplePayBillingMethodVisibility);
        }

        if (target.classList.contains('js-leave-billing-step')) {
            openModal(mainStepHtml);
        }

        if (target.classList.contains('js-go-to-invoicing-step') || target.closest('.js-go-to-invoicing-step')) {
            const invoicingHtml = document.querySelector('.js-invoicing-template').innerHTML;
            openModal(invoicingHtml, initInvoicingStep);
        }

        if (target.classList.contains('js-leave-invoicing-step')) {
            openModal(mainStepHtml);
        }

        if (target.classList.contains('js-go-to-discount-coupon-step')) {
            const discountCouponHtml = document.querySelector('.js-discount-coupon-template').innerHTML;
            openModal(discountCouponHtml);
        }

        if (target.classList.contains('js-leave-discount-coupon-step')) {
            openModal(mainStepHtml);
        }

        if (target.classList.contains('js-remove-discount-coupon')) {
            removeDiscountCoupon();
        }

        if (target.classList.contains('js-close-modal')) {
            shoptet.modal.close();
        }

        if (target.classList.contains('js-repeat-payment')) {
            initExpressCheckout();
        }

        if (target.classList.contains('js-confirm-order')) {
            confirmOrder(target);
        }
    }

    function expressCheckoutChangeListeners(event) {
        const target = event.target;
        const quantityElement = target.closest('.js-product-quantity');

        if (quantityElement && target.classList.contains('amount')) {
            changeProductQuantity(target.value, quantityElement.dataset.itemid, quantityElement.dataset.priceid);
        }

        if (target.classList.contains('js-shipping-method-radio') && target.checked) {
            updateShippingMethod(target.value);
        }

        if (target.classList.contains('js-billing-method-radio') && target.checked) {
            updateBillingMethod(target.value);
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

        if (target.classList.contains('js-go-to-invoicing-step') || target.closest('.js-go-to-invoicing-step')) {
            const invoicingHtml = document.querySelector('.js-invoicing-template').innerHTML;
            openModal(invoicingHtml, initInvoicingStep);
        }
    }

    function expressCheckoutSubmitListeners(event) {
        const target = event.target;

        if (target.classList.contains('js-discount-coupon-form')) {
            event.preventDefault();
            addDiscountCoupon();
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        const addToCartButtons = document.querySelectorAll('.js-express-checkout-open');

        if (addToCartButtons) {
            addToCartButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    shoptet.config.expressCheckoutAddToCart = true;
                });
            });

            const modal = document.querySelector('#colorbox');

            if (modal) {
                modal.addEventListener("click", expressCheckoutClickListeners);
                modal.addEventListener("change", expressCheckoutChangeListeners);
                modal.addEventListener("keydown", expressCheckoutKeydownListeners);
                modal.addEventListener("submit", expressCheckoutSubmitListeners);
            }
        }

        const openExpressCheckoutOnLoad = document.querySelector('.js-open-express-checkout-on-load');

        if (openExpressCheckoutOnLoad) {
            openExpressCheckoutOnLoad.remove();
            initExpressCheckout();
        }
    });

    shoptet.expressCheckout = shoptet.expressCheckout || {};
    shoptet.scripts.libs.expressCheckout.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'expressCheckout');
    });
})(shoptet);
