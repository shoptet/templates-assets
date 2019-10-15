(function(shoptet) {

    function handler() {
        var $simpleVariants;
        var $variant;
        var $activeOption;

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
            if ($activeOption.attr('data-codeid')) {
                shoptet.content.codeId = $activeOption.attr('data-codeid');
            }
            if (shoptet.variantsCommon.hasToDisableCartButton()) {
                shoptet.variantsCommon.disableAddingToCart();
            } else {
                shoptet.variantsCommon.enableAddingToCart();
            }
        }

        $simpleVariants.bind('change ShoptetSelectedParametersReset', function(ev) {
            hideMsg(true);

            if ($(this).is('input')) {
                $variant = $(this);
                $variant.parents('.variant-list')
                    .find('.advanced-parameter-inner').removeClass('yes-before');
                if (ev.type === 'ShoptetSelectedParametersReset') {
                    return;
                }
                $variant.siblings('.advanced-parameter-inner').addClass('yes-before');

            } else {
                $variant = $(this).find('option:selected');
            }

            shoptet.variantsSimple.switcher($variant);

            shoptet.variantsCommon.reasonToDisable = $variant.attr('data-disable-reason');
            if (shoptet.variantsCommon.reasonToDisable) {
                shoptet.variantsCommon.disableAddingToCart();
                showMessage(shoptet.variantsCommon.reasonToDisable, 'error', '', false, false);
            }

        });

    }

    function switcher($variant) {
        if (shoptet.variantsCommon.hasToDisableCartButton()) {
            shoptet.variantsCommon.disableAddingToCart();
        } else {
            shoptet.variantsCommon.enableAddingToCart();
        }

        if ($variant.attr('data-codeid')) {
            $('#product-detail-form').find('input[name=priceId]').val($variant.attr('data-codeid'));
            shoptet.content.codeId = $variant.attr('data-codeid');
        }

        shoptet.tracking.trackProducts(
            $('#product-detail-form')[0],
            $variant.data('codeid'),
            'ViewContent',
            [shoptet.tracking.trackFacebookPixel]
        );

        var bigImageUrl = $variant.attr('data-big');
        if (typeof bigImageUrl !== 'undefined') {
            var replaceInfo = resolveImageFormat();
            replaceImage(bigImageUrl, $variant.attr('data-' + replaceInfo.format), replaceInfo.link);
        }

        var variantIndex = $variant.data('index');
        if (typeof variantIndex !== 'undefined') {
            $('.p-detail-inner .choose-variant, .p-detail-inner .default-variant,' +
                ' .p-code .choose-variant, .p-code .default-variant')
                .addClass(shoptet.variantsCommon.noDisplayClasses);
            if (variantIndex == 0) {
                $('.p-detail-inner .default-variant, .p-code .default-variant')
                    .removeClass(shoptet.variantsCommon.noDisplayClasses);
            } else {
                $('.p-detail-inner .choose-variant.' + variantIndex + ', .p-code .choose-variant.' + variantIndex)
                    .removeClass(shoptet.variantsCommon.noDisplayClasses);

                $('.add-to-cart .amount').val(shoptet.helpers.toLocaleFloat(
                    $variant.data('min'),
                    $variant.data('decimals'),
                    true
                    )
                );
                $('.add-to-cart .amount').data({
                    'min': $variant.data('min'),
                    'max': $variant.data('max'),
                    'decimals': $variant.data('decimals')
                });

                if($('#cofidis').length) {
                    cofidisCalculator($('.price-final .choose-variant:visible'), $('#cofidis'));
                }
            }
        }
        if (typeof checkDiscountFlag === 'function') {
            checkDiscountFlag();
        }
    }

    shoptet.variantsSimple = shoptet.variantsSimple || {};
    shoptet.scripts.libs.variantsSimple.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'variantsSimple');
    });
})(shoptet);
