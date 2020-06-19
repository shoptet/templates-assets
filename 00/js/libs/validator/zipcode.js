(function(shoptet) {
    function validateZipCode(el) {
        if (el.classList.contains('js-validation-suspended'))  {
            return true;
        }

        var validatedValue = el.value.trim();
        var validPattern = el.getAttribute('data-pattern');
        var elWrapper = el.parentElement;

        var regex = validPattern ? new RegExp(validPattern, "i") : false;

        if (regex && validatedValue && !regex.test(validatedValue)) {
            shoptet.validator.addErrorMessage(
                el,
                elWrapper,
                shoptet.validatorZipCode.messageType
            );
            shoptet.scripts.signalCustomEvent('ShoptetValidationError', el);
        } else {
            shoptet.validator.removeErrorMessage(el, elWrapper, shoptet.validatorZipCode.messageType);
        }
    }

    /**
     * Update Zip code data-pattern param by current country
     *
     * @param {Object} $el
     * $el = Country select element which has changed
     */

    function updateZipValidPattern($el) {
        if ($el.attr('id') === 'billCountryId') {
            $('#billZip').attr('data-pattern', $el.find('option:selected').data('zip-code-pattern'));
            shoptet.scripts.signalCustomEvent('ShoptetBillZipPatternChange', $('#billZip')[0]);
        } else if ($el.attr('id') === 'deliveryCountryId') {
            $('#deliveryZip').attr('data-pattern', $el.find('option:selected').data('zip-code-pattern'));
            shoptet.scripts.signalCustomEvent('ShoptetDeliveryZipPatternChange', $('#deliveryZip')[0]);
        }
    }

    shoptet.validatorZipCode = shoptet.validatorZipCode || {};
    shoptet.scripts.libs.validatorZipCode.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'validatorZipCode');
    });

    shoptet.validatorZipCode.messageType = 'validatorZipCode';
    shoptet.validatorZipCode.validators = {
        zipCodeInputs: {
            elements: document.getElementsByClassName('js-validate-zip-code'),
            events: ['change', 'ShoptetBillZipPatternChange', 'ShoptetDeliveryZipPatternChange'],
            validator: shoptet.validatorZipCode.validateZipCode,
            fireEvent: true,
            fireOneEvent: true
        }
    };

    for (var i = 0; i < shoptet.validator.events.length; i++) {
        document.addEventListener(shoptet.validator.events[i], function() {
            shoptet.validator.handleValidators(shoptet.validatorZipCode.validators);
        });
    }

})(shoptet);
