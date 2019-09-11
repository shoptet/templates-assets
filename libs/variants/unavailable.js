(function(shoptet) {

    function setupAllParameters(params) {
        var displayMessage = false;
        params.forEach(function(param) {
            displayMessage = shoptet.variantsUnavailable.setupCurrentParameter(
                document.getElementById(param),
                params,
                shoptet.variantsUnavailable.availableVariants
            );
        });
        if (displayMessage) {
            document.getElementById('jsUnavailableCombinationMessage').classList.remove('no-display');
        } else {
            document.getElementById('jsUnavailableCombinationMessage').classList.add('no-display');
        }
    }

    function attachEventListeners(el, params) {
        var events = ['change', 'ShoptetSelectedParametersReset'];
        events.forEach(function(event) {
            el.addEventListener(event, function() {
                shoptet.variantsUnavailable.setupAllParameters(params);
            });
        });
    }

    function getAvailableCombinations(variants, selected, currentParam) {
        var available = {};
        variants.forEach(function(variant) {
            var matches = true;
            for (var param in selected) {
                if (selected.hasOwnProperty(param)) {
                    if (selected[param] === null || variant[param] === selected[param]) {
                        continue;
                    }
                    matches = false;
                    break;
                }
            }
            if (matches) {
                available[variant[currentParam]] = true;
            }
        });

        return available;
    }

    function getSelected(params, currentParam) {
        var selected = {};
        params.forEach(function(element) {
            if (element === currentParam) {
                return;
            }
            var val;
            var currentElement = document.getElementById(element);
            if (currentElement.tagName === 'SELECT') {
                val = shoptet.common.getSelectValue(currentElement);
            } else {
                val = shoptet.common.getCheckedInputValue(currentElement)
                    ? shoptet.common.getCheckedInputValue(currentElement)
                    : '';
            }
            selected[element] = (val === '' ? null : val);
        });
        return selected;
    }

    function getExistingOptions(el) {
        var existingOptions = [];
        if (el.tagName === 'SELECT') {
            options = el.options;
        } else {
            options = el.querySelectorAll('.advanced-parameter');
        }
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (!option.getAttribute('data-choose')) {
                existingOptions.push(option);
            }
        }
        return existingOptions;
    }

    function getUnavailableOptgroup(el) {
        var unavailableOptgroup = el.querySelector('.' + shoptet.variantsUnavailable.classes.unavailableOptgroup);
        if (!unavailableOptgroup) {
            var optgroup = document.createElement('optgroup');
            optgroup.setAttribute('label', shoptet.messages['unavailableCombination']);
            optgroup.classList.add('unavailable-variants');
            el.append(optgroup);
            unavailableOptgroup = el.querySelector('.' + shoptet.variantsUnavailable.classes.unavailableOptgroup);
        }
        return unavailableOptgroup;
    }

    function handleOptions(el, available, existing) {
        for (var param in existing) {
            if (existing.hasOwnProperty(param)) {
                var option;
                if (el.tagName === 'SELECT') {
                    var unavailableOptgroup = shoptet.variantsUnavailable.getUnavailableOptgroup(el);
                    option = existing[param];
                } else {
                    option = existing[param].querySelector('input');
                }
                if (!available.hasOwnProperty(option.value)) {
                    option.classList.add(shoptet.variantsUnavailable.classes.unavailableOption);
                    if (el.tagName === 'SELECT') {
                        unavailableOptgroup.append(option);
                    } else {
                        option.parentElement.classList.add(
                            shoptet.variantsUnavailable.classes.unavailableOptionWrapper
                        );
                    }
                } else {
                    option.classList.remove(shoptet.variantsUnavailable.classes.unavailableOption);
                    if (el.tagName === 'SELECT') {
                        shoptet.variantsUnavailable.moveOptionFromUnavailable(option, unavailableOptgroup);
                    } else {
                        option.parentElement.classList.remove(
                            shoptet.variantsUnavailable.classes.unavailableOptionWrapper
                        );
                    }
                }
            }
        }
    }

    function getOption(el, param) {
        var selector, option;
        if (el.tagName === 'SELECT') {
            selector = 'option[value="' + param + '"]';
            option = el.querySelector(selector);
        } else {
            selector = 'input[value="' + param + '"]';
            var input = el.querySelector(selector);
            option = input.parentNode;
        }
        return option;
    }

    function moveOptionFromUnavailable(option, unavailableOptgroup) {
        var options = unavailableOptgroup.querySelectorAll('option');
        for (var i = 0; i < options.length; i++) {
            if (options[i].value === option.value) {
                var wrapper = unavailableOptgroup.parentNode;
                wrapper.insertBefore(option, unavailableOptgroup);
            }
        }
    }

    function areUnavailableOptionsSelected(unavailableOptions) {
        for (var i = 0; i < unavailableOptions.length; i++) {
            if (unavailableOptions[i].selected || unavailableOptions[i].checked) {
                return true;
            }
        }
        return false;
    }

    function setupCurrentParameter(el, params, variants) {
        var existingOptions = shoptet.variantsUnavailable.getExistingOptions(el);

        var currentParam = el.getAttribute('id');
        var selected = shoptet.variantsUnavailable.getSelected(params, currentParam);
        var available = shoptet.variantsUnavailable.getAvailableCombinations(variants, selected, currentParam);

        shoptet.variantsUnavailable.handleOptions(el, available, existingOptions);

        if (el.tagName === 'SELECT') {
            var unavailableOptgroup = el.querySelector('.' + shoptet.variantsUnavailable.classes.unavailableOptgroup);
            if (!unavailableOptgroup) {
                return false;
            }
            if (!unavailableOptgroup.childElementCount) {
                unavailableOptgroup.parentNode.removeChild(unavailableOptgroup);
            }
        }

        var unavailableOptions = el.querySelectorAll('.' + shoptet.variantsUnavailable.classes.unavailableOption);
        if (unavailableOptions.length < 1) {
            return false;
        }

        return shoptet.variantsUnavailable.areUnavailableOptionsSelected(unavailableOptions);
    }

    document.addEventListener("DOMContentLoaded", function() {
        if (typeof shoptet.variantsUnavailable.availableVariantsResource === 'undefined') {
            return;
        }

        shoptet.variantsUnavailable.availableVariants = [];
        for (var i = 0; i < shoptet.variantsUnavailable.availableVariantsResource.length; i++) {
            var splitted = shoptet.variantsUnavailable.availableVariantsResource[i].split('-');
            var currentVariant = {};

            (function() {
                for (var i = 0; i < splitted.length - 1; i++) {
                    if (i % 2 === 0) {
                        currentVariant['parameter-id-' + splitted[i]] = splitted[i + 1];
                    }
                }
            })();

            shoptet.variantsUnavailable.availableVariants.push(currentVariant);

        }

        var params = [];
        var parametersHolders = document.getElementsByClassName(shoptet.variantsUnavailable.classes.parametersHolder);
        for (var el in parametersHolders) {
            if (parametersHolders.hasOwnProperty(el)) {
                params.push(parametersHolders[el].getAttribute('id'));
            }
        }

        shoptet.variantsUnavailable.setupAllParameters(params);

        params.forEach(function(el) {
            var optionsWrapper = document.getElementById(el);
            if (optionsWrapper.tagName === 'SELECT') {
                shoptet.variantsUnavailable.attachEventListeners(optionsWrapper, params);
            } else {
                var inputs = optionsWrapper.querySelectorAll('.advanced-parameter input');
                for (var i = 0; i < inputs.length; i++) {
                    shoptet.variantsUnavailable.attachEventListeners(inputs[i], params);
                }
            }
        });

        resetLink = document.getElementById('jsSplitVariantsReset');
        resetLink.addEventListener('click', function(e) {
            e.preventDefault();
            var parametersHolder =
                document.querySelectorAll('.' + shoptet.variantsUnavailable.classes.parametersHolder);
            for (var i = 0; i < parametersHolder.length; i++) {
                if (parametersHolder[i].tagName === 'SELECT') {
                    shoptet.scripts.signalCustomEvent('ShoptetSelectedParametersReset', parametersHolder[i]);
                    parametersHolder[i].options.selectedIndex = 0;
                } else {
                    var defaultVariant = parametersHolder[i].querySelector('[data-index="0"]');
                    defaultVariant.checked = true;
                    var activeInput = parametersHolder[i].querySelector('input:not([data-index="0"])');
                    shoptet.scripts.signalCustomEvent('ShoptetSelectedParametersReset', activeInput);
                }
            }
        });
    });

    shoptet.variantsUnavailable = shoptet.variantsUnavailable || {};
    shoptet.scripts.libs.variantsUnavailable.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'variantsUnavailable');
    });
    shoptet.variantsUnavailable.classes = {
        parametersHolder: "hidden-split-parameter",
        unavailableOptgroup: "unavailable-variants",
        unavailableOption: "unavailable-option",
        unavailableOptionWrapper: "unavailable-option-wrapper"
    };

})(shoptet);
