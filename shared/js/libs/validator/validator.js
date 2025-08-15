(function(shoptet) {

    function initNewValidator(validator, element, event) {
        element.addEventListener(event, function() {
            validator(element);
        });
    }

    function formContainsInvalidFields(form) {
        return form.querySelectorAll(shoptet.validator.invalidFieldClasses).length;
    }

    function handleValidators(validators) {
        Object.keys(validators).forEach(function(key) {
            var currentValidator = validators[key];
            for (var innerKey in currentValidator['elements']) {
                if (typeof currentValidator['elements'][innerKey] === 'object') {
                    currentValidator['events'].forEach(function(event, index) {
                        shoptet.validator.initNewValidator(
                            currentValidator['validator'],
                            currentValidator['elements'][innerKey],
                            event
                        );
                        if (currentValidator['fireEvent']) {
                            if (!(currentValidator['fireOneEvent'] && index > 0)) {
                                if (shoptet.scripts.availableCustomEvents.indexOf(event) !== -1) {
                                    shoptet.scripts.signalCustomEvent(event, currentValidator['elements'][innerKey]);
                                } else {
                                    shoptet.scripts.signalNativeEvent(event, currentValidator['elements'][innerKey]);
                                }
                            }
                        }
                    });
                }
            }
        });
    }

    function getExistingMessage(elementWrapper) {
        var messageClass = '.js-validator-msg';

        return elementWrapper.querySelectorAll(messageClass);
    }

    function removeErrorMessage(element, messageType, elementWrapper) {
        if (typeof elementWrapper === 'undefined') {
            elementWrapper =  element.closest('.js-validated-element-wrapper');
        }
        var messageClass = 'js-error-field';
        var existingMessage = shoptet.validator.getExistingMessage(elementWrapper);

        if (existingMessage.length) {
            for (var i = 0; i < existingMessage.length; i++) {
                if (typeof messageType === 'undefined') {
                    /* Without 'messageType' parameter is called by adding new message */
                    existingMessage[i].parentNode.removeChild(existingMessage[i]);
                    element.classList.remove(messageClass);
                } else {
                    if (existingMessage[i].dataset.type === messageType) {
                        existingMessage[i].parentNode.removeChild(existingMessage[i]);
                        element.classList.remove(messageClass);
                    }
                }
            }
            var errorRemoveEvent = new CustomEvent('shoptetRemoveErrorMessage', {
                bubbles: true,
                detail: {
                    element: element,
                },
            });
            element.dispatchEvent(errorRemoveEvent);
        }
    }

    function addErrorMessage(element, messageType) {
        var elementWrapper = element.closest('.js-validated-element-wrapper');
        shoptet.validator.removeErrorMessage(element, undefined, elementWrapper);
        element.classList.add('js-error-field');
        var message = document.createElement('div');
        message.classList.add('js-validator-msg');
        message.classList.add('msg-error');
        message.setAttribute('data-type', messageType);
        if (element.required) {
          message.textContent = shoptet.messages.validator[`${element.name}Required`] ?? shoptet.messages[messageType]
        } else {
          message.innerHTML = shoptet.messages[messageType];
        }
        elementWrapper.insertAdjacentElement('beforeend', message);

        var errorAddEvent = new CustomEvent('shoptetAddErrorMessage', {
            bubbles: true,
            detail: {
                element: element,
            },
        });
        element.dispatchEvent(errorAddEvent);
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Disabled until the old validator will be abandoned
        var oldValidationIsStillInUse = true;
        if (!oldValidationIsStillInUse) {
            var forms = document.getElementsByTagName('form');
            for (var key in forms) {
                if (typeof forms[key] === 'object') {
                    forms[key].addEventListener('submit', function(form) {
                        formContainsInvalidFields(form);
                    });
                }
            }
        }
    });

    // Trim text inputs globally
    document.addEventListener('change', function(e) {
        if (e.target && e.target.matches('input[type="text"], input[type="email"]')) {
            e.target.value = e.target.value.trim();
        }
    });

    shoptet.validator = shoptet.validator || {};
    shoptet.scripts.libs.validator.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'validator');
    });
    shoptet.validator.invalidFieldClasses = '.js-error-field, .js-validated-field';
    shoptet.validator.events = ['DOMContentLoaded', 'ShoptetDOMContentLoaded'];

})(shoptet);
