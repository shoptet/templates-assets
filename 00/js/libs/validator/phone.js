(function(shoptet) {
    function validateNumber(el) {
        if (el.classList.contains('js-validation-suspended'))  {
            return true;
        }
        el.classList.add('js-validated-field');
        el.setAttribute('disabled', true);

        var validatedValue = el.value.replace(/[^0-9|'+']/g, '');
        if (validatedValue.indexOf('+') !== -1) {
            // 3 - max length of phone code (without leading '+' sign)
            for (var i = 3; i > 0; i--) {
                var phoneCode = validatedValue.substr(1, i);
                if (!phoneCode.match(/^\d+$/)) {
                    continue;
                }
                if (shoptet.phoneInput.phoneCodes.indexOf(parseInt(phoneCode)) !== -1) {
                    var activeFlag = el.parentElement.querySelector('.country-flag.selected');
                    var flag = el.parentElement.querySelector('.country-flag[data-dial="' + phoneCode + '"]');
                    if (flag) {
                        if (activeFlag.getAttribute('data-dial') !== phoneCode) {
                            shoptet.phoneInput.setSelectedCountry(flag, flag.parentElement.parentElement, false);
                        }
                        validatedValue = validatedValue.substring(i + 1);
                        el.value = validatedValue;
                        break;
                    }
                }
            }
        }
        var phoneWrapper = el.parentElement;
        var phoneInfo = {};
        var phoneInfoEl = phoneWrapper.querySelector('.js-phone-code');
        try  {
            phoneInfo = JSON.parse(phoneInfoEl.value);
        } catch(e) {
            el.classList.remove('js-validated-field');
            el.removeAttribute('disabled');
            return false;
        }

        if (validatedValue.length === 0 && el.value.length !== 0) {
            shoptet.validator.addErrorMessage(el, phoneWrapper, shoptet.validatorPhone.messageType);
            el.classList.remove('js-validated-field');
            el.removeAttribute('disabled');
            return false;
        }

        if (!validatedValue.length) {
            shoptet.validator.removeErrorMessage(el, phoneWrapper, shoptet.validatorPhone.messageType);
            el.classList.remove('js-validated-field');
            el.removeAttribute('disabled');
            return true;
        }

        if (++shoptet.validatorPhone.ajaxPending > shoptet.validatorPhone.validators.phoneInputs.elements.length) {
            shoptet.validatorPhone.ajaxPending--;
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
                shoptet.scripts.signalCustomEvent('ShoptetValidationError', el);
            }
            el.classList.remove('js-validated-field');
            el.removeAttribute('disabled');
            shoptet.validatorPhone.ajaxPending--;
        };

        var failedCallback = function() {
            el.classList.remove('js-validated-field');
            el.removeAttribute('disabled');
            shoptet.validatorPhone.ajaxPending--;
        }

        var url = shoptet.validatorPhone.validateUrl;
        url += '?number=' + encodeURIComponent(validatedValue)
            + '&phoneCode=' + encodeURIComponent(phoneInfo.phoneCode)
            + '&countryCode=' + encodeURIComponent(phoneInfo.countryCode);
        shoptet.ajax.makeAjaxRequest(
            url,
            shoptet.ajax.requestTypes.get,
            '',
            {
                'success': successCallback,
                'failed' : failedCallback
            }
        ).then(function() {
            // Check if it is last ajax calling
            if(shoptet.validatorPhone.ajaxPending === 0) {
                document.dispatchEvent(new Event(shoptet.validatorPhone.ajaxDoneEvent))
            }
        });

    }

    shoptet.validatorPhone = shoptet.validatorPhone || {};
    shoptet.scripts.libs.validatorPhone.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'validatorPhone');
    });
    shoptet.validatorPhone.validateUrl = '/action/ShoptetValidatePhone/index/';
    shoptet.validatorPhone.messageType = 'validatorInvalidPhoneNumber';
    shoptet.validatorPhone.validators = {
        phoneInputs: {
            elements: document.getElementsByClassName('js-validate-phone'),
            events: ['change', 'ShoptetPhoneCodeChange'],
            validator: shoptet.validatorPhone.validateNumber,
            fireEvent: true,
            fireOneEvent: true
        }
    };
    shoptet.validatorPhone.ajaxPending = 0;
    shoptet.validatorPhone.ajaxDoneEvent = 'ShoptetAjaxValidationDone';

    for (var i = 0; i < shoptet.validator.events.length; i++) {
        document.addEventListener(shoptet.validator.events[i], function() {
            shoptet.validator.handleValidators(shoptet.validatorPhone.validators);
        });
    }

})(shoptet);
