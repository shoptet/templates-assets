(function(shoptet) {

    /**
     * Toggle another shipping address in 2nd step of order
     *
     * This function does not accept any arguments.
     */
    function toggleAnotherShipping(scroll) {
        shoptet.global.toggleAnotherShipping(scroll);
    }



    /**
     * Compares height of two elements
     *
     * @param {Object} $elToCompare
     * $elToCompare = element to compare
     * @param {Object} $comparedElement
     * $comparedElement = compared element
     */
    function compareHeight($elToCompare, $comparedElement) {
        return $elToCompare.height() < $comparedElement.height();
    }

    /**
     * Fix sidebar in ordering process
     *
     * This function does not accept any arguments.
     */
    function fixSidebar() {
        var windowHeight = $(window).height();
        var sidebarHeight = shoptet.checkout.$checkoutSidebar.height();
        var offset = shoptet.checkout.$checkoutContent.offset();
        var scrollTop = $(document).scrollTop();
        var headerHeight = shoptet.abilities.feature.fixed_header
    ? ($('.header-navigation').length ? $('.header-navigation').height() : $('#header').height())
    : 0;
        if (windowHeight + scrollTop < document.documentElement.scrollHeight) {
            if ((offset.top < scrollTop + headerHeight) && detectResolution(shoptet.config.breakpoints.md)) {
                if (windowHeight - headerHeight > sidebarHeight) {
                    shoptet.checkout.$checkoutSidebar.css({
                        'position': 'relative',
                        'top': scrollTop - offset.top + headerHeight
                    });
                } else {
                    var bottomLine = offset.top + sidebarHeight;
                    if (windowHeight + scrollTop > bottomLine) {
                        shoptet.checkout.$checkoutSidebar.css({
                            'position': 'relative',
                            'top': scrollTop - sidebarHeight + windowHeight - offset.top
                        });
                    } else {
                        shoptet.checkout.$checkoutSidebar.css({
                            'position': 'static'
                        });
                    }
                }
            } else {
                shoptet.checkout.$checkoutSidebar.removeAttr('style');
            }
        }
    }

    /**
     * Helper function for fixing sidebar in ordering process
     *
     * This function does not accept any arguments.
     */
    function handleWithSidebar() {
        if (
            !compareHeight(shoptet.checkout.$checkoutContent, shoptet.checkout.$checkoutSidebar)
        ) {
            fixSidebar();
        } else {
            shoptet.checkout.$checkoutSidebar.removeAttr('style');
        }
    }

    function validateBillingForm(data, vatIdInput, isInitialCheck = false) {
        if (shoptet.config.onlineVatIdValidation && vatIdInput) {
            if (vatIdInput.value.trim() === '') {
                shoptet.validator.validatorMessage.hide($('#vatId'));
            } else {
                shoptet.validator.showValidatorMessage(
                    $('#vatId'),
                    shoptet.messages['validatorVatIdWaiting'],
                    'msg-info'
                );
            }
        }

        var shouldUpdateVatIdValidation = shoptet.config.onlineVatIdValidation && vatIdInput && vatIdInput.value.trim() !== '';

        $.ajax({
            url: '/action/OrderingProcess/step2CustomerAjax/?isInitialCheck=' + isInitialCheck,
            type: 'POST',
            data: data,
            success: function(response) {
                response = new shoptet.ajax.AjaxResponse(response);
                try {
                    var html = response.getFromPayload('html');
                    if (html) {
                        response.showNotification();
                        shoptet.tracking.updateCartDataLayer(response);
                        shoptet.tracking.updateDataLayerCartInfo(response);
                        $('#summary-box').html(html)
                    }
                    if (shouldUpdateVatIdValidation) {
                        if (response.getFromPayload('vatIdValidationStatus') === 2) {
                            shoptet.validator.validatorMessage.hide($('#vatId'));
                            shoptet.validator.showValidatorMessage(
                                $('#vatId'),
                                shoptet.messages['validatorVatIdValid'],
                                'msg-ok'
                            );
                        } else if (response.getFromPayload('vatIdValidationStatus') === 4) {
                            shoptet.validator.validatorMessage.hide($('#vatId'));
                            shoptet.validator.showValidatorMessage(
                                $('#vatId'),
                                shoptet.messages['validatorVatIdInvalidOrderForbid'],
                                'msg-error'
                            );
                        } else if (response.getFromPayload('vatIdValidationStatus') === 5) {
                            shoptet.validator.validatorMessage.hide($('#vatId'));
                            shoptet.validator.showValidatorMessage(
                                $('#vatId'),
                                shoptet.messages['validatorVatIdInvalidOssRegime'],
                                'msg-info'
                            );
                        } else {
                            shoptet.validator.validatorMessage.hide($('#vatId'));
                            shoptet.validator.showValidatorMessage(
                                $('#vatId'),
                                shoptet.messages['validatorVatIdInvalid'],
                                'msg-error'
                            );
                        }
                    }
                } catch (error) {
                    console.log(error);
                    if (shouldUpdateVatIdValidation) {
                        shoptet.validator.validatorMessage.hide($('#vatId'));
                        shoptet.validator.showValidatorMessage(
                            $('#vatId'),
                            shoptet.messages['validatorVatIdInvalid'],
                            'msg-error'
                        );
                    }
                }
            },
            error: function(error) {
                console.log(error);
                if (shouldUpdateVatIdValidation) {
                    shoptet.validator.validatorMessage.hide($('#vatId'));
                    shoptet.validator.showValidatorMessage(
                        $('#vatId'),
                        shoptet.messages['validatorVatIdInvalid'],
                        'msg-error'
                    );
                }
            }
        });
    }

    shoptet.checkout = shoptet.checkout || {};
    shoptet.scripts.libs.checkout.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'checkout');
    });
    shoptet.checkout.$checkoutContent = $('#checkoutContent');
    shoptet.checkout.$checkoutSidebar = $('#checkoutSidebar');
    shoptet.checkout.handleWithSidebar = handleWithSidebar;

    document.addEventListener("DOMContentLoaded", function() {
        if (detectResolution(shoptet.config.breakpoints.md) && shoptet.checkout.$checkoutSidebar.length) {
            if (
                !compareHeight(shoptet.checkout.$checkoutContent, shoptet.checkout.$checkoutSidebar)
            ) {
                fixSidebar();
            }

            $(window).bind('scroll', function() {
                handleWithSidebar();
            });

            $('html').bind('contentResized', function() {
                handleWithSidebar();
            });
        }

        // remember and validate customer data (via ajax)
        var $orderForm = $('#order-form');
        if ($orderForm.length) {
            var lastData = $orderForm.serialize();
            var vatIdInput = $orderForm.find('#vatId')[0];

            // validate form on page load only if VAT ID is filled
            if (shoptet.config.onlineVatIdValidation && vatIdInput?.value.trim() !== '') {
                validateBillingForm(lastData, vatIdInput, true);
            }

            $('#order-form input, #order-form select').blur(function(e) {
                var data = $(this).closest('form').serialize();
                if (data !== lastData) {
                    lastData = data;
                    validateBillingForm(data, e.target.id === 'vatId' ? e.target : null);
                }
            });
        }

        var $document = $(document);
        $document.on('click', '#orderFormButton', function() {
            $('#orderFormSubmit').click();
        });

        $document.on('click', '#orderFormSubmit', function() {
            var $el = $('input[name="shippingId"].choose-branch:checked');
            if ($el.length) {
                var code = $el.attr('data-external') ? 'external-shipping' : $el.attr('data-code');
                var $label = $el.siblings('label');
                var $chosen = $label.find('.chosen');
                if (!$chosen.length) {
                    if ($label.find('.zasilkovna-choose').length && !$label.find('.zasilkovna-default').length) {
                        return true;
                    }
                    showMessage(shoptet.messages['choose-' + code], 'error', '', false, false);
                    scrollToEl($label);
                    return false;
                }
            }
        });

        $('#shippingAddressBox').on('change', function() {
            var $fields = $('#shipping-address .form-option-block').find('input');
            if (this.value == '-1') {
                $fields.each(function() {
                    $(this).val('');
                });
            } else {
                shoptet.checkoutShared.setFieldValues($(this).find('option:selected').data('record'));
            }
            /* Validate */
            $fields.each(function() {
                shoptet.scripts.signalNativeEvent('change', this);
            });
        }).change();

        $document.on('change', '.ordering-process #deliveryRegionId', function() {
            var $parentForm = $(this).parents('form');
            shoptet.cart.ajaxSubmitForm(
                $parentForm.attr('action'),
                $parentForm[0],
                'functionsForStep1',
                true,
                true
            );
        });

        // Change country in checkout process
        $document.on('change', '#select-country-payment select', function() {
            if ($(this).hasClass('not-ajax')) {
                return false;
            } else {
                if (
                    $('#deliveryCountryId').val() != deliveryCountryIdValue
                    ||
                    $('#payment-currency').val() != currencyCode
                ) {
                    var $parentForm = $(this).parents('form');
                    shoptet.cart.ajaxSubmitForm(
                        $parentForm.attr('action'),
                        $parentForm[0],
                        'functionsForStep1',
                        true,
                        true
                    );
                }
            }
        });
    });

})(shoptet);
