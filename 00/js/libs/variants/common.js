(function(shoptet) {

    function disableAddingToCart() {
        document.getElementsByTagName('body')[0].classList.add('disabled-add-to-cart');
    }

    function enableAddingToCart() {
        document.getElementsByTagName('body')[0].classList.remove('disabled-add-to-cart', 'variant-not-chosen');
    }

    function hasToDisableCartButton() {
        if (!$('body').hasClass('type-product')) {
            return false;
        }

        if ($('.variant-list option[value=""]:selected, .variant-list option[data-disable-button="1"]:selected,' +
            ' .variant-default:checked, .variant-list .advanced-parameter input[data-disable-button="1"]:checked'
        ).length) {
            return true;
        } else {
            return false;
        }
    }

    function handleSubmit($el) {
        if ($el.attr('id') === 'product-detail-form') {
            var variantNotSelected = false;
            $('.variant-list select').each(function() {
                if($(this).val() == '') {
                    variantNotSelected = true;
                }
            });

            var $target = $('.variant-not-chosen-anchor');
            if (variantNotSelected || $('.variant-default').is(':checked')) {
                $('body').addClass('variant-not-chosen');
                shoptet.variantsCommon.reasonToDisable = shoptet.messages['chooseVariant'];
                showMessage(shoptet.variantsCommon.reasonToDisable, 'error', '', false, false);
                setTimeout(function() {
                    scrollToEl($target);
                }, shoptet.config.animationDuration);

                return false;
            }

            if ($('body').hasClass('disabled-add-to-cart')) {
                if (shoptet.variantsCommon.reasonToDisable) {
                    showMessage(shoptet.variantsCommon.reasonToDisable, 'error', '', false, false);
                    setTimeout(function() {
                        scrollToEl($target);
                    }, shoptet.config.animationDuration);
                }

                return false;
            }
        }
        return true;
    }

    /* Some browsers (e.g. Chrome) restore form values when going back in history
       but do not fire change events - this function trigger these events manually
    */
    function handleBrowserValueRestoration() {
        window.addEventListener('load', function() {
            var elements = document.querySelectorAll(
                '.variant-list select, .surcharge-list select, .advanced-parameter input:checked'
            );
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].value !== '') {
                    shoptet.scripts.signalNativeEvent('change', elements[i]);
                }
            }
        });
    }

    shoptet.variantsCommon = shoptet.variantsCommon || {};
    shoptet.scripts.libs.variantsCommon.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'variantsCommon');
    });
    shoptet.variantsCommon.reasonToDisable = false;
    shoptet.variantsCommon.noDisplayClasses = 'no-display noDisplay';

})(shoptet);
