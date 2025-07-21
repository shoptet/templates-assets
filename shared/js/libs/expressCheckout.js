// @ts-check

import { ensure } from '../typeAssertions';

(function (shoptet) {
  let mainStepHtml = '';

  /**
   * @typedef {object} CreatedOrderPayload
   * @property {string} [code]
   * @property {string} [id]
   */

  /**
   * @typedef {object} SuccessPayload
   * @property {string} content - HTML content to be rendered in modal
   * @property {Record<string, string>} [errors] - available in updateInvoicingData
   * @property {string} [status] - available in getPaymentResult
   * @property {CreatedOrderPayload} [createdOrder] - available in getPaymentResult
   * @property {string} [confirmationHtml] - available in getPaymentResult
   * @property {boolean} [isValid] - available in confirmOrder
   * @property {string} [targetUrl] - available in confirmOrder
   */

  /**
   * @typedef {object} SuccessResponse
   * @property {<K extends keyof SuccessPayload>(key: K) => SuccessPayload[K]} getFromPayload
   */

  /**
   * @typedef {object} FailedResponse
   * @property {(key: 'content') => string | undefined} getFromPayload
   */

  function showSpinner() {
    // @ts-ignore
    window.showSpinner();
  }

  function hideSpinner() {
    // @ts-ignore
    window.hideSpinner();
  }

  const isHTMLElement = value => value instanceof HTMLElement;
  const isHTMLInputElement = value => value instanceof HTMLInputElement;
  const isHTMLFormElement = value => value instanceof HTMLFormElement;
  const isHTMLButtonElement = value => value instanceof HTMLButtonElement;

  function resetModalHeights() {
    const modal = document.getElementById('colorbox');
    const allElementsWithHeight = modal?.querySelectorAll('[id*="cbox"][style*="height"]');

    allElementsWithHeight?.forEach(function (element) {
      const elementContainer = ensure(element, isHTMLElement);
      elementContainer.style.removeProperty('height');
    });
  }

  /**
   * @param {string} html
   * @param {() => void} [onComplete]
   * @param {() => void} [onClosed]
   * @param {Record<string, string | boolean>} [options]
   */
  function openModal(html, onComplete, onClosed, options) {
    shoptet.modal.open({
      html,
      className: 'express-checkout',
      maxWidth: '550px',
      width: '100%',
      speed: 0,
      onComplete: function () {
        resetModalHeights();
        document.body.style.overflow = 'hidden';
        onComplete?.();
      },
      onClosed: function () {
        document.body.style.overflow = '';
        onClosed?.();
        window.location.reload();
      },
      ...options,
    });
  }

  /**
   * General function to rerender express checkout data in modal
   * @param {SuccessResponse} response
   * @param {() => void} [onComplete]
   * @param {() => void} [onClosed]
   * @param {Record<string, string | boolean>} [options]
   */
  function rerenderExpressCheckoutModal(response, onComplete, onClosed, options) {
    const content = response.getFromPayload('content');
    mainStepHtml = content;

    openModal(content, onComplete, onClosed, options);
  }

  function recreateModuleScripts() {
    const paymentButtons = document.querySelector('.express-checkout__quick-payment-buttons');
    const scriptElements = paymentButtons?.querySelectorAll('script[type="module"]');
    scriptElements?.forEach(function (element) {
      const allowedSrc = [
        'https://gw.labshoptetpay.com/',
        'https://gw.shoptetpay.com/',
        'https://payment.shoptetpay.com/',
      ];
      const scriptSrc = element.getAttribute('src');
      if (
        allowedSrc.every(function (src) {
          return !scriptSrc?.startsWith(src);
        })
      ) {
        return;
      }
      const newScript = document.createElement('script');
      newScript.type = 'module';
      newScript.src = scriptSrc ?? '';
      paymentButtons?.appendChild(newScript);
    });
  }

  function listenForPaymentFinished() {
    document.getElementById('stpGwRoot')?.addEventListener('shoptet-pay-gw:paymentFinished', function () {
      const loadingHtml = document.querySelector('.js-loading-template')?.innerHTML;
      const cartIdContainer = ensure(document.querySelector('.js-express-checkout-cart-id'), isHTMLElement);
      const cartId = cartIdContainer.dataset.id;

      if (loadingHtml && cartId) {
        openModal(
          loadingHtml,
          function () {
            getPaymentResult(cartId);
          },
          undefined,
          {
            closeButton: false,
            overlayClose: false,
            escKey: false,
          }
        );
      }
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

  function signalExpressCheckoutLoaded() {
    const gwRoot = document.getElementById('stpGwRoot');

    if (gwRoot) {
      gwRoot.addEventListener('shoptet-pay-gw:layoutStable', function () {
        shoptet.scripts.signalDomLoad('ShoptetDOMExpressCheckoutLoaded');
      });
    } else {
      shoptet.scripts.signalDomLoad('ShoptetDOMExpressCheckoutLoaded');
    }
  }

  function handleApplePayBillingMethodVisibility() {
    if (shoptet.helpers.isApplePayAvailable()) {
      const applePayMethod = document.querySelector('[data-submethod="applepay"]');
      applePayMethod?.setAttribute('style', 'display: block;');
    }
  }

  /**
   * BE responses works in a way that they return code 500 when notifier contains errors.
   * Because of that FE request is resolved as failed, but it is not actually failed when content is returned.
   * This function checks if content is returned and if so, it resolves the request as successful.
   * @param {FailedResponse} response
   * @param {function} callback
   */
  function resolveFailedRequestWithContent(response, callback) {
    const content = response.getFromPayload('content');

    if (!content) {
      return;
    }

    callback(response);
  }

  /**
   * @param {boolean} [disableSpinner]
   */
  function initExpressCheckout(disableSpinner) {
    if (!disableSpinner) {
      showSpinner();
    }

    shoptet.ajax.makeAjaxRequest(
      '/action/ExpressCheckout/',
      shoptet.ajax.requestTypes.get,
      '',
      {
        /** @param {SuccessResponse} response  */
        success: function (response) {
          rerenderExpressCheckoutModal(response, function () {
            initNotLoggedInUser();
            signalExpressCheckoutLoaded();
          });
        },
        complete: function () {
          shoptet.config.expressCheckoutKeepSpinnerVisible = undefined;
          hideSpinner();
        },
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      }
    );
  }

  /**
   * @param {string} amount
   * @param {string} itemId
   * @param {string} priceId
   */
  function changeProductQuantity(amount, itemId, priceId) {
    clearTimeout(shoptet.runtime.setPcsTimeout);

    /** @param {SuccessResponse} response */
    function callback(response) {
      shoptet.variantsCommon.hideQuantityTooltips();
      rerenderExpressCheckoutModal(response);
    }

    shoptet.runtime.setPcsTimeout = setTimeout(function () {
      showSpinner();
      shoptet.ajax.makeAjaxRequest(
        '/action/ExpressCheckout/setCartItemAmount/',
        shoptet.ajax.requestTypes.post,
        `amount=${amount}&itemId=${itemId}&priceId=${priceId}`,
        {
          success: callback,
          /** @param {FailedResponse} response */
          failed: function (response) {
            resolveFailedRequestWithContent(response, callback);
          },
          complete: hideSpinner,
        },
        {
          'X-Shoptet-XHR': 'Shoptet_Coo7ai',
        }
      );
    }, shoptet.config.updateQuantityTimeout);
  }

  /**
   * @param {string} value
   */
  function updateShippingMethod(value) {
    showSpinner();
    shoptet.ajax.makeAjaxRequest(
      '/action/ExpressCheckout/updateShippingMethod/',
      shoptet.ajax.requestTypes.post,
      `id=${value}`,
      {
        success: rerenderExpressCheckoutModal,
        /** @param {FailedResponse} response  */
        failed: function (response) {
          resolveFailedRequestWithContent(response, rerenderExpressCheckoutModal);
        },
        complete: hideSpinner,
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      }
    );
  }

  /**
   * @param {string} value
   */
  function updateBillingMethod(value) {
    showSpinner();
    shoptet.ajax.makeAjaxRequest(
      '/action/ExpressCheckout/updateBillingMethod/',
      shoptet.ajax.requestTypes.post,
      `id=${value}`,
      {
        success: rerenderExpressCheckoutModal,
        /** @param {FailedResponse} response */
        failed: function (response) {
          resolveFailedRequestWithContent(response, rerenderExpressCheckoutModal);
        },
        complete: hideSpinner,
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      }
    );
  }

  /**
   * @param {HTMLInputElement} input
   * @param {string} text
   */
  function addErrorMessage(input, text) {
    const elementWrapper = input.closest('.js-validated-element-wrapper');
    const message = document.createElement('div');
    message.classList.add('js-validator-msg', 'msg-error');
    message.innerHTML = text;
    elementWrapper?.insertAdjacentElement('beforeend', message);
    input.classList.add('js-error-field');
  }

  /**
   * @param {HTMLInputElement} input
   */
  function removeErrorMessage(input) {
    const elementWrapper = input.closest('.js-validated-element-wrapper');
    const messages = elementWrapper?.querySelectorAll('.js-validator-msg');

    if (!messages) {
      return;
    }

    messages.forEach(function (message) {
      elementWrapper?.removeChild(message);
    });

    input.classList.remove('js-error-field');
  }

  /**
   * @param {Record<string, string>} errors
   * @param {HTMLFormElement} form
   */
  function showErrorsFromServerValidation(errors, form) {
    Object.entries(errors).forEach(function ([key, value]) {
      const input = ensure(form.querySelector(`[name="${key}"]`), isHTMLInputElement);

      addErrorMessage(input, value);

      const inputValue = input.value;
      const listener = function (event) {
        if (event.target.value !== inputValue) {
          removeErrorMessage(input);
          input.removeEventListener('blur', listener);
        }
      };

      input.addEventListener('blur', listener);
    });

    const firstError = ensure(form.querySelector('.js-error-field'), isHTMLInputElement);
    firstError.focus();
  }

  /**
   * @param {HTMLFormElement} form
   */
  function updateInvoicingData(form) {
    const data = Object.fromEntries(new FormData(form).entries());

    showSpinner();
    shoptet.ajax.makeAjaxRequest(
      '/action/ExpressCheckout/updateInvoicingData/',
      shoptet.ajax.requestTypes.post,
      data,
      {
        /** @param {SuccessResponse} response */
        success: function (response) {
          const errors = response.getFromPayload('errors');

          if (errors) {
            showErrorsFromServerValidation(errors, form);
            return;
          }

          rerenderExpressCheckoutModal(response);
        },
        complete: hideSpinner,
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
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

    const anotherShipping = form?.querySelector('#another-shipping');
    if (anotherShipping && anotherShipping.getAttribute('data-change')) {
      anotherShipping.setAttribute('checked', 'true');
      shoptet.global.toggleAnotherShipping(false);
    }

    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      // Do not scroll on invalid field
      $('html, body').stop();
      const invalid = shoptet.validator.formContainsInvalidFields(event.target);

      if (invalid) {
        return;
      }

      const target = ensure(event.target, isHTMLFormElement);
      updateInvoicingData(target);
    });
  }

  function addDiscountCoupon() {
    const input = ensure(document.querySelector('#discountCouponCode'), isHTMLInputElement);
    const value = input.value;

    if (value.length === 0) {
      shoptet.validator.addErrorMessage(input, shoptet.validatorRequired.messageType);

      return;
    } else {
      shoptet.validator.removeErrorMessage(input);
    }

    showSpinner();
    shoptet.ajax.makeAjaxRequest(
      '/action/ExpressCheckout/addDiscountCoupon/',
      shoptet.ajax.requestTypes.post,
      `discountCouponCode=${value}`,
      {
        success: rerenderExpressCheckoutModal,
        /** @param {FailedResponse} response */
        failed: function (response) {
          resolveFailedRequestWithContent(response, rerenderExpressCheckoutModal);
        },
        complete: hideSpinner,
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      }
    );
  }

  function removeDiscountCoupon() {
    showSpinner();
    shoptet.ajax.makeAjaxRequest(
      '/action/ExpressCheckout/removeDiscountCoupon/',
      shoptet.ajax.requestTypes.post,
      '',
      {
        success: rerenderExpressCheckoutModal,
        /** @param {FailedResponse} response */
        failed: function (response) {
          resolveFailedRequestWithContent(response, rerenderExpressCheckoutModal);
        },
        complete: hideSpinner,
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      }
    );
  }

  /**
   * @param {string} cartId
   */
  function getPaymentResult(cartId) {
    shoptet.ajax.makeAjaxRequest(
      '/action/ExpressCheckout/checkCartPayment/?cart=' + cartId,
      shoptet.ajax.requestTypes.get,
      '',
      {
        /** @param {SuccessResponse} response */
        success: function (response) {
          const status = response.getFromPayload('status');
          const orderInfo = response.getFromPayload('createdOrder');

          if (status === 'PENDING') {
            setTimeout(function () {
              getPaymentResult(cartId);
            }, 3000);
          }

          if (status === 'FINISHED') {
            const confirmationHtml = response.getFromPayload('confirmationHtml');

            if (!confirmationHtml) {
              return;
            }

            openModal(confirmationHtml, function () {
              const title = document.querySelector('.js-success-title');

              if (!title) {
                return;
              }

              title.textContent =
                title?.textContent?.replace('%1', orderInfo?.code ?? orderInfo?.id ?? '') ?? title?.textContent;
            });
          }

          if (status === 'FAILED') {
            const errorHtml = document.querySelector('.js-error-template')?.innerHTML;

            if (errorHtml) {
              openModal(errorHtml);
            }
          }
        },
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      }
    );
  }

  /**
   * @param {HTMLButtonElement} button
   */
  function showInvalidDataInfo(button) {
    const errorMessage = button
      .closest('.express-checkout__summary')
      ?.querySelector('.express-checkout__summary-error');
    errorMessage?.classList.add('visible');
  }

  /**
   * @param {HTMLButtonElement} button
   */
  function confirmOrder(button) {
    const isInvoicingValid = Boolean(button.dataset.invoicingValid);

    if (!isInvoicingValid) {
      showInvalidDataInfo(button);
      return;
    }

    showSpinner();
    shoptet.ajax.makeAjaxRequest(
      '/action/ExpressCheckout/confirmOrder/',
      shoptet.ajax.requestTypes.post,
      '',
      {
        /** @param {SuccessResponse} response */
        success: function (response) {
          const isValid = response.getFromPayload('isValid');

          if (!isValid) {
            showInvalidDataInfo(button);
            return;
          }

          const targetUrl = response.getFromPayload('targetUrl');

          if (targetUrl) {
            window.location.href = targetUrl;
          }
        },
        complete: hideSpinner,
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      }
    );
  }

  /**
   * @param {MouseEvent} event
   */
  function expressCheckoutClickListeners(event) {
    const target = ensure(event.target, isHTMLElement);

    if (target.classList.contains('js-go-to-login-step')) {
      const loginFormHtml = document.querySelector('.js-login-form-template')?.innerHTML;

      if (loginFormHtml) {
        openModal(loginFormHtml, function () {
          shoptet.validator.shoptetFormValidator.init(document.querySelector('#ec-login-form'));
        });
      }
    }

    if (target.classList.contains('js-leave-login-form-step')) {
      initExpressCheckout();
    }

    if (target.classList.contains('js-go-to-shipping-step') || target.closest('.js-go-to-shipping-step')) {
      const shippingHtml = document.querySelector('.js-shipping-template')?.innerHTML;

      if (shippingHtml) {
        openModal(shippingHtml);
      }
    }

    if (target.classList.contains('js-leave-shipping-step')) {
      openModal(mainStepHtml);
    }

    if (target.classList.contains('js-go-to-billing-step') || target.closest('.js-go-to-billing-step')) {
      const billingHtml = document.querySelector('.js-billing-template')?.innerHTML;

      if (billingHtml) {
        openModal(billingHtml, handleApplePayBillingMethodVisibility);
      }
    }

    if (target.classList.contains('js-leave-billing-step')) {
      openModal(mainStepHtml);
    }

    if (target.classList.contains('js-go-to-invoicing-step') || target.closest('.js-go-to-invoicing-step')) {
      const invoicingHtml = document.querySelector('.js-invoicing-template')?.innerHTML;

      if (invoicingHtml) {
        openModal(invoicingHtml, initInvoicingStep);
      }
    }

    if (target.classList.contains('js-leave-invoicing-step')) {
      openModal(mainStepHtml);
    }

    if (target.classList.contains('js-go-to-discount-coupon-step')) {
      const discountCouponHtml = document.querySelector('.js-discount-coupon-template')?.innerHTML;

      if (discountCouponHtml) {
        openModal(discountCouponHtml);
      }
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
      const confirmButton = ensure(target, isHTMLButtonElement);
      confirmOrder(confirmButton);
    }
  }

  /**
   * @param {Event} event
   */
  function expressCheckoutChangeListeners(event) {
    const target = ensure(event.target, isHTMLInputElement);
    const quantityElement = target.closest('.js-product-quantity');

    if (quantityElement && target.classList.contains('amount')) {
      // @ts-ignore
      const quantityUpdated = event.detail?.quantityUpdated;

      /**
       * There are two cases when updating quantity:
       * 1. User clicks on plus/minus button in quantity input
       *  - We get information if quantity was updated - there are checks for min/max quantity - quantityUpdated is boolean
       *  - If quantity was not updated, we don't call changeProductQuantity
       * 2. User types in quantity input manually
       *  - We don't get information if quantity was updated - quantityUpdated is undefined
       *  - In this case we update quantity anyway, because we don't check min/max quantity when typing manually - BE covers this
       *
       * See cms/templates/frontend_templates/00/js/modules/products.js, function changeQuantity
       */
      if (quantityUpdated || typeof quantityUpdated === 'undefined') {
        const quantityElementContainer = ensure(quantityElement, isHTMLElement);
        const { itemid, priceid } = quantityElementContainer.dataset;

        if (!itemid || !priceid) {
          return;
        }

        changeProductQuantity(target.value, itemid, priceid);
      }
    }

    if (target.classList.contains('js-shipping-method-radio') && target.checked) {
      updateShippingMethod(target.value);
    }

    if (target.classList.contains('js-billing-method-radio') && target.checked) {
      updateBillingMethod(target.value);
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  function expressCheckoutKeydownListeners(event) {
    const target = ensure(event.target, isHTMLElement);
    const key = event.key;

    if (key !== 'Enter') {
      return;
    }

    if (target.classList.contains('js-go-to-shipping-step') || target.closest('.js-go-to-shipping-step')) {
      const shippingHtml = document.querySelector('.js-shipping-template')?.innerHTML;

      if (shippingHtml) {
        openModal(shippingHtml);
      }
    }

    if (target.classList.contains('js-go-to-billing-step') || target.closest('.js-go-to-billing-step')) {
      const billingHtml = document.querySelector('.js-billing-template')?.innerHTML;

      if (billingHtml) {
        openModal(billingHtml);
      }
    }

    if (target.classList.contains('js-go-to-invoicing-step') || target.closest('.js-go-to-invoicing-step')) {
      const invoicingHtml = document.querySelector('.js-invoicing-template')?.innerHTML;

      if (invoicingHtml) {
        openModal(invoicingHtml, initInvoicingStep);
      }
    }
  }

  /**
   * @param {SubmitEvent} event
   */
  function expressCheckoutSubmitListeners(event) {
    const target = ensure(event.target, isHTMLFormElement);

    if (target.classList.contains('js-discount-coupon-form')) {
      event.preventDefault();
      addDiscountCoupon();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const addToCartButtons = document.querySelectorAll('.js-express-checkout-open');

    if (addToCartButtons) {
      addToCartButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          shoptet.config.expressCheckoutAddToCart = true;
        });
      });

      const modal = ensure(document.querySelector('#colorbox'), isHTMLElement);

      if (modal) {
        modal.addEventListener('click', expressCheckoutClickListeners);
        modal.addEventListener('change', expressCheckoutChangeListeners);
        modal.addEventListener('keydown', expressCheckoutKeydownListeners);
        modal.addEventListener('submit', expressCheckoutSubmitListeners);
      }
    }

    const openExpressCheckoutOnLoad = document.querySelector('.js-open-express-checkout-on-load');

    if (openExpressCheckoutOnLoad) {
      openExpressCheckoutOnLoad.remove();
      initExpressCheckout();
    }
  });

  shoptet.expressCheckout = shoptet.expressCheckout || {};
  shoptet.scripts.libs.expressCheckout.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'expressCheckout');
  });
  // @ts-ignore
})(shoptet);
