(function(shoptet) {

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
            if ($(this).find('input[type="radio"]:checked').length) {
                $(this).find('input[type="radio"]:checked').closest('.radio-wrapper').addClass('active');
            } else {
                // For case when selected method was inactivated in the meantime
                // and there is no checked input
                var radio = $(this).find('input[type="radio"]').first();
                radio[0].checked = true;
                radio.closest('.radio-wrapper').addClass('active');
            }
        });
        shoptet.checkoutShared.callShippingBillingRelations();
    }

    /**
     * Call relations between shipping and billing
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function callShippingBillingRelations() {
        var billingIds = $('#order-shipping-methods .radio-wrapper.active')
            .find('input:checked').attr('data-relations');
        shoptet.checkoutShared.changePaymentRelations(billingIds);
    }

    /**
     * Activate payments related to selected shipping,
     * deactivate others
     *
     * @param {String} billingIds
     * billingIds = ids of possible payments of selected shipping
     */
    function changePaymentRelations(billingIds) {
        if (billingIds) {
            $('#order-billing-methods .radio-wrapper').addClass('inactive-child');
            $('.billing-name').addClass('inactive');
            $('.billing-name').removeClass('active');
            var $radios = $('input[name="billingId"], input[name="gopayPayInstrument"]');
            $radios.prop('disabled', true);
            $('.table-payu').css('display', 'none');

            billingIds = billingIds.split(',');
            $.each(billingIds, function(i) {
                var val = $.trim(billingIds[i]);
                $('#billingId-' + val).prop('disabled', false);
                //gopay radio
                $('.billingId-' + val).prop('disabled', false);
                // Adding class to a label
                var $activeBilling = $('.name-billingId-' + val);
                $activeBilling.removeClass('inactive').addClass('active');
                $activeBilling.parents('.radio-wrapper').removeClass('inactive-child');
            });
            // Checked GoPay inputs switches billingId attriute of hidden input
            if ($('#order-billing-methods .radio-wrapper.active').find('input[name="gopayPayInstrument"]').length) {
                $('.gopay-billing').attr('name', 'billingId');
            } else {
                $('.gopay-billing').removeAttr('name');
                $('input[name="gopayPayInstrument"]').prop('checked', false);
            }
            // Payu table and inputs behavior
            if (!$('#payu-template label').hasClass('inactive')) {
                $('.table-payu').css('display', 'block');
            }
            if (!$('#payu-template').hasClass('active')) {
                $('#payu-template input').prop('checked', false);
            }
        }
        shoptet.checkoutShared.checkIsSelectedActive();
    }

    /**
     * Replacing chosen shipping&billing
     * Used in ordering process, step 1
     *
     * This function does not accept any arguments.
     */
    function replacingChosenShippingAndBilling() {
        var $shippingAndBillingTables = $('.shipping-billing-table');
        var $shippingAndBillingSummary = $('#shipping-billing-summary');
        $shippingAndBillingSummary.html('');
        $shippingAndBillingTables.each(function() {
            var $activeLine = $(this).find('.radio-wrapper.active');
            if (!$activeLine.length) {
                $activeLine = $(this).find('.radio-wrapper:first');
                $activeLine.find('input').prop('checked', true);
            }
            var tableCode = $activeLine.closest('.shipping-billing-table').attr('data-type-code');
            var ev;
            let priceWVDataAttrName
            if (tableCode === 'shipping') {
                // Shipping
                ev = 'ShoptetShippingMethodUpdated';
                shoptet.checkoutShared.activeShipping = $activeLine[0];
                priceWVDataAttrName = 'shipping-price-wv';
            } else {
                // Billing
                ev = 'ShoptetBillingMethodUpdated';
                shoptet.checkoutShared.activeBilling = $activeLine[0];
                priceWVDataAttrName = 'billing-price-wv';
                togglePreAuthorizationBoxBySelectedBillingMethod();
            }
            shoptet.scripts.signalCustomEvent(ev);
            var activeLineText = $activeLine.find('.shipping-billing-name').clone();
            activeLineText.find('.question-tooltip').remove();
            activeLineText = activeLineText.text();
            var singleLine;
            const priceWV = $activeLine.find('.payment-shipping-price').data(priceWVDataAttrName);
            singleLine = `<div class="recapitulation-single recapitulation-shipping-billing" data-testid="recapCartItem">
                <span class="recapitulation-shipping-billing-label">
                    ${$activeLine.closest('.shipping-billing-table').attr('data-type')}:
                </span>
                <strong class="recapitulation-shipping-billing-info" data-testid="recapDeliveryMethod">
                    <span data-testid="recapItemPrice">
                        ${$activeLine.find('.payment-shipping-price').html()}
                    </span>
                    ${activeLineText}
                </strong>
                ${!shoptet.config.defaultVatIncluded && priceWV ? (
                    `<strong class="recapitulation-shipping-billing-info--withVat" data-testid="recapItemPriceWithVat">
                        ${priceWV.ShoptetFormatAsCurrency(
                            undefined, undefined, shoptet.config.decPlacesSystemDefault
                        )} ${shoptet.messages['withVat']}
                    </strong>`
                ) : ''}
            </div>`;
            $shippingAndBillingSummary.append(singleLine);
        });
        $shippingAndBillingSummary.find('.recapitulation-single:last').addClass('last');
        shoptet.checkoutShared.displaySelectedPriceByShippingBillingMethods();
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
            var $activeShippingEl = $('#order-shipping-methods .radio-wrapper.active');
            var $activeBillingEl = $('#order-billing-methods .radio-wrapper.active');

            if ($activeShippingEl.length) {
                shippingActive = $activeShippingEl.data('id');
            }

            if ($activeBillingEl.length) {
                billingActive = $activeBillingEl.data('id');
            }

            if (shippingActive !== '') {
                shippingActive = shippingActive.replace('shipping-', '');
            }

            if (billingActive !== '') {
                billingActive = billingActive.replace('billing-', '');
            }

            shoptet.checkoutShared.updatePriceSummary(shippingActive, billingActive);
        }
    }

    function togglePreAuthorizationBoxBySelectedBillingMethod() {
        var submethod = $(shoptet.checkoutShared.activeBilling).attr('data-submethod');

        if (submethod === 'applepay' || submethod === 'googlepay' || submethod === 'scheme') {
            if (shoptet.abilities.about.generation === 3) {
                $('.js-preauthorization-box').addClass('visible');
            } else {
                $('.js-preauthorization-box').show();
            }
        } else {
            if (shoptet.abilities.about.generation === 3) {
                $('.js-preauthorization-box').removeClass('visible');
            } else {
                $('.js-preauthorization-box').hide();
            }
        }
    }

    /**
     * Check if selected billing method is active
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function checkIsSelectedActive() {
        if ($('#order-billing-methods .radio-wrapper.active label').hasClass('inactive')) {
            $('#order-billing-methods .radio-wrapper.active input').prop('checked', false);
            $('#order-billing-methods .radio-wrapper.active').removeClass('active');
            var checkerLocker = 0;
            $('#order-billing-methods .radio-wrapper').each(function() {
                if (checkerLocker === 0 && !$(this).find('label').hasClass('inactive')) {
                    $(this).find('input').prop('checked', true);
                    $(this).addClass('active');
                    checkerLocker = 1;
                }
            });
        }
        shoptet.checkoutShared.replacingChosenShippingAndBilling();
    }

    /**
     * Get PIS Banks list
     */
    function getPISBanksData() {
        shoptet.checkoutShared.shoptetPayPIS.banks = [];
        shoptet.checkoutShared.shoptetPayPIS.countries = [];
        $.ajax({
            url: '/action/ShoptetPayPaymentData/getBankProviderData/',
            type: 'GET',
            success: function(responseData) {
                try {
                    shoptet.checkoutShared.shoptetPayPIS.allPISbanks = responseData;

                    for (const [country, value] of Object.entries(responseData)) {
                        if(value.hasOwnProperty('providers')) {
                            for (const [providers, bank] of Object.entries(value.providers)) {
                                bank.country = country;
                                shoptet.checkoutShared.shoptetPayPIS.banks.push(bank);
                            }
                        }
                    }

                    shoptet.checkoutShared.shoptetPayPIS.countries = Object.entries(responseData).map(([countryCode, countryData]) => ({
                        code: countryData.code,
                        name: countryData.name,
                        bankCount: Object.keys(countryData.providers).length
                    }));

                    shoptet.checkoutShared.shoptetPayPIS.paymentMethodPIS = document.querySelector( '.radio-wrapper[data-submethod="pis"]' );
                    setDefaultCountry();
                    renderPIS(shoptet.checkoutShared.shoptetPayPIS.paymentMethodPIS);
                    shoptetPayPISHandlePaymentMethodChange();
                } catch (error) {
                    console.log('Unable to parse JSON of Bank list.', error);
                }
            },
            error: function(error) {
                hidePISMethod();
                console.log('Unable to reach PIS Bank list endpoint.', error);
            }
        });
    }

    /**
     * SPay PIS (platebni tlacitka) hide (remove) all SPay methods
     */
    function hidePISMethod() {
        document.querySelector('.radio-wrapper[data-submethod="pis"]').remove();
        shoptet.checkoutShared.setActiveShippingAndPayments();
    }

    function shoptetpay() {
        $.ajax({
            url: '/action/ShoptetPayPaymentData/getShoptetPayStatus/',
            type: 'GET',
            success: function(responseData) {
                try {
                    if (!responseData.hasOwnProperty('isHealthy') || responseData.isHealthy === false) {
                        hideAllSPayMethods();
                    }
                } catch (error) {
                    hideAllSPayMethods();
                    console.log('Shoptet Pay is not healthy.', error);
                }
            },
            error: function(error) {
                hideAllSPayMethods();
                console.log('Shoptet Pay is not healthy.', error);
            }
        });
    }

    /**
     * Hide (remove) all SPay methods
     */
    function hideAllSPayMethods() {
        [].forEach.call(document.querySelectorAll('.shoptetpay'), function(method) {
            method.closest('.radio-wrapper').remove();
        });
        shoptet.checkoutShared.setActiveShippingAndPayments();
    }

    /**
     * SPay PIS (platebni tlacitka) set default country for bank list
     *
     * This function does not accept any arguments.
     */
    function setDefaultCountry() {
        const pisCurrencySelected = localStorage.getItem('pisCurrencySelected');
        const currency = dataLayer[0].shoptet.currency;
        if (pisCurrencySelected && pisCurrencySelected !== currency) {
            localStorage.removeItem('pisCountrySelected');
            localStorage.removeItem('pisBankSelected');
        }
        localStorage.setItem('pisCurrencySelected', currency);

        const lang = dataLayer[0].shoptet.language;
        const pisCountrySelected = localStorage.getItem('pisCountrySelected');
        if (pisCountrySelected) {
            shoptet.checkoutShared.shoptetPayPIS.defaultCountry = pisCountrySelected;
            return;
        }

        if (currency == 'HUF' || (currency == 'EUR' && lang == 'hu')) {
            shoptet.checkoutShared.shoptetPayPIS.defaultCountry = 'HU';
        } else if (currency == 'EUR' && lang == 'sk') {
            shoptet.checkoutShared.shoptetPayPIS.defaultCountry = 'SK';
        } else {
            shoptet.checkoutShared.shoptetPayPIS.defaultCountry = 'CZ';
        }

        let existsDefaultCountryInJSON = false;
        shoptet.checkoutShared.shoptetPayPIS.countries.forEach((country) => {
            if (country.code === shoptet.checkoutShared.shoptetPayPIS.defaultCountry) {
                existsDefaultCountryInJSON = true;
            }
        });
        if (!existsDefaultCountryInJSON) {
            shoptet.checkoutShared.shoptetPayPIS.defaultCountry = shoptet.checkoutShared.shoptetPayPIS.countries[0].code;
        }
    }

    /**
     * SPay PIS (platebni tlacitka) payment method selection handling
     */
    function shoptetPayPISHandlePaymentMethodChange() {
        document.addEventListener('ShoptetBillingMethodUpdated', function (ev) {
            if (ev.target === shoptet.checkoutShared.shoptetPayPIS.paymentMethodPIS
                && ev.target.classList.contains('active')) {
                    showPISModal();
            }
        });
        if (shoptet.checkoutShared.shoptetPayPIS.paymentMethodPIS
            && shoptet.checkoutShared.shoptetPayPIS.paymentMethodPIS.classList.contains('active')) {
                shoptet.checkoutShared.shoptetPayPIS.paymentMethodPIS.querySelector('.pisPaymentMethod').classList.remove('pisPaymentMethod--hidden');
        }
    }

    function showPISModal() {
        shoptet.checkoutShared.shoptetPayPIS.paymentMethodPIS.querySelector('.pisPaymentMethod').classList.remove('pisPaymentMethod--hidden');

        let t = document.getElementById('template__pisModal');
        let clone = document.importNode(t.content, true);
        const pisCountrySelection = clone.querySelector('.pisModal__countrySelection');

        shoptet.checkoutShared.shoptetPayPIS.countries.forEach((country) => {
            const option = document.createElement("option");
            option.value = country.code;
            const banksMessage = country.bankCount === 1 ? shoptet.messages['PIScountryOptionOneBank'] : shoptet.messages['PIScountryOptionMoreBanks'];
            option.text = country.name + ' • ' + banksMessage.replace("%1", country.bankCount);

            if (country.code == shoptet.checkoutShared.shoptetPayPIS.defaultCountry) {
                option.selected = true;
            }
            pisCountrySelection.appendChild(option);
        });

        let specificCountryCurrency = ['CZK', 'HUF'];
        specificCountryCurrency.forEach((currency) => {
            if (currency === shoptet.checkoutShared.currencyCode) {
                const currencyInfo = clone.querySelector('.pisModal__currencyBankInfo');
                currencyInfo.innerHTML = shoptet.messages['PIScurrencyInfo' + currency];
                currencyInfo.classList.remove('js-hidden');
                pisCountrySelection.classList.add('js-hidden');
            }
        });

        function showBanksByCountry(country, bankSelection) {
            let i = document.getElementById('template__pisModalItem');
            const providers = shoptet.checkoutShared.shoptetPayPIS.allPISbanks[country].providers;
            let pisBankSelected = localStorage.getItem('pisBankSelected');
            let isSelectedOrDefaultBank = false;
            Object.values(providers).forEach((bank) => {
                i.content.querySelector('.pisModal__bankLogo').src = bank.logoUrl;
                i.content.querySelector('.pisModal__bankName').innerHTML = bank.name;
                i.content.querySelector('.pisModal__bankItem').setAttribute('data-bank-guid', bank.code);
                i.content.querySelector('.pisModal__bankItem').classList.remove('pisModal__bankItem--active');

                if (pisBankSelected === bank.code || (!pisBankSelected && bank.isDefault)) {
                    i.content.querySelector('.pisModal__bankItem').classList.add('pisModal__bankItem--active');
                    isSelectedOrDefaultBank = true;
                }
                bankSelection.appendChild(document.importNode(i.content, true));
            });
            if (!isSelectedOrDefaultBank) {
                bankSelection.firstElementChild.classList.add('pisModal__bankItem--active');
            }
        }

        showBanksByCountry(shoptet.checkoutShared.shoptetPayPIS.defaultCountry, clone.querySelector('.pisModal__bankSelection'));

        clone.querySelector('.pisModal__actions__close').addEventListener('click', function(e) {
            shoptet.modal.close();
        });

        clone.querySelector('.pisModal__actions__confirm').addEventListener('click', function(e) {
            localStorage.setItem('pisCountrySelected', pisCountrySelection.value);
            localStorage.setItem('pisBankSelected', e.target.closest('.content-modal').querySelector('.pisModal__bankItem--active').getAttribute('data-bank-guid'));
            shoptet.checkoutShared.shoptetPayPIS.defaultCountry = pisCountrySelection.value;
            updateBanks();
            shoptet.modal.close();
        });

        shoptet.modal.open({
            opacity: '.95',
            closeButton: false,
            overlayClose: true,
            html: clone,
            width: shoptet.modal.config.widthSm,
        });

        const bankSelection = document.querySelector('.pisModal__bankSelection');
        function handleBankSelection() {
            var banksInSelection = bankSelection.querySelectorAll('.pisModal__bankItem');
            banksInSelection.forEach((bank) => {
                bank.addEventListener('click', function(e) {
                    const activeBank = bankSelection.querySelector('.pisModal__bankItem--active');
                    activeBank && activeBank.classList.remove('pisModal__bankItem--active');
                    e.target.closest('.pisModal__bankItem').classList.add('pisModal__bankItem--active');
                });
            });
        }
        handleBankSelection();

        pisCountrySelection.addEventListener('change', function() {
            const selectedCountry = this.value;
            bankSelection.innerHTML = '';
            showBanksByCountry(selectedCountry, bankSelection);
            handleBankSelection();
        });
    }

    /**
     * SPay PIS (platebni tlacitka) update data
     */
    function updateBanks() {
        const banks = shoptet.checkoutShared.shoptetPayPIS.allPISbanks[shoptet.checkoutShared.shoptetPayPIS.defaultCountry].providers;
        const pisPaymentMethod = document.querySelector('.pisPaymentMethod');
        let selectedBank = Object.values(banks).find(bank =>  bank.code === localStorage.getItem('pisBankSelected'));

        if (pisPaymentMethod && selectedBank) {
            pisPaymentMethod.querySelector('.bankSelection__bankName').innerHTML = selectedBank.name;
            pisPaymentMethod.querySelector('.bankSelection__bankLogo').src = selectedBank.logoUrl;
            pisPaymentMethod.querySelector('.shoptetpay__pis__code').value = selectedBank.code;
        }
    }

    /**
     * SPay PIS (platebni tlacitka) render function
     */
    function renderPIS(paymentMethodPIS) {
        var t = document.getElementById('template__pisPayment');
        let banks = shoptet.checkoutShared.shoptetPayPIS.allPISbanks[shoptet.checkoutShared.shoptetPayPIS.defaultCountry].providers;

        let selected = Object.values(banks).find(bank =>
            bank.code === localStorage.getItem('pisBankSelected') ||
            (!localStorage.getItem('pisBankSelected') && bank.isDefault));

        if (selected == null) {
            selected = Object.values(banks)[0];
        }

        t.content.querySelector('.bankSelection__bankName').innerHTML = selected.name;
        t.content.querySelector('.bankSelection__bankLogo').src = selected.logoUrl;
        t.content.querySelector('.shoptetpay__pis__code').value = selected.code;

        var clone = document.importNode(t.content, true);
        if (shoptet.abilities.about.generation !== 3) {
            clone.querySelector('.pisPaymentMethod').classList.remove('pisPaymentMethod--hidden');
            var pisWrapper = document.getElementById('template__pisWrapperTable2G');
            var radioWrapper = pisWrapper.content.querySelector('.pisWrapper__radio');
            [].forEach.call(paymentMethodPIS.children, function(child) {
                radioWrapper.appendChild(child);
            });
            var pisPaymentRow = pisWrapper.content.querySelector('.pisWrapper__pisPayment');
            pisPaymentRow.appendChild(clone);
            paymentMethodPIS.innerHTML = '';
            paymentMethodPIS.appendChild(document.importNode(pisWrapper.content, true));
            paymentMethodPIS.querySelector('.bankSelection__button').addEventListener('click', function(e) { showPISModal(); });
        } else {
            paymentMethodPIS.appendChild(clone);
            paymentMethodPIS.querySelector('.bankSelection__button').addEventListener('click', function(e) { showPISModal(); });
        }
        shoptet.checkoutShared.shoptetPayPIS.paymentMethodPISdescription = paymentMethodPIS.querySelector('.bankInformation__description');
    }

    /**
     * PayU handling
     * Used in ordering process, step 1
     *
     * This function does not accept any arguments.
     */
    function payu() {
        var payuTable = document.getElementById('payu_');
        var payuTemplate = document.getElementById('payu-template');
        if (payuTable && payuTemplate) {
            payuTemplate.appendChild(payuTable);
            if (payuTemplate.querySelector('input[name="billingId"]:checked')) {
                if (payuTable.querySelector('input[value="' + shoptet.config.payuPayType + '"]')) {
                    // If the PayU payment method is specified we check it...
                    payuTable.querySelector('input[value="' + shoptet.config.payuPayType + '"]').checked = true;
                } else {
                    // ...otherwise we check the first possible payment method
                    payuTable.querySelector('input').checked = true;
                }
            }
            payuTable.addEventListener('mousedown', function(e) {
                e.stopPropagation();
            });
            var payuInputs = payuTable.querySelectorAll('.table-payu input');
            if (payuInputs) {
                for (var i = 0; i < payuInputs.length; i++) {
                    payuInputs[i].addEventListener('mousedown', function(e) {
                        e.stopPropagation();
                        var activeLine = document.querySelector('.payu-billing-info');
                        if (!activeLine.classList.contains('active')) {
                            document.querySelector(
                                '#order-billing-methods .radio-wrapper.active input'
                            ).checked = false;
                            document.querySelector(
                                '#order-billing-methods .radio-wrapper.active'
                            ).classList.remove('active');
                            activeLine.classList.add('active')
                            activeLine.querySelector('input').checked = true;
                            shoptet.checkoutShared.replacingChosenShippingAndBilling();
                        }
                    });
                }
            }
        }
    }

    /**
     * Used in ordering process
     *
     * This function does not accept any arguments.
     */
    function getStatedValues() {
        deliveryCountryIdValue = $('#deliveryCountryId').val() || shoptet.checkoutShared.deliveryCountries?.[0].id;
        regionCountryIdValue = $('#deliveryRegionId').val();
        currencyCode = $('#payment-currency').val();
        shoptet.checkoutShared.deliveryCountryId = deliveryCountryIdValue;
        shoptet.checkoutShared.regionCountryId = regionCountryIdValue;
        shoptet.checkoutShared.currencyCode = currencyCode;
        shoptet.scripts.signalCustomEvent('ShoptetBaseShippingInfoObtained');
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
            if ($fields.hasOwnProperty(key)) {
                if (document.getElementById(key)) {
                    var field = $('#'+key);
                    field.val($fields[key]);
                }
            }
        }
    }

    function displayApplePay() {
        if (shoptet.helpers.isApplePayAvailable()) {
            $('.apple-pay').show();
            $('.radio-wrapper[data-submethod="applepay"]').show();
        }
    }

    function updatePrice(e) {
        var priceHolder = e.target.querySelector('.payment-shipping-price');
        var preserveValue = priceHolder.getAttribute('data-preserve-value');
        if (
            e.detail.invalidate
            ||
            e.detail.price.withVat === null) {
            priceHolder.classList.add('shipping-price-not-specified');
            if (!preserveValue) {
                priceHolder.innerHTML = shoptet.messages['specifyShippingMethod'];
            }
        } else {
            priceHolder.classList.remove('shipping-price-not-specified');
            if (!preserveValue) {
                var priceInputWithVat =
                    e.target.querySelector('.external-shipping-method-price-with-vat');
                var priceInputWithoutVat =
                    e.target.querySelector('.external-shipping-method-price-without-vat');
                var shippingPrice = e.target.querySelector('.payment-shipping-price');

                shippingPrice.setAttribute(
                    'data-shipping-price-wv',
                    e.detail.price.withVat
                );

                shippingPrice.setAttribute(
                    'data-shipping-price-wov',
                    e.detail.price.withoutVat
                );

                priceInputWithVat.setAttribute('value', e.detail.price.withVat);
                shoptet.checkoutShared.externalShippingDetails[e.detail.code].price.withVat
                    = e.detail.price.withVat;

                priceInputWithoutVat.setAttribute('value', e.detail.price.withoutVat);
                shoptet.checkoutShared.externalShippingDetails[e.detail.code].price.withouVat
                    = e.detail.price.withoutVat;

                var price = shoptet.config.defaultVatIncluded ? e.detail.price.withVat : e.detail.price.withoutVat;
                priceHolder.innerHTML = price.ShoptetFormatAsCurrency(
                    undefined, undefined, shoptet.config.decPlacesSystemDefault
                );
                priceHolder.setAttribute('data-shipping-price-wv', e.detail.price.withVat);
                priceHolder.setAttribute('data-shipping-price-wov', e.detail.price.withoutVat);
            }
        }

        shoptet.checkoutShared.afterPriceChange();
    }

    function getPriceFromElement(el, attribute) {
        if (!el) {
            // TODO: 0?
            return 0;
        }
        return Number(el.getAttribute(attribute));
    }

    /**
     * Recalculate price summary in ordering process
     *
     * @param {String} shippingActive
     * shippingActive = id of selected shipping method
     * @param {String} billingActive
     * billingActive = id of selected billing method
     */
    function updatePriceSummary(shippingActive, billingActive) {
        var shippingPrice = document.querySelector('[data-shipping-price-id="' + shippingActive + '"]');
        var billingPrice = document.querySelector('[data-billing-price-id="' + billingActive + '"]');
        var cartPriceWithVat = document.querySelector('[data-price-total-wv]');
        var cartPriceWithoutVat = document.querySelector('[data-price-total-wov]');
        var preauthorizedPrice = document.querySelector('[data-preauthorized-price]');
        if (cartPriceWithoutVat === null) {
            // Workaround for non VAT payers
            cartPriceWithoutVat = document.createElement('span');
        }
        var shippingPriceNotSpecified = shippingPrice.classList.contains('shipping-price-not-specified');
        if (shippingPriceNotSpecified) {
            if (!shippingPrice.getAttribute('data-preserve-value')) {
                cartPriceWithVat.innerHTML = shoptet.messages.specifyShippingMethod;
                cartPriceWithoutVat.innerHTML = shoptet.messages.specifyShippingMethod;
            }
        } else {
            var prices = {
                shipping: {
                    withVat: shoptet.checkoutShared.getPriceFromElement(shippingPrice, 'data-shipping-price-wv'),
                    withoutVat: shoptet.checkoutShared.getPriceFromElement(shippingPrice, 'data-shipping-price-wov'),
                    vat: shoptet.checkoutShared.getPriceFromElement(shippingPrice, 'data-shipping-price-vat')
                },
                billing: {
                    withVat: shoptet.checkoutShared.getPriceFromElement(billingPrice, 'data-billing-price-wv'),
                    withoutVat: shoptet.checkoutShared.getPriceFromElement(billingPrice, 'data-billing-price-wov'),
                    vat: shoptet.checkoutShared.getPriceFromElement(billingPrice, 'data-billing-price-vat')
                },
                cart: {
                    withVat: shoptet.checkoutShared.getPriceFromElement(cartPriceWithVat, 'data-price-total-wv'),
                    withoutVat: shoptet.checkoutShared.getPriceFromElement(cartPriceWithoutVat, 'data-price-total-wov'),
                    vat: shoptet.checkoutShared.getPriceFromElement(cartPriceWithVat, 'data-price-total-vat'),
                    preauthorized: preauthorizedPrice ? shoptet.checkoutShared.getPriceFromElement(preauthorizedPrice, 'data-preauthorized-price') : undefined,
                }
            };
            var calculatedPriceWithVat = prices.shipping.withVat + prices.billing.withVat + prices.cart.withVat;
            calculatedPriceWithVat = roundForCart(calculatedPriceWithVat, billingActive);

            var calculatedPriceWithoutVat =
                prices.shipping.withoutVat + prices.billing.withoutVat + prices.cart.withoutVat;
            // It would took complete refactoring to synchronize behavior of price rounding within tpl and js,
            // that's why the line below is commented
            //calculatedPriceWithoutVat = calculatedPriceWithoutVat.ShoptetRoundForDocument();
            cartPriceWithVat.innerHTML = calculatedPriceWithVat.ShoptetFormatAsCurrency(
                undefined, undefined, shoptet.config.decPlacesSystemDefault
            );
            cartPriceWithoutVat.innerHTML = calculatedPriceWithoutVat.ShoptetFormatAsCurrency(
                undefined, undefined, shoptet.config.decPlacesSystemDefault
            );

            if (preauthorizedPrice && prices.cart.preauthorized !== undefined) {
                var calculatedPreauthorizedPrice = prices.shipping.withVat + prices.billing.withVat + prices.cart.preauthorized;
                calculatedPreauthorizedPrice = roundForCart(calculatedPreauthorizedPrice, billingActive);

                preauthorizedPrice.innerHTML = calculatedPreauthorizedPrice.ShoptetFormatAsCurrency();
            }
        }
    }

    function roundForCart(price, billing) {
        price = price.ShoptetRoundForDocument();

        if (isAvailableRoundingSk(price, billing)) {
            price = price.ShoptetRoundForDocument(5);
        }

        if (isAvailableRoundingHu(price, billing)) {
            price = price.ShoptetRoundForDocument(4);
        }

        return price;
    }

    function isAvailableRoundingSk(price, billing) {
        if (shoptet.checkoutShared.currencyCode != 'EUR') {
            return false;
        }

        if (Number(shoptet.checkoutShared.deliveryCountryId) != 151) {
            return false;
        }

        var roundedPrice = price.ShoptetRoundForDocument(5);

        if (roundedPrice == price) {
            return false;
        }

        var billingMethodCode = document.querySelector('#billingId-' + billing).getAttribute('data-payment-type');

        if (billingMethodCode != 'cash' && billingMethodCode != 'cashOnDelivery') {
            return false;
        }

        return true;
    }

    function isAvailableRoundingHu(price, billing) {
        if (shoptet.checkoutShared.currencyCode != 'HUF') {
            return false;
        }

        var roundedPrice = price.ShoptetRoundForDocument(4);

        if (roundedPrice == price) {
            return false;
        }

        var billingMethodCode = document.querySelector('#billingId-' + billing).getAttribute('data-payment-type');

        if (billingMethodCode != 'cash' && billingMethodCode != 'cashOnDelivery') {
            return false;
        }

        return true;
    }

    function afterPriceChange() {
        shoptet.checkoutShared.callShippingBillingRelations();
    }

    function getDefaultShippingInfo(code) {
        return {
            code: code,
            invalidate: true,
            verificationCode: shoptet.checkoutShared.externalShippingDetails[code].verificationCode,
            expires: 0,
            label: {
                selected: shoptet.checkoutShared.externalShippingDetails[code].label.selected,
                init: shoptet.checkoutShared.externalShippingDetails[code].label.init,
                update: shoptet.checkoutShared.externalShippingDetails[code].label.update
            },
            price: {
                withVat: null,
                withoutVat: null
            }
        }
    }

    function setTimeoutForExpiration(code, el, timeoutTime) {
        var timeout = shoptet.checkoutShared.externalShippingDetails[code].timeout;
        if (typeof timeout !== 'undefined') {
            clearTimeout(timeout);
        }
        shoptet.checkoutShared.externalShippingDetails[code].timeout = setTimeout(function() {
            var ev = new CustomEvent(
                'ShoptetExternalShippingExpired',
                {
                    detail: shoptet.checkoutShared.getDefaultShippingInfo(code)
                }
            );
            el.dispatchEvent(ev);
        }, timeoutTime);
    }

    function setExternalShippingMethod(e) {
        var shippingInfo = e.target.querySelector('.specify-shipping-method');
        var shippingLabel = shippingInfo.querySelector('.specified-shipping-method');
        var labelInput = e.target.querySelector('.external-shipping-method-label');
        var verificationCodeInput =
            e.target.querySelector('.external-shipping-method-verification-code');

        if (e.detail.invalidate || e.detail.label.selected === null) {
            shippingInfo.classList.remove('chosen');
            shoptet.checkoutShared.externalShippingDetails[e.detail.code].label.selected = null;
            labelInput.setAttribute('value', shoptet.checkoutShared.externalShippingDetails[e.detail.code].label.init);
            shippingLabel.innerHTML = shoptet.checkoutShared.externalShippingDetails[e.detail.code].label.init;
        } else {
            shippingInfo.classList.add('chosen');
            if (e.detail.expires) {
                var currentTime = new Date().getTime();
                var timeoutTime = e.detail.expires.getTime() - currentTime;
                shoptet.checkoutShared.setTimeoutForExpiration(e.detail.code, e.target, timeoutTime);
                shoptet.checkoutShared.externalShippingDetails[e.detail.code].expires = e.detail.expires;
            }
            shoptet.checkoutShared.externalShippingDetails[e.detail.code].label.selected = e.detail.label.selected;
            labelInput.setAttribute('value', e.detail.label.selected);
            shoptet.checkoutShared.externalShippingDetails[e.detail.code].verificationCode = e.detail.verificationCode;
            verificationCodeInput.setAttribute('value', e.detail.verificationCode);
            shippingLabel.innerHTML = e.detail.label.selected;
        }
    }

    function setupExternalShipping() {
        var externalShippingWrappers = document.querySelectorAll('[data-external-script="true"]');
        if (externalShippingWrappers) {
            for (var i = 0; i < externalShippingWrappers.length; i++) {
                (function(i) {
                    var wrapper = externalShippingWrappers[i];
                    wrapper.addEventListener(
                        'ShoptetExternalShippingChanged',
                        function(e) {
                            shoptet.checkoutShared.setExternalShippingMethod(e);
                            shoptet.checkoutShared.updatePrice(e);
                        }
                    );
                    wrapper.addEventListener(
                        'ShoptetExternalShippingExpired',
                        function(e) {
                            shoptet.checkoutShared.setExternalShippingMethod(e);
                            shoptet.checkoutShared.updatePrice(e);
                        }
                    );
                    var code = wrapper.getAttribute('data-external-script-code');
                    if (typeof shoptet.checkoutShared.externalShippingDetails[code] !== 'undefined') {
                        var expires = shoptet.checkoutShared.externalShippingDetails[code]['expires'];
                        var now = new Date().getTime();
                        if (expires > now) {
                            var timeoutTime = expires - now;
                            shoptet.checkoutShared.setTimeoutForExpiration(code, wrapper, timeoutTime);
                        } else {
                            if (!expires) {
                                return false;
                            }
                            // TODO: more clever behavior of expiration, prevent from deleting data, add updateText
                            var ev = new CustomEvent(
                                'ShoptetExternalShippingExpired',
                                {
                                    detail: shoptet.checkoutShared.getDefaultShippingInfo(code)
                                }
                            );
                            wrapper.dispatchEvent(ev);
                        }
                    }
                })(i);
            }
        }

    }

    /**
     * Assign functionality to links of external shipping
     *
     * @param {Object} wrapper
     * wrapper = external shipping method (.radio-wrapper)
     * @param {Object} link
     * link = link to update selected shipping
     * @param {Object} e
     * e = fired event
     */
    function handleExternalShippingLinks(wrapper, link, e) {
        if (!link.classList.contains('chosen') || e.target.closest('a')) {
            var externalScriptId = wrapper.getAttribute('data-external-script-code');
            try {
                var externalScript = shoptet.externalShipping[externalScriptId];
                shoptet.modal.open({
                    html: externalScript.modalContent,
                    width: externalScript.modalWidth || shoptet.modal.config.widthMd,
                    className: externalScript.modalClass || shoptet.modal.config.classMd,
                    onComplete: function() {
                        externalScript.onComplete(wrapper)
                    },
                    onClosed: function() {
                        externalScript.onClosed(wrapper)
                    }
                });
            } catch (ex) {
                console.error(ex);
            }
        } else {
            shoptet.checkoutShared.afterPriceChange();
        }
    }

    /**
     * Attach event listeners and add functionality for elements in checkout
     *
     * This function does not accept any arguments.
     */
    function setupDeliveryShipping() {
        var $document = $(document);
        if (typeof personalCollectionUrl !== 'undefined') {
            $document.on('click', '.personal-collection-choose-branch a', function(e) {
                e.preventDefault();
                var $parentsElement = $(this).closest('.radio-wrapper');
                $parentsElement.find('.personal-collection-choose-branch[name="shippingId"]').prop('checked', true);
                shoptet.checkoutShared.chooseABranchModal(
                    personalCollectionUrl,
                    '#personal-collection-wrapper',
                    '#personalCollectionPointId',
                    '.personal-collection-point-id'
                );
            });

            $document.on('click', '#personal-collection-wrapper a.enabled', function(e) {
                e.preventDefault();
                var pointId = $(this).data('point-id');
                var pointTitle = $(this).data('point-title');
                var completePointName = '';
                var changePointLink = $('<a href="#" class="chosen">' + pointTitle + '</a>');
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
        if (typeof skPostUrl !== 'undefined') {
            postDeliveryPoints.push({
                prefix: 'sk-post',
                url: skPostUrl
            });
        }

        for (var i = 0; i < postDeliveryPoints.length; i++) {
            (function(i) {
                $document.on('click', '.' + postDeliveryPoints[i].prefix + '-choose-post a', function(e) {
                    e.preventDefault();
                    $parentsElement = $(this).closest('.radio-wrapper');
                    var url = postDeliveryPoints[i].url;

                    if (['sk-post', 'posta-pont'].includes(postDeliveryPoints[i].prefix)) {
                        url += '?shipmentId=' + $parentsElement.find('input').val();
                    }

                    window.clickedElement = $(this);
                    shoptet.modal.open({
                        maxWidth: shoptet.modal.config.maxWidth,
                        href: url,
                        width: shoptet.modal.config.widthMd,
                        className: shoptet.modal.config.classMd,
                        onComplete: function() {
                            shoptet.modal.shoptetResize();
                        }
                    });
                });
                $document.on(
                    'click',
                    '#' + postDeliveryPoints[i].prefix + '-result .'
                    + postDeliveryPoints[i].prefix + '-choose-button',
                    function() {
                        var $tr = $(this).closest('tr');
                        var address = $.trim($tr.find('.' + postDeliveryPoints[i].prefix + '-address').html());
                        var newString = '';
                        var $newLink = $('<a href="#" class="chosen">' + address + '</a>');
                        $parentsElement.find('.' + postDeliveryPoints[i].prefix + '-choose-post')
                            .html(newString).append($newLink).show(0);
                        if (['sk-post', 'posta-pont'].includes(postDeliveryPoints[i].prefix)) {
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

            $document.on('click', '.ulozenka-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('.radio-wrapper');
                shoptet.checkoutShared.chooseABranchModal(
                    ulozenkaUrl + '?id=' + $parentsElement.find('.ulozenka-choose-branch').attr('value')
                    + '&deliveryCountryId=' + $('#deliveryCountryId').val(),
                    '#ulozenka-wrapper',
                    '#branchId',
                    '.ulozenka-branch-id'
                );
            });

            $document.on('submit', '#ulozenka-form', function(e) {
                e.preventDefault();
                var name = $('#ulozenka-wrapper .branch-name').text();
                var newString = '';
                var $newLink = $('<a href="#" class="chosen">' + name + '</a>');
                $parentsElement.find('.ulozenka-choose').html(newString).append($newLink).show(0);
                $parentsElement.find('.ulozenka-branch-id').val($('#branchId option:selected').val());
                shoptet.checkoutShared.modalMagic();
            });

            $document.on('change', '#branchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) != '') {
                    $('#ulozenka-form .branch-saved').removeClass('branch-saved-visible');
                    $('#ulozenka-form .js-branch-loader').removeClass('no-display');
                    $.ajax({
                        url: '/action/Ulozenka/getBranchInformation/?id=' + id,
                        type: 'GET',
                        success: function(responseData) {
                            $('#ulozenka-wrapper .detail-information').html(responseData);
                            $('#ulozenka-form .js-branch-loader').addClass('no-display');
                            $('#ulozenka-form .branch-saved').addClass('branch-saved-visible');
                            $('#ulozenka-form').submit();
                            shoptet.modal.shoptetResize();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#ulozenka-form .js-branch-loader').addClass('no-display');
                        }
                    });
                }
            });

        }

        if (typeof zasilkovnaUrl !== 'undefined') {
            function handlePacketaPoint(extendedPoint) {
                shoptet.checkoutShared.packeta.selectedBranch = extendedPoint;
                if (extendedPoint) {
                    var zasilkovnaBranchId = document.querySelectorAll('.zasilkovna-branch-id');
                    var packetaSelectorBranchName = document.querySelectorAll('.zasilkovna-name');
                    for (var i = 0; i < zasilkovnaBranchId.length; i++) {
                        if (extendedPoint.carrierId !== undefined && extendedPoint.carrierId !== null){
                            zasilkovnaBranchId[i].value = extendedPoint.carrierId + '-' + extendedPoint.id;
                        } else {
                            zasilkovnaBranchId[i].value = extendedPoint.id;
                        }
                    }
                    for (var i = 0; i < packetaSelectorBranchName.length; i++) {
                        packetaSelectorBranchName[i].innerHTML = extendedPoint.name;
                    }
                }
            }
            $document.on('click', '.zasilkovna-choose a', function(e) {
                e.preventDefault();
                shoptet.checkoutShared.packeta = shoptet.checkoutShared.packeta || {};
                shoptet.checkoutShared.packeta.widgetOptions = shoptet.checkoutShared.packeta.widgetOptions || {};
                if (shoptet.checkoutShared.packeta.widgetOptions.apiKey) {
                    Packeta.Widget.pick(
                        shoptet.checkoutShared.packeta.widgetOptions.apiKey,
                        handlePacketaPoint,
                        shoptet.checkoutShared.packeta.widgetOptions
                    );
                }
            });
        }

        var newGenChooseOpen = false;
        $document.on('click', '.new-gen-choose a', function(e) {
            e.preventDefault();
            if (newGenChooseOpen) {
                return;
            }
            newGenChooseOpen = true;
            $parentsElement = $(this).closest('.radio-wrapper');
            let href = '/action/NewGenWidget/Choose/?code=' + $parentsElement.find('[data-new-gen-code]').data('newGenCode') + '&deliveryCountryId=' + shoptet.checkoutShared.deliveryCountryId;
            var chosenBranchId = undefined;
            var chosenBranchName = undefined;
            shoptet.checkoutShared.chooseBranch = function(branchId, branchName) {
                chosenBranchId = branchId;
                chosenBranchName = branchName;
                shoptet.modal.close();
            };
            shoptet.modal.open({
                href,
                className: 'logistics-modal',
                onComplete: () => {
                    if (typeof logisticsModalOnComplete === 'function') {
                        logisticsModalOnComplete();
                    }
                },
                onCleanup: () => {
                    newGenChooseOpen = false;
                    if (chosenBranchName && chosenBranchId) {
                        var completeBranchName = chosenBranchName + ' ';
                        var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                        $parentsElement.find('.new-gen-choose').html(completeBranchName).append($newLink).show(0);
                        $parentsElement.find('input[name*=shippingMethodBranch]').val(chosenBranchId);
                    }
                }
            })
        });

        if (typeof glsParcelShopUrl !== 'undefined') {
            var glsParcelShopId = '';
            var glsParcelShopName = '';
            var glsModalOpen = false;

            window.addEventListener('message', function(event) {
                let ps = event.data.parcelshop;
                if (typeof ps === 'undefined') {
                    return;
                }
                glsParcelShopName = ps.detail.name;
                glsParcelShopId = ps.detail.pclshopid;
                shoptet.modal.close();
            });

            $document.on('click', '.gls-parcel-shop-choose a', function(e) {
                e.preventDefault();
                if (glsModalOpen) {
                    return;
                }
                glsModalOpen = true;
                $parentsElement = $(this).closest('.radio-wrapper');
                shoptet.modal.open({
                    href: glsParcelShopUrl,
                    width : shoptet.modal.config.widthLg,
                    className: shoptet.modal.config.classLg,
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
        }

        if (typeof dpdParcelShopUrl !== 'undefined') {

            $document.on('click', '.dpd-cz-parcel-shop-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('.radio-wrapper');
                shoptet.checkoutShared.chooseABranchModal(
                    dpdParcelShopUrl,
                    '#dpd-cz-parcel-shop-wrapper',
                    '#dpdParcelShopBranchId',
                    '#dpd-cz-branch-id'
                );
            });

            $document.on('submit', '#dpd-cz-parcel-shop-form', function(e) {
                e.preventDefault();
                var branchName = $('#dpd-cz-parcel-shop-wrapper .branch-name').text();
                var branchStreet = $('#dpd-cz-parcel-shop-wrapper .branch-street').text();
                var branchCity = $('#dpd-cz-parcel-shop-wrapper .branch-city').text();
                var branchZip = $('#dpd-cz-parcel-shop-wrapper .branch-zip').text();
                var completeBranchName = shoptet.messages['chosenBranch'] + ': '
                    + branchCity + ' ' + branchName + ' (' + branchStreet + ', ' + branchZip + ' ' + branchCity + ') ';
                var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $parentsElement.find('.dpd-cz-parcel-shop-choose').html(completeBranchName).append($newLink).show(0);
                $('#dpd-cz-branch-id').val($('#dpdParcelShopBranchId option:selected').val());
                shoptet.checkoutShared.modalMagic();
            });

            $document.on('change', '#dpdParcelShopBranchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) !== '') {
                    $('#dpd-cz-parcel-shop-form .branch-saved').removeClass('branch-saved-visible');
                    $('#dpd-cz-parcel-shop-form .js-branch-loader').removeClass('no-display');
                    $.ajax({
                        url: '/action/DpdParcelShop/getBranchInformation/?id=' + id,
                        type: 'GET',
                        success: function(responseData) {
                            $('#dpd-cz-parcel-shop-wrapper .detail-information').html(responseData);
                            $('#dpd-cz-parcel-shop-form .js-branch-loader').addClass('no-display');
                            shoptet.modal.shoptetResize();
                            $('#dpd-cz-parcel-shop-form .branch-saved').addClass('branch-saved-visible');
                            $('#dpd-cz-parcel-shop-form').submit();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#dpd-cz-parcel-shop-form .js-branch-loader').addClass('no-display');
                        }
                    });
                }
            });

        }

        if (typeof isDpdOnSaturday !== 'undefined') {
            $document.on('click', '.dpd-check-zip a', function(event) {
                event.preventDefault();
                $('#dpd-zip-check-modal .dpd-zip-check-result').hide();
                $('#dpd-zip-check-text').val('');
                $('#dpd-zip-check-modal').show();
                shoptet.modal.open({
                    maxWidth: shoptet.modal.config.maxWidth,
                    width: shoptet.modal.config.widthLg,
                    className: shoptet.modal.config.classLg,
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
                        success: function(response) {
                            if (response == '1') {
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
            $document.on('click', '.ppl-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('.radio-wrapper');
                shoptet.checkoutShared.chooseABranchModal(
                    pplPartnerUrl + '?deliveryCountryId=' + $('#deliveryCountryId').val(),
                    '#ppl-partner-cz-wrapper',
                    '#pplPartnerBranchId',
                    '#ppl-partner-cz-branch-id'
                );
            });

            $document.on('submit', '#ppl-partner-cz-form', function(e) {
                e.preventDefault();
                var name = $('#pplPartnerBranchId option:selected').text();
                var newString = '';
                var $newLink = $('<a href="#" class="chosen">' + name + '</a>');
                $parentsElement.find('.ppl-choose').html(newString).append($newLink).show(0);
                $('#ppl-partner-cz-branch-id').val($('#pplPartnerBranchId option:selected').val());
                shoptet.checkoutShared.modalMagic();
            });

            $document.on('change', '#pplPartnerBranchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) != '') {
                    $('#ppl-partner-cz-form .branch-saved').removeClass('branch-saved-visible');
                    $('#ppl-partner-cz-form .js-branch-loader').removeClass('no-display');
                    $.ajax({
                        url: '/action/PplPartner/getBranchInformation/?id=' + id +'&deliveryCountryId=' + $('#deliveryCountryId').val(),
                        type: 'GET',
                        success: function(responseData) {
                            $('#ppl-partner-cz-wrapper .detail-information').html(responseData);
                            $('#ppl-partner-cz-form .js-branch-loader').addClass('no-display');
                            shoptet.modal.shoptetResize();
                            $('#ppl-partner-cz-form .branch-saved').addClass('branch-saved-visible');
                            $('#ppl-partner-cz-form').submit();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#ppl-partner-cz-form .js-branch-loader').addClass('no-display');
                        }
                    });
                }
            });

        }
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
     * branchInput = selector of input element holding selected branch id
     */
    function chooseABranchModal(href, branchWrap, branchId, branchInput) {
        shoptet.modal.open({
            maxWidth: shoptet.modal.config.maxWidth,
            maxHeight: shoptet.modal.config.maxHeight,
            width: shoptet.modal.config.widthMd,
            className: shoptet.modal.config.classMd,
            href: href,
            onComplete: function() {
                $(branchId + ' option[value="' + $(branchInput).val() + '"]').attr('selected', 'selected');
                $(branchId).trigger('change');
                shoptet.checkoutShared.initBranchSelect();
            }
        });
    }

    /**
     * Handler for dynamic resize of modal window
     *
     * This function does not accept any arguments.
     */
    function modalMagic() {
        if ($('.branch-saved:visible').length) {
            $('.branch-saved').click(function() {
                shoptet.modal.close();
            });
        }
        return false;
    }

    function initBranchSelect() {
        var $select = $('.js-select-basic');

        if (!$select.length) {
            return;
        }

        $select.select2({
            dropdownParent: $('#colorbox'),
            language: {
                noResults: function () {
                    return $select.attr('data-no-results');
                }
            }
        });

        $select.on('select2:opening', function() {
            if (!$select.find('option:selected').val()) {
                shoptet.modal.resize({ height: '500px' });
            }
        });

        $select.on('select2:close', function() {
            if (!$select.find('option:selected').val()) {
                shoptet.modal.shoptetResize();
            }
        });

        shoptet.modal.shoptetResize();

        if (!$select.find('option:selected').val()) {
            $select.select2('open');
        }
    }

    function twisto(twistoData) {
        var twistoPayload = twistoData.twistoPayload

        function getValue(name) {
            obj = $('#'+name);
            if (obj.length > 0) {
                return obj.val();
            } else {
                return '';
            }
        }

        function getAddress(prefix) {
            var moreCountries = twistoData.moreCountries
            var deliveryCountryId = twistoData.deliveryCountryId
            return {
                "name" : getValue(prefix + 'FullName'),
                "street" : getStreet(prefix),
                "city" : getValue(prefix + 'City'),
                "zipcode" : getValue(prefix + 'Zip'),
                "country" : (prefix === 'bill' && moreCountries) ? $("#billCountryId option:selected").data('code') : deliveryCountryId,
                "phones" : [getPhone()]
            };
        }

        function checkContactInformation(addr) {
            var phone = getValue('phone');
            var email = getValue('email');

            if (phone.length == 0) {
                alert("Twisto: Prosím zadejte telefonní číslo");
                return false;
            }
            if (email.length == 0) {
                alert("Twisto: Prosím zadejte e-mailovou adresu");
                return false;
            }
            if (addr.name.length == 0) {
                alert("Twisto: Prosím zadejte jméno a příjmení");
                return false;
            }
            if (addr.city.length == 0) {
                alert("Twisto: Prosím zadejte město");
                return false;
            }
            if (addr.street.length == 0) {
                alert("Twisto: Prosím zadejte ulici");
                return false;
            }
            if (addr.zipcode.length == 0) {
                alert("Twisto: Prosím zadejte PSČ");
                return false;
            }
            if (addr.country.length == 0) {
                alert("Twisto: Prosím zadejte zemi");
                return false;
            }

            if (/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email) === false) {
                alert("Twisto: e-mail má špatný formát");
                return false;
            }
            return true;
        }

        function getPhone() {
            var phone = getValue('phone');
            if (phone.indexOf('+420') != -1) {
                return phone;
            } else {
                return '+420'+phone;
            }
        }

        function getStreet(prefix) {
            var street = getValue(prefix + 'Street') + ' ' + getValue(prefix + 'HouseNumber');
            return street.trim();
        }

        function changeMouseCursorToProgress(restoreInMiliseconds) {
            $('body').css('cursor', 'progress');
            if (restoreInMiliseconds) {
                window.setTimeout(
                    function() {
                        $('body').css('cursor', 'inherit');
                    },
                    restoreInMiliseconds
                );
            }
        };

        $('#submit-order').closest('form').submit(function(event, twistoVerificationSuccesfull) {
            if (twistoVerificationSuccesfull) {
                return true;
            }
            event.preventDefault();
            twistoPayload.customer.email = getValue('email').toLowerCase();
            twistoPayload.order.billing_address = getAddress('bill');
            if (!checkContactInformation(twistoPayload.order.billing_address)) {
                return false;
            }
            if ($('#another-shipping').prop('checked')) {
                twistoPayload.order.delivery_address = getAddress('delivery');
                if (!checkContactInformation(twistoPayload.order.delivery_address)) {
                    return false;
                }
            } else {
                delete twistoPayload.order.delivery_address;
            }

            $(this).attr('disabled', 'disabled');
            changeMouseCursorToProgress(4000);
            Twisto.check(
                twistoPayload,
                function(response) {
                    if (response.status == 'accepted') {
                        var $form = $('#submit-order').closest('form');
                        $form.find('input[name=twisto_transaction_id]').val(response.transaction_id);
                        var twistoVerificationSuccesfull = true;
                        $form.trigger('submit', [twistoVerificationSuccesfull]);
                    } else {
                        window.location.replace(twistoData.twistoRejectedUrl);
                    }
                },
                function() {
                    window.location.replace(twistoData.twistoFailedUrl);
                }
            );
        });
    }

    function postDeliveryPoints(postDeliveryPointsData) {
        var zipCodes = postDeliveryPointsData.zipCodes
        var posts = postDeliveryPointsData.posts
        var diacriticsMap = {
            "á": "a", "é": "e", "ě": "e", "í": "i", "ý": "y", "ó": "o", "ú": "u", "ů": "u", "ž": "z", "š": "s", "č": "c", "ř": "r", "ď": "d", "ť": "t", "ň": "n", "Á": "A", "É": "E", "Ě": "E", "Í": "I", "Ý": "Y", "Ó": "O", "Ú": "U", "Ů": "U", "Ž": "Z", "Š": "S", "Č": "C", "Ř": "R", "Ď": "D", "Ť": "T", "Ň": "N", "ä": "a", "ĺ": "l", "ľ": "l", "ô": "o", "Ä": "A", "Ľ": "L", "Ĺ": "L", "Ô": "O", "ö": "o", "ő": "o", "ü": "u", "ű": "u", "Ö": "O", "Ő": "O", "Ü": "U", "Ű": "U"
        };
        var removeDiacritics = function(str) {
            var string = "";
            for (var i = 0; i < str.length; i++) {
                string += diacriticsMap[str.charAt(i)] || str.charAt(i);
            }
            return string;
        };
        var shipmentId = postDeliveryPointsData.shipmentId;
        $(`${postDeliveryPointsData.deliveryPointPrefix}-wrapper .zip-code`).autocomplete({
            source: zipCodes,
            open: function() {
                shoptet.modal.shoptetResize();
            },
            select: function(event) {
                setTimeout(function () {
                    $(event.target).parents('form').submit();
                }, 50);
            }
        });
        $(`${postDeliveryPointsData.deliveryPointPrefix}-wrapper .city`).autocomplete({
            delay: 500,
            minLength: 3,
            source: function(request, response) {
                var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                response($.grep(posts, function(value) {
                    value = value.label || value.value || value;
                    return matcher.test(value) || matcher.test(removeDiacritics(value));
                }));
            },
            open: function() {
                shoptet.modal.shoptetResize();
            },
            select: function(event) {
                setTimeout(function () {
                    $(event.target).parents('form').submit();
                }, 50);
            }
        });

        $(`${postDeliveryPointsData.deliveryPointPrefix}-form`).submit(function() {
            $('.cpost-delivery-point-result').addClass('ajax-pending-element');
            var postData = 'zipCode=' + $.trim($(`${postDeliveryPointsData.deliveryPointPrefix}-wrapper .zip-code`).val());
            postData += "&postName=" + $.trim($(`${postDeliveryPointsData.deliveryPointPrefix}-wrapper .city`).val());
            if (shipmentId) {
                postData += "&shipmentId=" + shipmentId.toString();
            }
            $.ajax({
                url: postDeliveryPointsData.formAction,
                data: postData,
                type: 'POST',
                headers: {
                    'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                },
                success: function(responseData) {
                    $('.cpost-delivery-point-result').removeClass('ajax-pending-element');
                    $(`${postDeliveryPointsData.deliveryPointPrefix}-result-table`).html(responseData);
                    $(`${postDeliveryPointsData.deliveryPointPrefix}-result`).show(0);
                    $('.cpost-delivery-point-show-opening-hours').click(function(e) {
                        e.preventDefault();
                        var $openingHours = $(this).siblings('.cpost-delivery-point-opening-hours') ;
                        $openingHours.addClass('active');
                        $(this).hide();
                        shoptet.modal.shoptetResize();
                        setTimeout(function() {
                            scrollToEl($openingHours);
                        }, 301);
                    });
                    if (!shoptet.layout.detectResolution(768)) {
                        scrollToEl($(`${postDeliveryPointsData.deliveryPointPrefix}-result`));
                    }
                    shoptet.modal.shoptetResize();
                },
                error: function() {
                    $('.cpost-delivery-point-result').removeClass('ajax-pending-element');
                    showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                }
            });
            $(`${postDeliveryPointsData.deliveryPointPrefix}-wrapper .zip-code`).autocomplete('close');
            $(`${postDeliveryPointsData.deliveryPointPrefix}-wrapper .city`).autocomplete('close');

            return false;
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        shoptet.checkoutShared.getStatedValues();
        shoptet.checkoutShared.setActiveShippingAndPayments();
        shoptet.checkoutShared.displayApplePay();
        shoptet.checkoutShared.setupDeliveryShipping();
        if (shoptet.checkoutShared.spayPaymentActive) {
            shoptetpay();
            if (!!document.querySelector('.radio-wrapper[data-submethod="pis"]')) {
                getPISBanksData();
            }
        }
        shoptet.checkoutShared.payu();
        shoptet.checkoutShared.setupExternalShipping();
        if (typeof changeCountryAndRegions === 'function') {
            changeCountryAndRegions();
        }
        var elements = document.querySelectorAll('.shipping-billing-table .radio-wrapper');
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('mousedown', function(e) {
                e.stopPropagation();
                var label = this.querySelector('label');
                if (label.classList.contains('inactive') || e.target.closest('.bankInformation')) {
                    return false;
                }
                var table = this.closest('.shipping-billing-table');
                var activeWrappers = table.querySelectorAll('.radio-wrapper.active');
                if (activeWrappers) {
                    for (var i = 0; i < activeWrappers.length; i++) {
                        activeWrappers[i].classList.remove('active');
                        activeWrappers[i].querySelector('label').classList.remove('active');
                        var inputs = activeWrappers[i].querySelectorAll('input[name="billingId"]');
                        for (var i = 0; i < inputs.length; i++) {
                            inputs[i].checked = false;
                        }
                    }
                }
                this.classList.add('active');
                var input = this.querySelector('input[name="billingId"]');
                if (!input) {
                    input = this.querySelector('input[name="shippingId"]');
                }
                if (input) {
                    if (!input.checked) {
                        input.checked = true;
                    }
                    if (input.classList.contains('payu')) {
                        var payuTable = document.querySelector('.table-payu');
                        if (payuTable && !payuTable.querySelector('input:checked')) {
                            // Check the first specific PayU billing method
                            payuTable.querySelector('input[name="pay_type"]').checked = true;
                        }
                    }
                }
                var link = this.querySelector('a');
                if (this.getAttribute('data-external-script-code')) {
                    shoptet.checkoutShared.handleExternalShippingLinks(this, link, e);
                } else {
                    shoptet.checkoutShared.callShippingBillingRelations();
                    if (link) {
                        if (
                            link.classList.contains('zasilkovna-name')
                            && !link.querySelector('.zasilkovna-default')
                        ) {
                            return;
                        }
                        if (!link.classList.contains('chosen') || e.target instanceof HTMLAnchorElement) {
                            var ev = new CustomEvent('click', { bubbles: true, cancelable: true });
                            link.dispatchEvent(ev);
                        }
                    }
                }
                var toggleableTable = this.closest('.cart-hide-unselected-options');
                if (toggleableTable) {
                    var nonactiveWrappers = toggleableTable.querySelectorAll('.radio-wrapper:not(.active)');
                    for (var i = 0; i < nonactiveWrappers.length; i++) {
                        nonactiveWrappers[i].classList.remove('selected-option');
                        nonactiveWrappers[i].classList.add('unselected-option');
                    }
                    this.classList.add('selected-option');
                    this.classList.remove('unselected-option');
                    var toggleButton = document.querySelector('[data-table="'+toggleableTable.id+'"]');
                    toggleButton.classList.remove('js-hidden');
                }
            });
        }
    });

    shoptet.checkoutShared = shoptet.checkoutShared || {};
    shoptet.scripts.libs.checkoutShared.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'checkoutShared');
    });

    shoptet.checkoutShared.shoptetPayPIS = shoptet.checkoutShared.shoptetPayPIS || {};

    document.addEventListener("DOMContentLoaded", function () {
        var $document = $(document);

        $document.on('click', '#orderFormButton', function () {
            $('.js-orderFormSubmit').click();
        });

        $document.on('click', '.js-orderFormSubmit', function () {
            var $el = $('input[name="shippingId"].choose-branch:checked');

            if ($el.length) {
                var code = $el.attr('data-code');
                var $label = $el.siblings('label');
                if(!$label.length){
                    $label = $el.parent('label');
                }
                var $chosen = $label.find('.chosen');
                if (!$chosen.length) {
                    if ($label.find('.zasilkovna-choose').length && !$label.find('.zasilkovna-default').length) {
                        return true;
                    }
                    var message = shoptet.messages['choose-' + code];
                    if (typeof message === 'undefined') {
                        message = shoptet.messages['specifyShippingMethod'];
                    }
                    showMessage(message, 'error', '', false, false);
                    scrollToEl($label);
                    return false;
                }
            }
        });

        // Prevents clicks on tooltip from propagating to parent shipping or billing methods.
        // On touch devices, tooltip is displayed, but modal with pick-up points doesn't open.
        $(".shipping-billing-table .show-tooltip").on("mousedown", function(e) {
            e.stopPropagation();
        });
    });

})(shoptet);
