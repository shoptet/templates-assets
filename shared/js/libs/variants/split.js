(function(shoptet) {

    function handler() {
        shoptet.surcharges.initSurcharges();

        var selector = '.variant-list .hidden-split-parameter, .variant-list .split-parameter';
        var $splitParameters = $(selector);

        if ($splitParameters.length) {
            if (shoptet.variantsCommon.hasToDisableCartButton()) {
                shoptet.variantsCommon.disableAddingToCart();
            } else {
                shoptet.variantsCommon.enableAddingToCart();
            }

            $splitParameters.bind('change ShoptetSelectedParametersReset', function(e) {
                shoptet.scripts.signalCustomEvent('ShoptetSplitVariantParameterChange', e.target);
                shoptet.variantsSplit.showVariantDependent();
                shoptet.surcharges.updatePrices();
                hideMsg(true);
                var parameterValues = [];
                var parameterNames = [];
                var valueIsMissing = false;
                $splitParameters.each(function() {
                    parameterNames.push($(this).attr('data-parameter-id'));
                    var value = $('input:checked, option:selected', this).val();
                    if ($.trim(value) === '') {
                        valueIsMissing = true;
                        shoptet.variantsCommon.reasonToDisable = shoptet.messages['chooseVariant'];
                        $(this).parents('.variant-list').removeClass('variant-selected');
                    } else {
                        $(this).parents('.variant-list').addClass('variant-selected');
                    }
                    parameterValues.push(value);
                });

                if (!valueIsMissing) {
                    var tempVariantCode = [];
                    for (var i = 0; i < parameterValues.length; i++) {
                        tempVariantCode.push(String(parameterNames[i]) + '-' + String(parameterValues[i]));
                    }
                    tempVariantCode.sort();
                    var variantCode = tempVariantCode.join('-');

                    shoptet.variantsCommon.disableAddingToCart();
                    if($('input:checked, option:selected', this).attr('data-preselected')) {
                        shoptet.variantsSplit.getData(variantCode, 0);
                    } else {
                        shoptet.variantsSplit.getData(variantCode, 1);
                    }
                }
            });

            if (
                $('input:not(.variant-default):checked, option:not(.variant-default):selected',
                $splitParameters).length
            ) {
                $splitParameters.trigger('change');
            }
        }
    }

    function getData(variantCode, trackGA) {
        if (shoptet.variantsSplit.necessaryVariantData.hasOwnProperty(variantCode)) {
            // Existing variant
            var data = shoptet.variantsSplit.necessaryVariantData[variantCode];
            var $form = $('form#product-detail-form');
            var $formAmount = $('#product-detail-form .amount');
            $form.find('input[name=priceId]').val(data.id);

            shoptet.tracking.trackProducts(
                $form[0],
                data.id,
                'ViewContent',
                [shoptet.tracking.trackFacebookPixel]
            );
            if (trackGA) {
                shoptet.tracking.trackProducts(
                    $form[0],
                    data.id,
                    'detail',
                    [shoptet.tracking.trackGoogleProductDetail]
                );
            }

            if (data.variantImage) {
                var replaceInfo = resolveImageFormat();
                shoptet.products.replaceImage(
                    data.variantImage.big,
                    data.variantImage[replaceInfo.format],
                    replaceInfo.link
                );
            }
            if (data.isNotSoldOut) {
                shoptet.variantsCommon.enableAddingToCart();
                hideMsg();
            } else {
                shoptet.variantsCommon.reasonToDisable = shoptet.messages['unavailableVariant'];
                showMessage(shoptet.variantsCommon.reasonToDisable, 'error', '', false, false);
            }
            $formAmount.val(
                shoptet.helpers.toLocaleFloat(data.minimumAmount, data.decimalCount, true)
            );
            $formAmount.data({
                'min': data.minimumAmount,
                'max': data.maximumAmount,
                'decimals': data.decimalCount
            });
            var $cofidis = $('#cofidis');
            if ($cofidis.length) {
                shoptet.cofidis.calculator($('.price-final-holder:visible'), $cofidis);
            }
            shoptet.scripts.signalCustomEvent('ShoptetVariantAvailable');
        } else {
            // Non existing variant
            shoptet.variantsCommon.reasonToDisable = shoptet.messages['unavailableVariant'];
            showMessage(shoptet.messages['unavailableVariant'], 'error', '', false, false);
            shoptet.scripts.signalCustomEvent('ShoptetVariantUnavailable');
        }
    }

    function showVariantDependent() {
        var parameterIds = [];
        var showDefault = false;
        $('.variant-list .hidden-split-parameter, .variant-list .split-parameter').each(function () {
            var parameterId = this.id.replace('parameter-id-', '');
            var selected = $(this).find('input:checked, option:selected');
            var valueId = selected.val();
            if (valueId == '') {
                showDefault = true;
            } else {
                parameterIds.push(parameterId + '-' + valueId);
            }
        });
        $('.p-detail-inner .parameter-dependent, .p-code .parameter-dependent')
            .addClass(shoptet.variantsCommon.noDisplayClasses);
        var classToDisplay = 'default-variant';
        if (!showDefault) {
            parameterIds.sort();
            classToDisplay = parameterIds.join('-');
        }
        $('.p-detail-inner .parameter-dependent.' + classToDisplay + ', .p-code .parameter-dependent.' + classToDisplay)
            .removeClass(shoptet.variantsCommon.noDisplayClasses);
        if (typeof shoptet.products.checkDiscountFlag === 'function') {
            shoptet.products.checkDiscountFlag();
        }
    }

    shoptet.variantsSplit = shoptet.variantsSplit || {};
    shoptet.scripts.libs.variantsSplit.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'variantsSplit');
    });
})(shoptet);
