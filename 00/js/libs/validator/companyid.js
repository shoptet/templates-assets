(function(shoptet) {
    function validateCompanyId(el) {
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
                shoptet.validatorCompanyId.messageTypeCustomized
            );
            shoptet.scripts.signalCustomEvent('ShoptetValidationError', el);
        } else {
            shoptet.validator.removeErrorMessage(el, elWrapper, shoptet.validatorCompanyId.messageTypeCustomized);
        }
    }

    /**
     * Update Commpany ID data-pattern param by current country
     *
     */
    function updateCompanyIdValidPattern() {
        var currentOption = $('#billCountryId').find('option:selected');
        if (currentOption.length) {
            $('#companyId').attr('data-pattern', currentOption.data('company-id-pattern'));
            shoptet.messages[shoptet.validatorCompanyId.messageTypeCustomized] =
                shoptet.messages[shoptet.validatorCompanyId.messageType]
                .replace("%1", currentOption.data('company-id-example'));

            shoptet.scripts.signalCustomEvent('ShoptetCompanyIdPatternChange', $('#companyId')[0]);
        }
    }

    shoptet.validatorCompanyId = shoptet.validatorCompanyId || {};
    shoptet.scripts.libs.validatorCompanyId.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'validatorCompanyId');
    });

    shoptet.validatorCompanyId.messageType = 'validatorInvalidCompanyId';
    shoptet.validatorCompanyId.messageTypeCustomized = 'validatorInvalidCompanyIdCustomized';
    shoptet.validatorCompanyId.validators = {
        companyIdInputs: {
            elements: document.getElementsByClassName('js-validate-company-id'),
            events: ['change', 'ShoptetCompanyIdPatternChange'],
            validator: shoptet.validatorCompanyId.validateCompanyId,
            fireEvent: true,
            fireOneEvent: true
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        var input = document.querySelector('.js-validate-company-id');
        if (input) {
            shoptet.validatorCompanyId.updateCompanyIdValidPattern();
        }
    });

    for (var i = 0; i < shoptet.validator.events.length; i++) {
        document.addEventListener(shoptet.validator.events[i], function() {
            shoptet.validator.handleValidators(shoptet.validatorCompanyId.validators);
        });
    }

})(shoptet);
