(function (shoptet) {
    function initWatchdog() {
        var hasPromotion,
        actualPrice,
        onStock;
        var watchdogCodeId = null;

        watchdogDataHandler();

        // focus out of priceUnder right onto drop checkbox without price filled needs timeout
        var timer = 0;
        $('#drop').click(function(e) {
            if(timer == 0) {
                if ($(this).is(':checked')) {
                    $('#priceUnder').focus();
                } else {
                    $('#priceUnder').val('');
                }
            } else {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        });

        $('#priceUnder').on('focus', function() {
            $('#drop').prop('checked', true);
        });

        $('#priceUnder').on('keyup blur', function() {
            var priceUnder = parseInt($('#priceUnder').val()) || 0;
            if(priceUnder <= 0) {
                // handle focusout by clicking on checkbox
                timer = 1;
                timer = setTimeout(function(){ timer = 0; }, 500);
                $('#drop').prop('checked', false);
                $('#drop').siblings('.disclaimer').addClass('hidden');
                $(this).val('');
                shoptet.modal.resize();
                return;
            }
            if(priceUnder > actualPrice ) {
                switchCheckboxProp('#drop', true);
            } else {
                switchCheckboxProp('#drop', false);
                $('#drop').prop('checked', true);
            }
            shoptet.modal.resize();
        });

        /**
         * Watchdog AJAX POST
         */
        $('#watchdog-form').on('submit', function() {
            hideMsg(true);
            var $form = $(this)
            var $notificationEmailField = $form.find('.notificationEmail');
            var notificationEmail = $notificationEmailField.val();

            if($form.find('input.watchdog-checkbox:checked').length < 1 ) {
                showMessage(shoptet.messages['watchdogType'], 'warning', '', true, false, '.watchdog-messages');
                return false;
            }

            if ($form.find("input:checkbox[name='consents\[\]'].required:not(:checked)").length > 0) {
                showMessage(shoptet.messages['watchdog-consent-required'], 'warning', '', true, false, '.watchdog-messages');
                return false;
            }

            if ($notificationEmailField && notificationEmail == '') {
                showMessage(shoptet.messages['watchdogEmailEmpty'], 'warning', '', true, false, '.watchdog-messages');
                return false;
            }

            if($('#drop:checked').length < 1) {
                $('#priceUnder').val('');
            }

            //serialize consents to backend-friendly format (list of consent IDs)
            var consents =
                $form.find("input:checkbox[name='consents\\[\\]']:checked, input:hidden[name='consents\\[\\]']")
                    .map(function() { return this.value })
                    .toArray();

            var watchdogData = {
                pricelistCodeId: watchdogCodeId,
                onStock: $('#onStock').prop('checked') ? 1 : 0,
                hasPromotion: $('#hasPromotion').prop('checked') ? 1 : 0,
                priceUnder: parseInt($('#priceUnder').val()) || 0,
                consents: consents
            };

            if (notificationEmail) {
                watchdogData.email = notificationEmail
            }

            $.ajax({
                url: '/action/ProductDetail/watchdogSetup/?variantId=' + watchdogCodeId,
                type: 'POST',
                headers: {
                    'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                },
                dataType: 'json',
                data: watchdogData
            })
                .always(onWatchdogFinished);

            return false;
        });

        $('#watchdog-reset').on('click', function() {
            hideMsg(true);

            var watchdogData = {
                pricelistCodeId: watchdogCodeId,
                onStock: 0,
                hasPromotion: 0,
                priceUnder: 0
            };

            $.ajax({
                url: '/action/ProductDetail/watchdogSetup/?variantId=' + watchdogCodeId,
                type: 'POST',
                headers: {
                    'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                },
                dataType: 'json',
                data: watchdogData
            })
                .always(onWatchdogFinished);

            return false;
        });

        function onWatchdogFinished(response) {
            if (response.code == 500) {
                showMsg('danger', response.message, '', true, false, '.watchdog-messages')
            } else {
                shoptet.modal.close();
            }
        }

        function watchdogDataHandler() {
            watchdogCodeId = $('#product-detail-form input[name="priceId"]').val();
            var $simpleHolder = $('#watchdog-data');

            if($simpleHolder.data('simpleholder') == 'TRUE') {

                actualPrice = $simpleHolder.data('customerprice');
                hasPromotion = $simpleHolder.data('haspromotion');
                onStock = $simpleHolder.data('stock');
                changeDisclaimerVisibility();
                loadExistingData();
            } else {

                var $simpleVariants = $('#watchdog-simple-variants-select');
                $simpleVariants.find("option[data-index='0']").remove();
                var selectedVariantIndex = $('#watchdog-simple-variants-select').find('option[data-codeid="' + watchdogCodeId + '"]').data('index');
                $simpleVariants.find("option[data-index='" + (selectedVariantIndex > 0 ? selectedVariantIndex : 1) + "']").prop('selected', true);

                $simpleVariants.change(function() {

                    var $activeOption = $('#watchdog-simple-variants-select option:selected');
                    if ($activeOption.attr('data-codeid')) {
                        watchdogCodeId = $activeOption.attr('data-codeid');
                        actualPrice = $activeOption.data('customerprice');
                        hasPromotion = $activeOption.data('haspromotion');
                        onStock = $activeOption.data('stock');

                        changeDisclaimerVisibility();
                        loadExistingData();
                    }
                });

                $simpleVariants.change();
            }
        }

        function loadExistingData() {
            var watchdogData = {
                pricelistCodeId: watchdogCodeId
            };
            $.ajax({
                url: '/action/ProductDetail/watchdogInfo/?variantId=' + watchdogCodeId,
                type: 'GET',
                headers: {
                    'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                },
                dataType: 'json',
                data: watchdogData
            }).done(function(result) {
                var response = new shoptet.ajax.AjaxResponse(result);
                if (response.isFailed()) {
                    return false;
                }

                var onStockPayload = response.getFromPayload('onStock');
                $('#onStock').prop('checked', onStockPayload == true);

                var hasPromotionPayload = response.getFromPayload('hasPromotion');
                $('#hasPromotion').prop('checked', hasPromotionPayload == true);

                var priceUnderPayload = response.getFromPayload('priceUnder');
                $('#priceUnder').val(priceUnderPayload > 0 ? priceUnderPayload : '');
                $('#drop').prop('checked', priceUnderPayload > 0);

                var existingEmailPayload = response.getFromPayload('email');
                $('#watchdog-form').find('.notificationEmail').val(existingEmailPayload);

                if(onStockPayload || hasPromotionPayload || priceUnderPayload || existingEmailPayload) {
                    $('#watchdog-reset').removeClass('hide');
                }
                shoptet.modal.resize();
            });
        }

        function changeDisclaimerVisibility() {
            switchCheckboxProp('#hasPromotion', hasPromotion);

            switchCheckboxProp('#onStock', onStock == shoptet.config.inStockAvailabilityId);

            var priceUnder = parseInt($('#priceUnder').val());
            switchCheckboxProp('#drop', actualPrice < priceUnder);
            shoptet.modal.resize();
        }

        function switchCheckboxProp(elementID, isDisabled) {
            if (isDisabled) {
                $(elementID).prop('disabled', true).prop('checked', false);
                $(elementID).siblings('.disclaimer').removeClass('hidden');
            } else {
                $(elementID).prop('disabled', false);
                $(elementID).siblings('.disclaimer').addClass('hidden');
            }
            shoptet.modal.resize();
        }
    }

    shoptet.watchdog = shoptet.watchdog || {};
    shoptet.scripts.libs.watchdog.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'watchdog');
    });

})(shoptet);
