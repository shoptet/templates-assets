(function(shoptet) {

    function validateRequiredField(el) {
        if (el.classList.contains('js-validation-suspended'))  {
            return true;
        }
        // TODO: support for other than text fields
        if (!el.value.length && !el.classList.contains('no-js-validation')) {
            // TODO: phoneWrapper is incorrect
            var phoneWrapper = el.parentElement;
            shoptet.validator.addErrorMessage(
                el,
                phoneWrapper,
                shoptet.validatorRequired.messageType
            );
            shoptet.scripts.signalCustomEvent('ShoptetValidationError', el);
        } else {
            phoneWrapper = el.parentElement;
            shoptet.validator.removeErrorMessage(el, phoneWrapper, shoptet.validatorRequired.messageType);
        }
    }

    shoptet.validatorRequired = shoptet.validatorRequired || {};
    shoptet.scripts.libs.validatorRequired.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'validatorRequired');
    });
    shoptet.validatorRequired.messageType = 'validatorRequired';
    shoptet.validatorRequired.validators = {
        requiredInputs: {
            elements: document.getElementsByClassName('js-validate-required'),
            events: ['change', 'blur', 'validatedFormSubmit'],
            validator: shoptet.validatorRequired.validateRequiredField,
            fireEvent: false
        }
    };
    for (var i = 0; i < shoptet.validator.events.length; i++) {
        document.addEventListener(shoptet.validator.events[i], function() {
            shoptet.validator.handleValidators(shoptet.validatorRequired.validators);
        });
    }

})(shoptet);
