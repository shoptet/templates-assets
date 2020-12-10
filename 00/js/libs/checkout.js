(function(shoptet) {

    /**
     * Activate payments related to selected shipping,
     * deactivate others
     *
     * @param {String} billingIds
     * billingIds = ids of possible payments of selected shipping
     */
    function changePaymentRelations(billingIds) {
        if (billingIds != null) {
            $('.billing-description, .billing-name').addClass('inactive');
            var $radios = $('input[name="billingId"], input[name="gopayPayInstrument"]');
            $radios.attr('disabled', true);
            $('.table-payu').css('display', 'none');

            $.each(billingIds.split(','), function(i, val) {
                val = $.trim(val);
                $('#billingId-' + val).attr('disabled', false);
                //gopay radio
                $('.billingId-' + val).attr('disabled', false);
                $('#descr-billingId-' + val)
                    .removeClass('inactive')
                    .addClass('active');
                $('.name-billingId-' + val)
                    .removeClass('inactive')
                    .addClass('active');
            });
            if (!$('#payu-template label').hasClass('inactive')) {
                $('.table-payu').css('display', 'block');
            }
        }
    }

    /**
     * Call relations between shipping and billing
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function callShippingBillingRelations() {
        var dataRel = $('#order-shipping-methods .radio-wrapper.active').find('input').attr('data-relations');
        shoptet.checkout.changePaymentRelations(dataRel);
    }

    /**
     * Replacing chosen shipping&billing
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function replacingChosenShippingAndBilling() {
        var $shippingAndBillingTables = $('.shipping-billing-table');
        var $shippingAndBillingSummary = $('#shipping-billing-summary');
        $shippingAndBillingSummary.html('');
        $shippingAndBillingTables.each(function() {
            var $activeLine = $(this).find('div.radio-wrapper.active');
            if (!$activeLine.length) {
                $activeLine = $(this).find('div.radio-wrapper:first');
                $activeLine.find('input').prop('checked', true);
            }
            var activeLineText = $activeLine.find('label b').clone();
            activeLineText.find('.question-tooltip').remove();
            activeLineText = activeLineText.text();
            var singleLine;
            if ($activeLine.find('.payment-shipping-price').html() == null) {
                $activeLine = $('.payu-billing-info');
                singleLine = '<div class="recapitulation-single"><span>'
                    + $activeLine.closest('.shipping-billing-table').attr('data-type')
                    + '</span> <strong><span>' + $activeLine.find('.payment-shipping-price').html()
                    + '</span> ' + activeLineText + '</strong></div>';
            } else {
                singleLine = '<div class="recapitulation-single"><span>'
                    + $activeLine.closest('.shipping-billing-table').attr('data-type')
                    + '</span> <strong><span>' + $activeLine.find('.payment-shipping-price').html()
                    + '</span> ' + activeLineText + '</strong></div>';
            }
            $shippingAndBillingSummary.append(singleLine);
        });
        $shippingAndBillingSummary.find('.recapitulation-single:last').addClass('last');
    }

    /**
     * Reveal matrix price in ordering process
     *
     * @param {String} shippingActive
     * shippingActive = id of selected shipping method
     * @param {String} billingActive
     * billingActive = id of selected billing method
     */
    function revealMatrixPrice(shippingActive, billingActive) {
        $('.matrixprice').css('display', 'none');
        $('.matrixprice#mp-' + shippingActive + '-' + billingActive + ', .matrixprice#wv-' +
            shippingActive + '-' + billingActive).css('display', 'block');
    }

    /**
     * Display price corresponding to selected shipping and billing methods
     *
     * This function does not accept any arguments.
     */
    function displaySelectedPriceByShippingBillingMethods() {
        if ($('#order-shipping-methods').length) {
            var shippingActive = '';
            var billingActive = '';
            var $activeShippingDiv = $('#order-shipping-methods div.active');
            var $activeBillingDiv = $('#order-billing-methods div.active');

            if ($activeShippingDiv.length) {
                shippingActive = $activeShippingDiv.data('id');
            }

            if ($activeBillingDiv.length) {
                billingActive = $activeBillingDiv.data('id');
            }

            if(shippingActive !== '') {
                shippingActive = shippingActive.replace('shipping-', '');
            }

            if(billingActive !== '') {
                billingActive = billingActive.replace('billing-', '');
            }

            shoptet.checkout.revealMatrixPrice(shippingActive, billingActive);
        }
    }

    /**
     * Check first possible billing method
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function checkFirstPossibleBillingMethod() {
        var checkerLocker = 0;
        var $billingTable = $('#order-billing-methods > div');

        if (!$billingTable.find('input:checked').length) {
            $billingTable.find('input').each(function() {
                if (!$(this).closest('label').hasClass('inactive') && checkerLocker === 0) {
                    $(this).attr('checked', true);
                    $(this).closest('div').addClass('active');
                    checkerLocker = 1;
                }
            });
        }

        shoptet.checkout.replacingChosenShippingAndBilling();
        shoptet.checkout.displaySelectedPriceByShippingBillingMethods();
    }

    /**
     * Set first possible combination of shipping and billing
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function setFirstPossibleShippingAndBilling() {
        var $shippingTable = $('#order-shipping-methods');
        if (!$shippingTable.find('input:checked').length) {
            $shippingTable.find('input:first').attr('checked', true);
            shoptet.checkout.callShippingBillingRelations();
        }
        shoptet.checkout.checkFirstPossibleBillingMethod();
    }

    /**
     * Set active shipping and payment
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function setActiveShippingAndPayments() {
        if (shoptet.abilities.elements.recapitulation_in_checkout) {
            var container = '<div id="shipping-billing-summary" class="order-recapitulation"></div>';
            $('.order-summary-item.price').before(container);
        }
        var $shippingAndBillingTables = $('.shipping-billing-table');
        $shippingAndBillingTables.each(function() {
            $(this).find('input[type="radio"]:checked').closest('div').addClass('active');
        });
        shoptet.checkout.callShippingBillingRelations();
        shoptet.checkout.gopaySelectHelper();
        shoptet.checkout.replacingChosenShippingAndBilling();
        shoptet.checkout.displaySelectedPriceByShippingBillingMethods();
    }

    /**
     * Check if selected billing method is active
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function checkIsSelectedActive() {
        if ($('#order-billing-methods > div.active label').hasClass('inactive')) {
            $('#order-billing-methods > div.active input').attr('checked', false);
            $('#order-billing-methods > div.active').removeClass('active');
            var checkerLocker = 0;
            $('#order-billing-methods > div').each(function() {
                if (!$(this).find('label').hasClass('inactive') && checkerLocker === 0) {
                    $(this).find('input').click();
                    $(this).addClass('active');
                    checkerLocker = 1;
                }
            });
        }
        shoptet.checkout.replacingChosenShippingAndBilling();
        shoptet.checkout.displaySelectedPriceByShippingBillingMethods();
    }

    /**
     * PayU handling
     * Used in ordering process, step 1
     *
     * This function does not accept any arguments.
     */
    function payu() {
        var $payuTable = $('#payu_');
        $payuTable.remove();
        $payuTable.appendTo($('#payu-template'));
    }

    /**
     * GoPay handling
     * sets/unsets name=billingId for hidden input with GoPay selection
     */
    function gopaySelectHelper() {
        if (
            $('#order-billing-methods .active').find('input[name="gopayPayInstrument"]').attr('checked') === 'checked'
        ) {
            $('.gopay-billing').attr('name', 'billingId');
        } else {
            $('.gopay-billing').removeAttr('name');
        }
    }

    /**
     * Used in ordering process
     *
     * This function does not accept any arguments.
     */
    function getStatedValues() {
        deliveryCountryIdValue = $('#deliveryCountryId').val();
        regionCountryIdValue = $('#deliveryRegionId').val();
        currencyCode = $('#payment-currency').val();
    }

    /**
     * Fill form values in 2nd step
     *
     * @param {Object} $fields
     * $fields = JSON object with selected delivery address
     */
    function setFieldValues($fields) {
        if (!$fields) {
            return false;
        }

        for (key in $fields) {
            if (document.getElementById(key)) {
                var field = $('#'+ key);
                field.val($fields[key]);
            }
        }
    }

    /**
     * Toggle another shipping address in 2nd step of order
     *
     * This function does not accept any arguments.
     */
    function toggleAnotherShipping(scroll) {
        if (typeof scroll === 'undefined') {
            scroll = true;
        }
        var $el = $('#shipping-address');
        var $billCountryId = $('#billCountryId');
        var $regionSelect = $('.region-select');

        if ($el.hasClass('visible')) {
            $el.removeClass('visible');
            toggleRequiredAttributes($el, 'remove', false);

            var defaultCountryVal = $billCountryId.find('option[data-default-option]').val();
            var defaultRegionVal = $regionSelect.find('option[data-default-option]').val();
            var $defaultBillRegionId = $('.region-select[data-country=' + defaultCountryVal + ']');
            $billCountryId.val(defaultCountryVal);
            $defaultBillRegionId.val(defaultRegionVal);
            shoptet.global.restoreDefaultRegionSelect($defaultBillRegionId, defaultRegionVal);
            shoptet.validatorZipCode.updateZipValidPattern($billCountryId);
            shoptet.validatorCompanyId.updateCompanyIdValidPattern();
        } else {
            $el.addClass('visible');
            toggleRequiredAttributes($el, 'add', false);
            if (scroll) {
                scrollToEl($el);
            }
        }

        var $billRegionId = $('#billRegionId');
        var $billRegionIdInput = $('#billRegionIdInput');
        var $billCountryIdInput = $('#billCountryIdInput');

        $billCountryId.attr('disabled', !$billCountryId.is(':disabled'));
        $regionSelect.attr('disabled', $billRegionIdInput.is(':disabled'));

        $billCountryIdInput.attr({
            'disabled': !$billCountryIdInput.is(':disabled'),
            'value': $billCountryId.find('option:selected').val()
        });
        $billRegionIdInput.attr({
            'disabled': !$billRegionIdInput.is(':disabled'),
            'value': $billRegionId.find('option:selected').val()
        });
        $('#deliveryRegionId').attr({
            'value': $billRegionId.find('option:selected').val()
        });
    }

    /**
     * Handler for dynamic resize of modal window
     *
     * This function does not accept any arguments.
     */
    function modalMagic() {
        if($('.branch-saved:visible').length) {
            $('.branch-saved').click(function() {
                shoptet.modal.close();
            });
        }
        return false;
    }

    /**
     * Handler for choosing branches
     *
     * @param {String} href
     * href = href of loaded colorbox
     * @param {String} branchWrap
     * branchWrap = parent element of displayed select, which has to be focused
     * @param {String} branchId
     * branchId = id of selected branch
     * @param {String} branchInput
     * branchInput = selector of input element holding selected branch id
     */
    function chooseABranchModal(href, branchWrap, branchId, branchInput) {
        shoptet.modal.open({
            maxWidth: shoptet.config.colorbox.maxWidth,
            width : shoptet.config.colorbox.widthMd,
            className: shoptet.config.colorbox.classMd,
            href: href,
            onComplete: function() {
                $(branchWrap + ' select:first').focus();
                $(branchId + ' option[value="' + $(branchInput).val() + '"]').attr('selected', 'selected');
                $(branchId).trigger('change');
            }
        });
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
        var headerHeight = shoptet.abilities.feature.fixed_header ? $('#header').height() : 0;
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
            !shoptet.checkout.compareHeight(shoptet.checkout.$checkoutContent, shoptet.checkout.$checkoutSidebar)
        ) {
            shoptet.checkout.fixSidebar();
        } else {
            shoptet.checkout.$checkoutSidebar.removeAttr('style');
        }
    }

    /**
     * Attach event listeners and add functionality for elements in checkout
     *
     * This function does not accept any arguments.
     */
    function setupDeliveryShipping() {
        var $html = $('html');
        if (typeof personalCollectionUrl !== 'undefined') {
            $html.on('click', '.personal-collection-choose-branch a', function(e) {
                e.preventDefault();
                var $parentsElement = $(this).closest('div.radio-wrapper');
                $parentsElement.find('.personal-collection-choose-branch[name="shippingId"]').prop('checked', true);
                shoptet.checkout.chooseABranchModal(
                    personalCollectionUrl,
                    '#personal-collection-wrapper',
                    '#personalCollectionPointId',
                    '.personal-collection-point-id'
                );
            });

            $html.on('click', '#personal-collection-wrapper a.enabled', function(e) {
                e.preventDefault();
                var pointId = $(this).data('point-id');
                var pointTitle = $(this).data('point-title');
                var completePointName = shoptet.messages['chosenBranch'] + ': ' + pointTitle + ' ';
                var changePointLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $('.personal-collection-choose-branch').html(completePointName).append(changePointLink);
                $('.personal-collection-point-id').val(pointId);
                shoptet.modal.close();
            });

        }

        var postDeliveryPoints = [];
        if (typeof naPostuUrl !== 'undefined') {
            postDeliveryPoints.push({
                prefix: 'na-postu',
                url: naPostuUrl
            });
        }
        if (typeof doBalikovnyUrl !== 'undefined') {
            postDeliveryPoints.push({
                prefix: 'do-balikovny',
                url: doBalikovnyUrl
            });
        }
        if (typeof hupostPostaPontUrl !== 'undefined') {
            postDeliveryPoints.push({
                prefix: 'posta-pont',
                url: hupostPostaPontUrl
            });
        }

        for (var i = 0; i < postDeliveryPoints.length; i++) {

            (function(i) {

                $html.on('click', '.' + postDeliveryPoints[i].prefix + '-choose-post a', function(e) {
                    e.preventDefault();
                    $parentsElement = $(this).closest('div.radio-wrapper');
                    $parentsElement.find('.' + postDeliveryPoints[i].prefix + '-choose-radio[name="shippingId"]:first')
                        .prop('checked', true);
                    shoptet.modal.open({
                        href: postDeliveryPoints[i].url,
                        width : shoptet.config.colorbox.widthMd,
                        className: shoptet.config.colorbox.classMd,
                        onComplete: function() {
                            shoptet.modal.shoptetResize();
                        }
                    });
                });

                $html.on(
                    'click',
                    '#' + postDeliveryPoints[i].prefix + '-result .'
                    + postDeliveryPoints[i].prefix + '-choose-button',
                    function() {
                        var $tr = $(this).closest('tr');
                        var address = $.trim($tr.find('.' + postDeliveryPoints[i].prefix + '-address').html());
                        var newString = shoptet.messages['chosenPost'] + ' ' + address + ' ';
                        var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                        $parentsElement.find('.' + postDeliveryPoints[i].prefix + '-choose-post')
                            .html(newString).append($newLink).show(0);
                        if (postDeliveryPoints[i].prefix === 'posta-pont') {
                            var branchId = $.trim($tr.find('.' + postDeliveryPoints[i].prefix + '-branch-id').html());
                            $('#' + postDeliveryPoints[i].prefix + '-hidden').val(branchId);
                        } else {
                            var zipCode = $.trim($tr.find('.' + postDeliveryPoints[i].prefix + '-zip-code').html());
                            $('#' + postDeliveryPoints[i].prefix + '-hidden').val(zipCode);
                        }
                        shoptet.modal.close();
                    }
                );
            })(i);
        }

        if (typeof ulozenkaUrl !== 'undefined') {

            $html.on('click', '.ulozenka-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('div.radio-wrapper');
                $parentsElement.find('.ulozenka-choose-branch[name="shippingId"]').prop('checked', true);
                shoptet.checkout.chooseABranchModal(
                    ulozenkaUrl + '?id=' + $(this).parents('label').siblings('.ulozenka-choose-branch').attr('value')
                    + '&deliveryCountryId=' + $('#deliveryCountryId').val(),
                    '#ulozenka-wrapper',
                    '#branchId',
                    '.ulozenka-branch-id'
                );
            });

            $html.on('submit', '#ulozenka-form', function(e) {
                e.preventDefault();
                var name = $('#ulozenka-wrapper .branch-name').text();
                var newString = shoptet.messages['chosenBranch'] + ': ' + name + ' ';
                var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $parentsElement.find('.ulozenka-choose').html(newString).append($newLink).show(0);
                $parentsElement.find('.ulozenka-branch-id').val($('#branchId option:selected').val());
                shoptet.checkout.modalMagic();
            });

            $html.on('change', '#branchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) != '') {
                    $('#ulozenka-form .loader').removeClass('no-display');
                    $('#ulozenka-form .branch-saved').removeClass('branch-saved-visible');
                    $.ajax({
                        url: '/action/Ulozenka/getBranchInformation/?id=' + id,
                        type: 'GET',
                        headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
                        success: function(responseData) {
                            $('#ulozenka-wrapper .detail-information').html(responseData);
                            $('#ulozenka-form .loader').addClass('no-display');
                            $('#ulozenka-form .branch-saved').addClass('branch-saved-visible');
                            $('#ulozenka-form').submit();
                            shoptet.modal.shoptetResize();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#ulozenka-form .loader').addClass('no-display');
                        }
                    });
                }
            });

        }

        if (typeof zasilkovnaUrl !== 'undefined') {

            $html.on('click', '.zasilkovna-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('div.radio-wrapper');
                $parentsElement.find('.zasilkovna-choose-branch[name="shippingId"]').prop('checked', true);
            });
        }

        if (typeof glsParcelShopUrl !== 'undefined') {
            var glsParcelShopId = '';
            var glsParcelShopName = '';
            var glsModalOpen = false;

            $html.on('click', '.gls-parcel-shop-choose a', function(e) {
                e.preventDefault();
                if (glsModalOpen) {
                    return;
                }
                glsModalOpen = true;
                $parentsElement = $(this).closest('div.radio-wrapper');
                $parentsElement.find('.gls-parcel-shop-choose-branch[name="shippingId"]').prop('checked', true);
                shoptet.modal.open({
                    href: glsParcelShopUrl,
                    width : shoptet.config.colorbox.widthLg,
                    className: shoptet.config.colorbox.classLg,
                    onComplete: function() {
                        shoptet.modal.shoptetResize();
                    },
                    onCleanup: function() {
                        glsModalOpen = false;
                        if (glsParcelShopId) {
                            var completeBranchName = glsParcelShopName + ' ';
                            var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                            $parentsElement.find('.gls-parcel-shop-choose')
                                .html(completeBranchName).append($newLink).show(0);
                            $('input#gls-parcel-shop-hidden').val(glsParcelShopId);
                        }
                    }
                });
            });

            $html.on('click', '.gls-parcel-shop-confirm', function() {
                $.colorbox.close();
            });

            window.glsPSMap_OnSelected_Handler = function(data) {
                glsParcelShopId = data.pclshopid;
                glsParcelShopName = data.name;
                var $confirmWrapper = $('.gls-parcel-shop-confirm-wrapper');
                if ($confirmWrapper.hasClass('no-display')) {
                    $('.gls-parcel-shop-confirm-wrapper').removeClass('no-display');
                    shoptet.modal.shoptetResize();
                }
            }
        }

        if (typeof dpdParcelShopUrl !== 'undefined') {

            $html.on('click', '.dpd-cz-parcel-shop-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('div.radio-wrapper');
                $parentsElement.find('.dpd-cz-parcel-shop-choose-branch[name="shippingId"]').prop('checked', true);
                shoptet.checkout.chooseABranchModal(
                    dpdParcelShopUrl,
                    '#dpd-cz-parcel-shop-wrapper',
                    '#dpdParcelShopBranchId',
                    '.dpd-cz-branch-id'
                );
            });

            $html.on('submit', '#dpd-cz-parcel-shop-form', function(e) {
                e.preventDefault();
                var branchName = $('#dpd-cz-parcel-shop-wrapper .branch-name').text();
                var branchStreet = $('#dpd-cz-parcel-shop-wrapper .branch-street').text();
                var branchCity = $('#dpd-cz-parcel-shop-wrapper .branch-city').text();
                var branchZip = $('#dpd-cz-parcel-shop-wrapper .branch-zip').text();
                var completeBranchName = shoptet.messages['chosenBranch'] + ': '
                    + branchCity + ' ' + branchName + ' (' + branchStreet + ', ' + branchZip + ' ' + branchCity + ') ';
                var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $parentsElement.find('.dpd-cz-parcel-shop-choose').html(completeBranchName).append($newLink).show(0);
                $parentsElement.find('.dpd-cz-branch-id').val($('#dpdParcelShopBranchId option:selected').val());
                shoptet.checkout.modalMagic();
            });

            $html.on('change', '#dpdParcelShopBranchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) !== '') {
                    $('#dpd-cz-parcel-shop-form .loader').removeClass('no-display');
                    $('#dpd-cz-parcel-shop-form .branch-saved').removeClass('branch-saved-visible');
                    $.ajax({
                        url: '/action/DpdParcelShop/getBranchInformation/?id=' + id,
                        type: 'GET',
                        headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
                        success: function(responseData) {
                            $('#dpd-cz-parcel-shop-wrapper .detail-information').html(responseData);
                            $('#dpd-cz-parcel-shop-form .loader').addClass('no-display');
                            shoptet.modal.shoptetResize();
                            $('#dpd-cz-parcel-shop-form .branch-saved').addClass('branch-saved-visible');
                            $('#dpd-cz-parcel-shop-form').submit();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#dpd-cz-parcel-shop-form .loader').addClass('no-display');
                        }
                    });
                }
            });

        }

        if (typeof isDpdOnSaturday !== 'undefined') {

            $('.dpd-check-zip a').on('click', function(event) {
                event.preventDefault();
                $('#dpd-zip-check-modal .dpd-zip-check-result').hide();
                $('#dpd-zip-check-text').val("");
                $('#dpd-zip-check-modal').show();
                shoptet.modal.open({
                    maxWidth: shoptet.config.colorbox.maxWidth,
                    width : shoptet.config.colorbox.widthMd,
                    className: shoptet.config.colorbox.classMd,
                    inline: true,
                    href: '#dpd-zip-check-modal',
                    onClosed: function() {
                        $('#dpd-zip-check-modal').hide();
                    }
                });
            });

            $('#dpd-zip-check-modal form').on('submit', function(event) {
                event.preventDefault();
                $('#dpd-zip-check-modal .dpd-zip-check-result').hide();
                var zip = $('#dpd-zip-check-text').val();
                if (zip !== '') {
                    $.ajax({
                        url: '/action/DpdPrivate/checkSaturdayZipCode/?zipCode=' + zip,
                        headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
                        success: function(response) {
                            if(response == '1') {
                                $('#dpd-zip-check-valid').show();
                            } else {
                                $('#dpd-zip-check-invalid').show();
                            }
                            shoptet.modal.shoptetResize();
                        },
                        error: function() {
                        }
                    });
                }

            });
        }

        if (typeof pplPartnerUrl !== 'undefined') {

            $html.on('click', '.ppl-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('div.radio-wrapper');
                $parentsElement.find('.ppl-partner-cz-choose-branch[name="shippingId"]').prop('checked', true);
                shoptet.checkout.chooseABranchModal(
                    pplPartnerUrl,
                    '#ppl-partner-cz-wrapper',
                    '#pplPartnerBranchId',
                    '#ppl-partner-cz-branch-id'
                );
            });

            $html.on('submit', '#ppl-partner-cz-form', function(e) {
                e.preventDefault();
                var name = $('#ppl-partner-cz-wrapper .branch-name').text();
                var newString = shoptet.messages['chosenBranch'] + ': ' + name + ' ';
                var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $parentsElement.find('.ppl-choose').html(newString).append($newLink).show(0);
                $('#ppl-partner-cz-branch-id').val($('#pplPartnerBranchId option:selected').val());
                shoptet.checkout.modalMagic();
            });

            $html.on('change', '#pplPartnerBranchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) != '') {
                    $('#ppl-partner-cz-form .loader').removeClass('no-display');
                    $('#ppl-partner-cz-form .branch-saved').removeClass('branch-saved-visible');
                    $.ajax({
                        url: '/action/PplPartner/getBranchInformation/?id=' + id,
                        type: 'GET',
                        headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
                        success: function(responseData) {
                            $('#ppl-partner-cz-wrapper .detail-information').html(responseData);
                            $('#ppl-partner-cz-form .loader').addClass('no-display');
                            shoptet.modal.shoptetResize();
                            $('#ppl-partner-cz-form .branch-saved').addClass('branch-saved-visible');
                            $('#ppl-partner-cz-form').submit();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#ppl-partner-cz-form .loader').addClass('no-display');
                        }
                    });
                }
            });

        }
    }

    function displayApplePay() {
        try {
            if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
                $('.apple-pay').show();
            }
        } catch (err) {}
    }

    shoptet.checkout = shoptet.checkout || {};
    shoptet.scripts.libs.checkout.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'checkout');
    });
    shoptet.checkout.$checkoutContent = $('#checkoutContent');
    shoptet.checkout.$checkoutSidebar = $('#checkoutSidebar');

    if (detectResolution(shoptet.config.breakpoints.md) && shoptet.checkout.$checkoutSidebar.length) {
        if (
            !shoptet.checkout.compareHeight(shoptet.checkout.$checkoutContent, shoptet.checkout.$checkoutSidebar)
        ) {
            shoptet.checkout.fixSidebar();
        }

        $(window).bind('scroll', function() {
            shoptet.checkout.handleWithSidebar();
        });

        $('html').bind('contentResized', function() {
            if (
                !shoptet.checkout.compareHeight(shoptet.checkout.$checkoutContent, shoptet.checkout.$checkoutSidebar)
            ) {
                shoptet.checkout.fixSidebar();
            } else {
                shoptet.checkout.$checkoutSidebar.removeAttr('style');
            }
        });
    }

    document.addEventListener("ajaxDone", function() {
        shoptet.checkout.setupDeliveryShipping();
    });

    document.addEventListener("DOMContentLoaded", function() {

        if (shoptet.config.orderingProcess.step === 1) {
            shoptet.checkout.getStatedValues();
            shoptet.checkout.setActiveShippingAndPayments();
            shoptet.checkout.payu();
            shoptet.checkout.displayApplePay();
            shoptet.checkout.setupDeliveryShipping();
        }

        // remember customer data (via ajax)
        var $orderForm = $('#order-form');
        if ($orderForm.length) {
            var lastData = $orderForm.serialize();
            $('#order-form input').blur(function() {
                var data = $(this).closest('form').serialize();
                if (data !== lastData) {
                    shoptet.ajax.makeAjaxRequest(
                        shoptet.config.customerDataUrl,
                        shoptet.ajax.requestTypes.post,
                        data,
                        {},
                        {
                            'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                        }
                    );
                    lastData = data;
                }
            });
        }

        var $html = $('html');
        $html.on('click', '#orderFormButton', function() {
            $('#orderFormSubmit').click();
        });

        $html.on('click', '#orderFormSubmit', function() {
            var $el = $('input[name="shippingId"].choose-branch:checked');
            if ($el.length) {
                var code = $el.attr('data-code');
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
            if (this.value == '-1'){
                $fields.each(function() {
                    $(this).val('');
                });
            } else {
                shoptet.checkout.setFieldValues($(this).find('option:selected').data('record'));
            }
            /* Validate */
            $fields.each(function() {
                shoptet.scripts.signalNativeEvent('change', this);
            });
        }).change();

        $html.on('change', '.ordering-process #deliveryRegionId', function () {
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
        $html.on('change', '#select-country-payment select', function() {
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

        // cart step2 - active-inactive shipping and delivery
        $html.on('click', '.shipping-billing-table div.no-payu', function() {
            if ($(this).hasClass('active')) {
                //return false;
            } else {
                var $thisLabel = $(this).find('label');
                if ($thisLabel.hasClass('inactive')) {

                } else {
                    $(this).closest('.shipping-billing-table').find('div.active').removeClass('active')
                        .find('input').attr('checked', false);
                    $(this).addClass('active').find('input').attr('checked', true);
                    shoptet.checkout.callShippingBillingRelations();
                    shoptet.checkout.checkIsSelectedActive();
                    shoptet.checkout.gopaySelectHelper();
                    if($('a:not(".branch-changed")', this).length) {
                        $('a', this).trigger('click');
                    }
                }
            }
        });

        $html.on('click', '#order-billing-methods > div.no-payu', function() {
            $('.payu-billing input').each(function() {
                $(this).attr('checked', false);
            });
        });

        // PayU
        $html.on('click', '.table-payu input', function() {
            $activeLine = $('.payu-billing-info');
            $('#order-billing-methods > .active > input').attr('checked', false);
            $('#order-billing-methods div.active').removeClass('active');
            $activeLine.addClass('active').find('> input').prop('checked', true);
            singleLine = $activeLine.parents('.shipping-billing-table').attr('data-type')
                + ': <strong>' + $activeLine.find('b').text() + '<span>'
                + $activeLine.find('.payment-shipping-price').html() + '</span></strong>';
            $('#shipping-billing-summary').find('.recapitulation-single.last').html(singleLine);

            shoptet.checkout.displaySelectedPriceByShippingBillingMethods();
        });

        $payuTable = $('#payu_');
        if ($payuTable.length && typeof shoptet.config.selectedBillingId !== 'undefined') {
            $('#payu-template > input[name="billingId"]').siblings('label').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
            if($('#payu-template input[name="billingId"]').is(':checked')) {
                $('#order-billing-methods .radio-wrapper').removeClass('active');
                $payuTable.find('input[value="' + shoptet.config.payuPayType + '"]').attr('checked', true);
                $('#order-billing-methods tr.no-payu').on('click', function() {
                    $payuTable.find(':checked').attr('checked', false);
                });
            }
        }
    });

})(shoptet);
