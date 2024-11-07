(function(shoptet) {

    function handler() {
        var $simpleVariants;
        var $variant;
        var $activeOption;

        shoptet.surcharges.initSurcharges();

        if ($('.advanced-parameter input').length) {
            $simpleVariants = $('.advanced-parameter input');
            $activeOption = $('.advanced-parameter input:checked');
        } else {
            $simpleVariants = $('#simple-variants-select');
            $activeOption = $('#simple-variants-select option:selected');
        }

        if ($simpleVariants.length) {
            if ($activeOption.attr('data-disable-reason')) {
                shoptet.variantsCommon.reasonToDisable = $activeOption.attr('data-disable-reason');
            }
            if (shoptet.variantsCommon.hasToDisableCartButton()) {
                shoptet.variantsCommon.disableAddingToCart();
            } else {
                shoptet.variantsCommon.enableAddingToCart();
            }
        }

        $simpleVariants.bind('change ShoptetSelectedParametersReset', function(e) {
            shoptet.scripts.signalCustomEvent('ShoptetSimpleVariantChange', e.target);
            hideMsg(true);

            if ($(this).is('input')) {
                $variant = $(this);
                $variant.parents('.variant-list')
                    .find('.advanced-parameter-inner').removeClass('yes-before');
                if (e.type === 'ShoptetSelectedParametersReset') {
                    return;
                }
                $variant.siblings('.advanced-parameter-inner').addClass('yes-before');
            } else {
                $variant = $(this).find('option:selected');
            }

            shoptet.variantsSimple.switcher($variant);
            shoptet.variantsSimple.loadedVariant = $variant;
            shoptet.surcharges.updatePrices(e);

            shoptet.variantsCommon.reasonToDisable = $variant.attr('data-disable-reason');
            if (shoptet.variantsCommon.reasonToDisable) {
                shoptet.variantsCommon.disableAddingToCart();
                showMessage(shoptet.variantsCommon.reasonToDisable, 'error', '', false, false);
                shoptet.scripts.signalCustomEvent('ShoptetVariantUnavailable');
                if (shoptet.abilities.about.generation > 2) {
                    shoptet.xyDiscounts.updateFlags(null);
                }
            } else {
                shoptet.scripts.signalCustomEvent('ShoptetVariantAvailable');
                if (shoptet.abilities.about.generation > 2) {
                    shoptet.xyDiscounts.updateFlags($variant.attr('data-codeid'));
                }
            }
        });
    }

    function switcher($variant) {
        if (shoptet.variantsCommon.hasToDisableCartButton()) {
            shoptet.variantsCommon.disableAddingToCart();
        } else {
            shoptet.variantsCommon.enableAddingToCart();
        }

        var $form = $('form#product-detail-form');

        if ($variant.attr('data-codeid')) {
            $form.find('input[name=priceId]').val($variant.attr('data-codeid'));
        }

        var trackGA = $variant.attr('data-preselected') ? false : true;

        shoptet.tracking.trackProducts(
            $form[0],
            $variant.data('codeid'),
            'ViewContent',
            [shoptet.tracking.trackFacebookPixel]
        );
        if (trackGA) {
            shoptet.tracking.trackProducts(
                $form[0],
                $variant.data('codeid'),
                'detail',
                [
                    shoptet.tracking.trackGoogleProductDetail,
                    (product) => {
                        if (shoptet.config.googleAnalytics.isGa4Enabled) {
                            shoptet.tracking.trackGtagProductDetail(product);
                        }
                    },
                ]
            );
        }

        var bigImageUrl = $variant.attr('data-big');
        if (typeof bigImageUrl !== 'undefined') {
            var replaceInfo = resolveImageFormat();
            shoptet.products.replaceImage(
                bigImageUrl, $variant.attr('data-' + replaceInfo.format), replaceInfo.link
            );
        }

        var variantIndex = $variant.data('index');
        if (typeof variantIndex !== 'undefined') {
            $('.p-detail-inner .choose-variant, .p-detail-inner .default-variant,' +
                ' .p-code .choose-variant, .p-code .default-variant')
                .addClass(shoptet.variantsCommon.noDisplayClasses);
            if (variantIndex == 0) {
                $('.p-detail-inner .default-variant, .p-code .default-variant')
                    .removeClass(shoptet.variantsCommon.noDisplayClasses);

                if (shoptet.abilities.about.generation > 2) {
                    shoptet.quantityDiscounts.onVariantChange(false);
                }
            } else {
                $('.p-detail-inner .choose-variant.' + variantIndex + ', .p-code .choose-variant.' + variantIndex)
                    .removeClass(shoptet.variantsCommon.noDisplayClasses);

                $('.add-to-cart .amount').val(
                    $variant.data('min')
                ).attr({
                    'min': $variant.data('min'),
                    'max': $variant.data('max'),        
                }).data({
                    'min': $variant.data('min'),
                    'max': $variant.data('max'),
                    'decimals': $variant.data('decimals')
                });

                var $cofidis = $('#cofidis');
                if ($cofidis.length) {
                    shoptet.cofidis.calculator($('.price-final-holder:visible'), $cofidis);
                }
                shoptet.variantsCommon.updateQuantityTooltips(
                    $form, 
                    $variant.data('min'),
                    $variant.data('max')
                );

                if (shoptet.abilities.about.generation > 2) {
                    shoptet.quantityDiscounts.onVariantChange(!$variant.attr('data-quantity-discount-disabled'), Number($variant.attr('data-customerprice')), Number($variant.attr('data-min')));
                }
            }
        }
        if (typeof shoptet.products.checkDiscountFlag === 'function') {
            shoptet.products.checkDiscountFlag();
        }
    }

    shoptet.variantsSimple = shoptet.variantsSimple || {};
    shoptet.scripts.libs.variantsSimple.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'variantsSimple');
    });
    shoptet.variantsSimple.loadedVariant = false;
})(shoptet);
