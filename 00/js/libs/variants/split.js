(function(shoptet) {

    function handler() {
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
                shoptet.content.codeId = $('#product-detail-form').attr('data-codeid');
                hideMsg(true);
                var postData = [];
                var valueIsMissing = false;
                $splitParameters.each(function() {
                    var value = $('input:checked, option:selected', this).val();
                    if ($.trim(value) === '') {
                        valueIsMissing = true;
                        $(this).parents('.variant-list').removeClass('variant-selected');
                    } else {
                        $(this).parents('.variant-list').addClass('variant-selected');
                    }
                    postData[postData.length] = value;
                });

                if (!valueIsMissing) {
                    var dataString = 'productId=';
                    sep = '&';
                    var productId = $('#product-detail-form input[name="productId"]').val();
                    if ($.trim(productId) === '') {
                        return;
                    }

                    dataString += productId;
                    for (idx = 0; idx < postData.length; idx++) {
                        dataString += sep + 'parameterValueId[]=' + postData[idx];
                    }

                    shoptet.variantsCommon.disableAddingToCart();

                    if (shoptet.variantsSplit.cache.hasOwnProperty(dataString)) {
                        // Data from request are already cached, use them.
                        shoptet.variantsSplit.callback(shoptet.variantsSplit.cache[dataString]);
                    } else {
                        // Data are not cached, make new AJAX request to get them.
                        // TODO: Use ajaxRequest
                        showSpinner();
                        $.ajax({
                            url: '/action/ProductDetail/GetVariantDetail/',
                            type: 'POST',
                            data: dataString,
                            success: function (responseData) {
                                var response = {};
                                response.error = false;
                                if (responseData.error) {
                                    showMessage(responseData.error, 'error', '', false, false);
                                    shoptet.variantsCommon.reasonToDisable = responseData.error;
                                    response.error = responseData.error;
                                }

                                response.data = responseData.data;
                                shoptet.variantsSplit.cache[dataString] = response;
                                shoptet.variantsSplit.callback(response);
                            },
                            error: function () {
                                //
                            },
                            complete: function() {
                                hideSpinner();
                            }
                        });
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

    function callback(response) {
        if (response.error) {
            showMessage(response.error, 'error', '', false, false);
            shoptet.variantsCommon.reasonToDisable = response.error;
            shoptet.scripts.signalCustomEvent('ShoptetVariantUnavailable');
            shoptet.variantsSplit.loadedData = false;
            return;
        }
        var data = response.data;
        shoptet.variantsSplit.loadedData = data;
        shoptet.content.codeId = data.id;
        var $form = $('#product-detail-form');
        var $formAmount = $('#product-detail-form .amount');
        $form.find('input[name=priceId]').val(data.id);

        shoptet.tracking.trackProducts(
            $form[0],
            data.id,
            'ViewContent',
            [shoptet.tracking.trackFacebookPixel]
        );

        if (data.variantImage) {
            var replaceInfo = resolveImageFormat();
            replaceImage(data.variantImage.big, data.variantImage[replaceInfo.format], replaceInfo.link);
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
            cofidisCalculator($('.price-final .parameter-dependent:visible'), $cofidis);
        }
        shoptet.scripts.signalCustomEvent('ShoptetVariantAvailable');
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
        if (typeof checkDiscountFlag === 'function') {
            checkDiscountFlag();
        }
    }

    shoptet.variantsSplit = shoptet.variantsSplit || {};
    shoptet.scripts.libs.variantsSplit.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'variantsSplit');
    });
    shoptet.variantsSplit.cache = {};
    shoptet.variantsSplit.loadedData = false;
})(shoptet);
