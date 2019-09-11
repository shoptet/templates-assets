(function(shoptet) {
    function validateNumber(el) {
        if (el.classList.contains('js-validation-suspended'))  {
            return true;
        }
        el.classList.add('js-validated-field');
        el.setAttribute('disabled', true);

        var validatedValue = el.value.replace(/ /g, '');
        if (validatedValue.indexOf('+') !== -1) {
            // 3 - max length of phone code (without leading '+' sign)
            for (var i = 3; i > 0; i--) {
                var phoneCode = validatedValue.substr(1, i);
                if (!phoneCode.match(/^\d+$/)) {
                    break;
                }
                if (shoptet.phoneInput.phoneCodes.indexOf(parseInt(phoneCode)) !== -1) {
                    var flag = document.querySelector('.country-flag[data-rel="+' + phoneCode + '"]');
                    shoptet.phoneInput.setSelectedCountry(flag, flag.parentElement.parentElement);
                    validatedValue = validatedValue.substring(i + 1);
                    el.value = validatedValue;
                    break;
                }
            }
        }

        var number = el.previousElementSibling.value + validatedValue;
        var phoneWrapper = el.parentElement;

        if (!validatedValue.length) {
            shoptet.validator.removeErrorMessage(el, phoneWrapper, shoptet.validatorPhone.messageType);
            el.classList.remove('js-validated-field');
            el.removeAttribute('disabled');
            return true;
        }

        if (shoptet.validator.ajaxPending++) {
            return;
        }

        var successCallback = function(response) {
            if (response.getFromPayload('isValidForRegion')) {
                el.value = response.getFromPayload('nationalNumber');
                shoptet.validator.removeErrorMessage(el, phoneWrapper, shoptet.validatorPhone.messageType);
                shoptet.validator.removeErrorMessage(el, phoneWrapper, shoptet.validatorRequired.messageType);
            } else {
                shoptet.validator.addErrorMessage(
                    el,
                    phoneWrapper,
                    shoptet.validatorPhone.messageType
                );
            }
            el.classList.remove('js-validated-field');
            el.removeAttribute('disabled');
            shoptet.validator.ajaxPending = 0;
        };

        var url = shoptet.config.validatePhoneUrl;
        url += '?number=' + encodeURIComponent(number);
        shoptet.ajax.makeAjaxRequest(
            url,
            shoptet.ajax.requestTypes.get,
            '',
            successCallback,
            false,
            false
        );

    }

    shoptet.validatorPhone = shoptet.validatorPhone || {};
    shoptet.scripts.libs.validatorPhone.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'validatorPhone');
    });
    shoptet.validatorPhone.messageType = 'validatorInvalidPhoneNumber';
    shoptet.validatorPhone.validators = {
        phoneInputs: {
            elements: document.getElementsByClassName('js-validate-phone'),
            events: ['change', 'ShoptetPhoneCodeChange'],
            validator: shoptet.validatorPhone.validateNumber,
            fireEvent: true
        }
    };

    for (var i = 0; i < shoptet.validator.events.length; i++) {
        document.addEventListener(shoptet.validator.events[i], function() {
            shoptet.validator.handleValidators(shoptet.validatorPhone.validators);
        });
    }

})(shoptet);
