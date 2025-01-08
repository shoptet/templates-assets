(function(shoptet) {

    /**
     * Update cart button
     * @param {Number} count
     * count = number of items in cart
     * @param {Number} price
     * price = price of items in cart
     */
    function updateCartButton(count, price) {
        var $cartWrapper = $('.place-cart-here');
        var $cartButton = $('#header .cart-count');
        var $priceHolder = $cartButton.find('.cart-price');
        var $overviewWrapper = $('.cart-overview');

        if (count > 0) {
            $cartWrapper.addClass('full');
            var i = $cartButton.find('i');
            if (parseFloat(count) > 0) {
                if (count > 99) {
                    count = '99+';
                } else {
                    count = (parseFloat(count) < 1 ? 1 : Math.round(parseFloat(count)));
                }
                if (i.length) {
                    i.text(count);
                } else {
                    $cartButton.append('<i data-testid="headerCartCount">' + count + '</i>').addClass('full');
                }
                if ($priceHolder.length) {
                    $priceHolder.text(price);
                }
            }

        } else {
            $cartWrapper.removeClass('full');
            $cartButton.removeClass('full').find('i').remove();
            if ($priceHolder.length) {
                $priceHolder.text(shoptet.messages['emptyCart']);
            }
        }

        if ($overviewWrapper.length) {
            $overviewWrapper.find('.cart-overview-item-count').text(count);
            $overviewWrapper.find('.cart-overview-final-price').text(price);
        }

        shoptet.scripts.signalDomUpdate('ShoptetDOMCartCountUpdated');
    }


    /**
     * Get cart content by AJAX
     *
     * @param {Boolean} hide
     * hide = if set to true, function hides spinner
     * @param {Function} callback
     * callback = code to execute after the content is loaded
     */
    function getCartContent(hide, callback) {
        var cartUrlSuffix = '';
        if (shoptet.config.orderingProcess.active) {
            cartUrlSuffix += '?orderingProcessActive=1';
        }
        if (shoptet.abilities.feature.simple_ajax_cart && $('body').hasClass('cart-window-visible')) {
            cartUrlSuffix += cartUrlSuffix.indexOf('?') !== -1 ? "&" : "?";
            cartUrlSuffix += 'simple_ajax_cart=1';
        }

        var el, $cartContentWrapper;
        if ($('.cart-wrapper').length) {
            // cart page or extended_ajax_cart
            el = '.cart-wrapper';
            $cartContentWrapper = $(el).parent();
        } else {
            // simple ajax cart
            el = '.place-cart-here';
            $cartContentWrapper = $(el);
        }

        var successCallback = function(response) {
            response = response.getFromPayload('content');
            if (response.indexOf('cart-empty') !== -1) {
                // TODO propagate this functionality to the other templates
                $('body').addClass('cart-emptied');
            }
            $cartContentWrapper.html(response);

            if (shoptet.csrf.enabled) {
                var selector;
                if (shoptet.csrf.formsSelector === '') {
                    selector = 'form';
                } else {
                    selector = 'form' + '.' + shoptet.csrf.formsSelector;
                }

                $cartContentWrapper[0].querySelectorAll(selector).forEach(function(form) {
                    shoptet.csrf.injectToken(form);
                });
            }

            $(el + ' img').unveil();
            initColorbox();
            initTooltips();

            if (hide !== false) {
                hideSpinner();
            }
            if (typeof callback === 'function') {
                callback();
            }
            shoptet.scripts.signalDomLoad('ShoptetDOMCartContentLoaded');
        };

        shoptet.ajax.makeAjaxRequest(
            shoptet.config.cartContentUrl + cartUrlSuffix,
            shoptet.ajax.requestTypes.get,
            '',
            {
                'success': successCallback,
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    /**
     * Get advanced order content by AJAX
     *
     * This function does not accept any arguments.
     */
    function getAdvancedOrder() {
        var successCallback = function (response) {
            var content = response.getFromPayload('content');
            if (content !== false) {
                if (shoptet.csrf.enabled) {
                    var selector;
                    if (shoptet.csrf.formsSelector === '') {
                        selector = 'form';
                    } else {
                        selector = 'form' + '.' + shoptet.csrf.formsSelector;
                    }

                    var $content = $('<div>' + content + '</div>');
                    $content[0].querySelectorAll(selector).forEach(function(form) {
                        shoptet.csrf.injectToken(form);
                    });
                    content = $content.html();
                }

                shoptet.modal.open({
                    html: shoptet.content.colorboxHeader + content + shoptet.content.colorboxFooter,
                    width: shoptet.modal.config.widthLg,
                    className: shoptet.modal.config.classLg,
                    onComplete: function() {
                        $('.colorbox-html-content img').unveil();
                        $('body').removeClass(shoptet.config.bodyClasses);
                        hideSpinner();
                        setTimeout(function() {
                            if (typeof shoptet.productSlider.runProductSlider === 'function') {
                                shoptet.productSlider.runProductSlider('.advanced-order .product-slider');
                                $('.advanced-order .product-slider img').unveil();
                            }
                            shoptet.modal.shoptetResize();
                        }, 1);
                        shoptet.scripts.signalDomLoad('ShoptetDOMAdvancedOrderLoaded');
                    }
                });
            }

            const trackingContainer = response.getFromPayload('trackingContainer');
            if (trackingContainer) {
                shoptet.tracking.processTrackingContainer(trackingContainer);
            }
        };
        var urlSuffix;
        if (shoptet.config.orderingProcess.active) {
            urlSuffix = '?orderingProcessActive=1'
        } else {
            urlSuffix = '';
        }
        shoptet.ajax.makeAjaxRequest(
            shoptet.config.advancedOrderUrl + urlSuffix,
            shoptet.ajax.requestTypes.get,
            '',
            {
                'success': successCallback
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );
    }

    /**
     * This function calls another functions needed to
     * run after AJAX call is complete - in second step of ordering process
     *
     * This function does not accept any arguments.
     */
    function functionsForStep1() {
        shoptet.checkoutShared.getStatedValues();
        shoptet.checkoutShared.setActiveShippingAndPayments();
        shoptet.checkoutShared.displayApplePay();
        shoptet.checkoutShared.setupDeliveryShipping();
        shoptet.checkoutShared.payu();
    }

    /**
     * Necessary stuff after cart update
     *
     * @param {String} action
     * action = action attribute of submitted form
     * @param {Object|boolean} el
     * el = submitted form or document in case of form is removed by getting new cart content
     */
    function handleCartPostUpdate(action, el) {
        shoptet.scripts.signalCustomEvent(shoptet.common.createEventNameFromFormAction(action), el);
        shoptet.scripts.signalCustomEvent('ShoptetCartUpdated', el);
    }

    /**
     * Submit form by AJAX POST
     *
     * @param {String} action
     * action = action attribute of submitted form
     * @param {Object} form
     * form = submitted form
     * @param {String} callingFunctions
     * callingFunctions = group of functions which have to be called after submit
     * @param {Boolean|String} replaceContent
     * replaceContent = determines if content wil be replaced with AJAX call result
     * @param {Boolean} displaySpinner
     * displaySpinner = if set to true, the spinner is displayed before and hidden after submit
     * @param {Object} eventElement
     * eventElement = if not set, the form is used as event element
     */
    function ajaxSubmitForm(action, form, callingFunctions, replaceContent, displaySpinner, eventElement) {
        var body = document.getElementsByTagName('body')[0];
        if (displaySpinner === true) {
            showSpinner();
        }

        if (typeof eventElement === 'undefined') {
            eventElement = form;
        }

        var cartUrlSuffix = '';
        if (shoptet.abilities.feature.simple_ajax_cart && !shoptet.config.orderingProcess.active) {
            cartUrlSuffix = '?simple_ajax_cart=1';
            body.classList.add('ajax-pending');
        }

        var completeCallback = function() {
            body.classList.remove('ajax-pending');
        };

        var successCallback = function(response) {
            switch (replaceContent) {
                case 'cart':
                    shoptet.cart.updateCartButton(response.getFromPayload('count'), response.getFromPayload('price'));
                    if (
                        shoptet.config.orderingProcess.step === 0
                        || body.classList.contains('cart-window-visible')
                    ) {
                        // In that case, the operation was executed either
                        // in the cart (ordering process) or in opened cart widget (cart-window-visible)
                        var cartCallback = function() {
                            // The "element" argument is document,
                            // because the original form is removed from DOM
                            // as the cart content is loaded.
                            shoptet.cart.handleCartPostUpdate(form.getAttribute('action'), document);
                        }
                    } else {
                        delete shoptet.events.cartLoaded;
                    }
                    break;
                case true:
                    var payloadContent = $(payload.content).find('#content-wrapper');
                    payloadContent.find('#toplist').remove();
                    $('#content-wrapper').replaceWith(payloadContent);
                    $('#content-wrapper img').unveil();
                    initColorbox();
                    shoptet.modal.shoptetResize();
                    shoptet.scripts.signalDomLoad('ShoptetDOMPageContentLoaded');
                    break;
            }

            dismissMessages();

            if (callingFunctions === 'functionsForCart') {
                // The function getAdvancedOrder() needs to complete before
                // the getCartContent() function, while the view keeps
                // the information about the added product.
                // Otherwise, the new view will be created, and the information
                // about the added product will be lost.
                if (action === shoptet.config.addToCartUrl) {
                    if (shoptet.config.expressCheckoutAddToCart) {
                        shoptet.expressCheckout.initExpressCheckout();
                        shoptet.config.expressCheckoutAddToCart = undefined;
                    } else if (typeof shoptet.config.showAdvancedOrder !== 'undefined'
                        && !shoptet.cartShared.silentAddition) {
                        shoptet.cart.getAdvancedOrder();
                    }
                    shoptet.cartShared.silentAddition = false;
                }
                shoptet.tracking.handleAction(form, response);
                if (typeof cartCallback === 'function') {
                    // In that case, the operation was executed either
                    // in the cart (ordering process) or in opened cart widget,
                    // so it's necessary to replace the cart content by the fresh one.
                    // handleCartPostUpdate is executed as a part of cartCallback...
                    shoptet.cart.getCartContent(true, cartCallback);
                } else {
                    // ...otherwise we have to call the function directly
                    shoptet.cart.handleCartPostUpdate(form.getAttribute('action'), eventElement);
                    hideSpinner();
                }
            }
            if (callingFunctions === 'functionsForStep1') {
                shoptet.cart.functionsForStep1();
            }
        };

        var failedCallback = function(response) {
            hideSpinner();
            $('html, body').animate({
                scrollTop: 0
            }, shoptet.config.animationDuration);
            if (callingFunctions === 'functionsForCart') {
                if (
                    shoptet.config.orderingProcess.step === 0
                    || body.classList.contains('cart-window-visible')
                ) {
                    // In that case, the operation was executed either
                    // in the cart (ordering process) or in opened cart widget (cart-window-visible)
                    var cartCallback = function() {
                        shoptet.cart.handleCartPostUpdate(form.getAttribute('action'), eventElement);
                    };
                    shoptet.cart.getCartContent(true, cartCallback);
                } else {
                    delete shoptet.events.cartLoaded;
                }
            }
        };

        if (shoptet.csrf.enabled) {
            shoptet.csrf.injectToken($(form)[0]);
        }

        shoptet.ajax.makeAjaxRequest(
            action + cartUrlSuffix,
            shoptet.ajax.requestTypes.post,
            shoptet.common.serializeForm(form),
            {
                'success': successCallback,
                'failed': failedCallback,
                'complete': completeCallback
            },
            {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            }
        );

        return false;
    }

    /**
     * Update quantity in cart by AJAX call
     *
     * @param {Object} $input
     * $input = input field with whose value will be cart updated
     * @param {Number} timeout
     * timeout = number of miliseconds between input change and cart update
     */
    function updateQuantityInCart($input, timeout) {
        clearTimeout(shoptet.runtime.setPcsTimeout);
        var $parentForm = $input.parents('form');
        var displaySpinner = true;
        if (!shoptet.abilities.feature.extended_ajax_cart && $('body').hasClass('user-action-visible')) {
            displaySpinner = false;
        }
        shoptet.runtime.setPcsTimeout = setTimeout(function() {
            shoptet.cart.ajaxSubmitForm(
                $parentForm.attr('action'),
                $parentForm[0],
                'functionsForCart',
                'cart',
                displaySpinner
            );
        }, timeout);
    }

    /**
     * Remove item from cart by AJAX call
     *
     * @param {Object} $el
     * $el = HTML element containing item to remove
     */
    function removeItemFromCart($el) {
        var $parentForm = $el.parents('form');
        var displaySpinner = true;
        if (!shoptet.abilities.feature.extended_ajax_cart && $('body').hasClass('user-action-visible')) {
            displaySpinner = false;
        }
        shoptet.cart.ajaxSubmitForm(
            $parentForm.attr('action'),
            $parentForm[0],
            'functionsForCart',
            'cart',
            displaySpinner
        );
    }

    /**
     * Toggle related products visibility in cart
     *
     * @param {Object} $target
     * $target = HTML element which has to be revealed/hidden
     */
    function toggleRelatedProducts($target) {
        $target.toggleClass('visible');
        $target.prev('tr').toggleClass('related-visible');
    }

    document.addEventListener("DOMContentLoaded", function() {
        var $html = $('html');
        // cart - set pcs form
        $html.on('change', 'input.amount', function() {
            if ($(this).parents('.cart-table').length
                || $(this).parents('.cart-widget-product-amount').length
                || $(this).parents('.ao-product').length
            ) {
                shoptet.cart.updateQuantityInCart($(this), shoptet.config.updateQuantityTimeout);
            }
        });

        $html.on('submit', '.quantity-form', function(e) {
            e.preventDefault();
            shoptet.cart.updateQuantityInCart($(this).find('input.amount'), shoptet.config.updateQuantityTimeout);
            return false;
        });

        // Show and hide related items in cart
        $html.on('click', '.show-related', function(e) {
            e.preventDefault();
            var $tr = $(this).parents('tr').next('.related');
            shoptet.cart.toggleRelatedProducts($tr);
            $tr.find('img').unveil();
        });

        // Check discount coupon
        $html.on('click', '#continue-order-button', function(e) {
            if ($('#discountCouponCode').val()) {
                e.preventDefault();
                showMessage(shoptet.messages['discountCouponWarning'], 'warning', '', false, true);
            }
        });

        // Choose free gift
        $html.on('click', '.free-gift-trigger', function(e) {
            e.preventDefault();
            $('.free-gifts-wrapper img').each(function() {
                $(this).attr('src', $(this).attr('data-src'));
            });

            var content = $('.free-gifts-wrapper').html();
            shoptet.modal.open({
                html: shoptet.content.colorboxHeader + content + shoptet.content.colorboxFooter,
                width: shoptet.modal.config.widthSm,
                maxWidth: shoptet.modal.config.maxWidth,
                maxHeight: shoptet.modal.config.maxHeight,
                className: shoptet.modal.config.classSm
            });
            $('#colorbox input').remove();
        });

        $html.on('click', '.remove-item', function(e) {
            e.preventDefault();
            $el = $(this);
            shoptet.cart.removeItemFromCart($el);
        });

        $html.on('click', '#colorbox .free-gifts label', function(e) {
            e.preventDefault();
            var id = $(this).attr('for');
            $('.free-gifts input').each(function() {
                if (id == $(this).attr('id')) {
                    $(this).prop('checked', true);
                } else {
                    $(this).prop('checked', false);
                }
            });
            shoptet.modal.close();
            var $form = $('.free-gifts-wrapper form');
            shoptet.cart.ajaxSubmitForm(
                $form.attr('action'),
                $form[0],
                'functionsForCart',
                'cart',
                true
            );
        });

        $html.on('submit', 'form.pr-action, form.variant-submit', function(e) {
            e.preventDefault();
            if (shoptet.variantsCommon.handleSubmit($(this))) {
                var $this = $(this);
                var $amount = $this.find('.amount');
                var decimals = $amount.data('decimals') || 0;
                var max =
                    shoptet.helpers.toFloat($amount.data('max')) || shoptet.config.defaultProductMaxAmount;
                var min =
                    shoptet.helpers.toFloat($amount.data('min')) || shoptet.helpers.resolveMinimumAmount(decimals);
                var value = $amount.length ? shoptet.helpers.toFloat($amount.val()) : 1;
                if (value > max) {
                    $amount.val(max);
                }
                if (value < min) {
                    $amount.val(min);
                }
                shoptet.cart.ajaxSubmitForm(
                    $this.attr('action'),
                    $this[0],
                    'functionsForCart',
                    'cart',
                    true
                );
            } else {
                shoptet.config.expressCheckoutAddToCart = undefined;
            }
        });

        $html.on('submit', '.discount-coupon form', function(e) {
            e.preventDefault();
            var $this = $(this);
            shoptet.cart.ajaxSubmitForm(
                $this.attr('action'),
                $this[0],
                'functionsForCart',
                'cart',
                true
            );
        });

        var $additionalInformation = $('#additionalInformation');
        if ($additionalInformation.length && !$additionalInformation.hasClass('visible')) {
            toggleRequiredAttributes($additionalInformation, 'remove', false);
        }

        var $shippingAddress = $('#shipping-address');
        if ($shippingAddress.length && !$shippingAddress.hasClass('visible')) {
            toggleRequiredAttributes($shippingAddress, 'remove', false);
        }

        var $companyInfo = $('#company-info');
        if ($companyInfo.length && !$companyInfo.hasClass('visible')) {
            toggleRequiredAttributes($companyInfo, 'remove', false);
        }

        $html.on('change', 'input[name="customerGroupId"]', function() {
            var $additionalInformation = $('#additionalInformation');
            if ($(this).hasClass('show-full-profile')) {
                if (!$additionalInformation.hasClass('visible')) {
                    $additionalInformation.addClass('visible');
                    if ($(this).hasClass('is-wholesale')) {
                        if (!$('#company-shopping').parent().hasClass('unveiled')) {
                            $('#company-shopping').trigger('click');
                        }
                        $('#company-shopping').parent().hide();
                        toggleRequiredAttributes($companyInfo, 'add', false);
                    } else {
                        $('#company-shopping').parent().show();
                        toggleRequiredAttributes($companyInfo, 'remove', false);
                    }
                    toggleRequiredAttributes($additionalInformation, 'add', true);
                }
            } else {
                if ($additionalInformation.hasClass('visible')) {
                    $additionalInformation.removeClass('visible');
                    toggleRequiredAttributes($additionalInformation, 'remove', true);
                }
            }
        });

        $html.on('change', '#company-shopping', function() {
            if (!$companyInfo.hasClass('visible')) {
                toggleRequiredAttributes($companyInfo, 'remove', false);
            } else {
                toggleRequiredAttributes($companyInfo, 'add', false);
            }
        });

        $html.on('change', '#another-shipping', function() {
            const disableScroll = $(this).attr('data-disable-scroll');
            shoptet.global.toggleAnotherShipping(disableScroll ? false : undefined);
        });

        var $anotherShipping = $('#another-shipping');
        if ($anotherShipping.length && $anotherShipping[0].hasAttribute('data-change')) {
            $anotherShipping.prop('checked', true);
            shoptet.global.toggleAnotherShipping(false);
        }
    });

    shoptet.cart = shoptet.cart || {};
    shoptet.scripts.libs.cart.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'cart');
    });

})(shoptet);
