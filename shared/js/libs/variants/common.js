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

    function updateQuantityTooltips($form, minimumAmount, maximumAmount) {

        var templateGeneration = shoptet.abilities.about.generation;

        if (templateGeneration === 3) {
            updateQuantityTooltip_3gen($form.find('.js-decrease-tooltip'), minimumAmount);
            updateQuantityTooltip_3gen($form.find('.js-increase-tooltip'), maximumAmount);
        } else if(templateGeneration === 2 || templateGeneration === 1) {
            updateQuantityTooltip_2gen($form.find('.js-remove-pcs-tooltip'), minimumAmount);
            updateQuantityTooltip_2gen($form.find('.js-add-pcs-tooltip'), maximumAmount);
        }else {
            return false;
        }

        function updateQuantityTooltip_2gen(el, val) {
            if (!el) {
                return false;
            }
            if (typeof el.tooltip().getTip() === 'undefined') {
                el.tooltip().show().hide();
            } else {
                var currentToolTipTitle = el.tooltip().getTip().find('.tooltip-content').text();
                var newToolTipTitle = replaceNumberAtTooltip(currentToolTipTitle, val);
                el.tooltip().getTip().find('.tooltip-content').text(newToolTipTitle);
            }
        }
        
        function updateQuantityTooltip_3gen(el, val) {
            if (!el) {
                return false;
            }
            var newToolTipTitle = replaceNumberAtTooltip(el.data('original-title'), val);
            el.attr('data-original-title', newToolTipTitle);
            fixTooltipAfterChange(el);
        }

        function replaceNumberAtTooltip(txt, val){
            return txt.replace(/\b\d+([\.,]\d+)?/g, val);
        }

    }

    function hideQuantityTooltips(){
        $('.js-increase-tooltip, .js-decrease-tooltip').tooltip('hide');
        $('.js-add-pcs-tooltip, .js-remove-pcs-tooltip').each(function(){
            $(this).tooltip().hide();
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
