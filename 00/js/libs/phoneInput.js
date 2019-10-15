(function(shoptet) {

    function handleFlags(el) {
        el.addEventListener('keyup', function (e) {
            shoptet.phoneInput.handleKeyCodes(e, el);
        });
        var flagsEl = el.getElementsByClassName('country-flag');
        for (var key in flagsEl) {
            if (typeof flagsEl[key] === 'object') {
                var parentGroup = flagsEl[key].parentElement.parentElement;
                (function(flag, parentGroup) {
                    flag.addEventListener('click', function(e) {
                        e.stopPropagation();
                        parentGroup.focus();
                        if (parentGroup.classList.contains('active')) {
                            shoptet.phoneInput.hideCountriesSelect(parentGroup);
                        } else {
                            parentGroup.classList.add('active');
                        }
                        if (!flag.classList.contains('selected')) {
                            shoptet.phoneInput.setSelectedCountry(flag, parentGroup, true);
                        }
                    });
                }(flagsEl[key], parentGroup));
            }
        }
    }

    function interconnectFlagsWithSelect() {
        var flagsGroups = document.getElementsByClassName('country-flags');
        for (var key in flagsGroups) {
            if (typeof flagsGroups[key] === 'object') {
                flagsGroups[key].setAttribute('data-select', flagsGroups[key].nextElementSibling.getAttribute('id'));
                shoptet.phoneInput.handleFlags(flagsGroups[key]);
            }
        }
    }

    function hideCountriesSelect(el) {
        var inner = el.querySelector('.country-flags-inner');
        inner.scrollTop = 0;
        el.classList.remove('active');
        el.blur();
    }

    function setSelectedCountry(el, parentGroup, signal) {
        var select = document.getElementById(parentGroup.dataset.select);
        var input = select.nextElementSibling;

        var originalValue = JSON.parse(select.value);
        var newValue = el.dataset.rel;
        if ((originalValue.countryCode !== newValue)) {
            var selectedItem = parentGroup.querySelector('.selected');
            if (selectedItem) {
                selectedItem.classList.remove('selected');
            }

            el.classList.add('selected');
            shoptet.phoneInput.selectSelectedOption(parentGroup, el, select);

            if (signal) {
                shoptet.scripts.signalCustomEvent('ShoptetPhoneCodeChange', input);
            }
        }
    }

    function selectSelectedOption(parentGroup, el, select) {
        var options = select.getElementsByTagName('option');
        var selectedIndex = false;
        for (var i = 0; i < options.length; i++) {
            options[i].removeAttribute('selected');
            var optionValue = JSON.parse(options[i].value);
            if (optionValue.countryCode === el.dataset.rel) {
                selectedIndex = i;
            }
        }
        options[selectedIndex].setAttribute('selected', 'selected');
    }

    function handleKeyCodes(e, el) {
        if (e.keyCode === 27) {
            shoptet.phoneInput.hideCountriesSelect(el);
            shoptet.phoneInput.pressedKeys = '';
            return;
        }

        clearTimeout(shoptet.phoneInput.phoneInputKeyup);

        shoptet.phoneInput.pressedKeys += translateKeys(String.fromCharCode(e.keyCode));

        shoptet.phoneInput.phoneInputKeyup = setTimeout(function() {
            shoptet.phoneInput.pressedKeys = '';
        }, 1000);

        var matchedElement = el.querySelector('[data-country-name^="' + shoptet.phoneInput.pressedKeys + '"]');
        if (matchedElement) {
            var parent = matchedElement.offsetParent;
            parent.scrollTop = matchedElement.offsetTop;
        }
    }

    function translateKeys(key) {
        switch (key) {
            case '2':
                return 'Ě';
            case '3':
                return 'Š';
            case '4':
                return 'Č';
            case '5':
                return 'Ř';
            case '6':
                return 'Ž';
            case '7':
                return 'Ý';
            case '8':
                return 'Á';
            case '9':
                return 'Í';
            case '0':
                return 'É';
            default:
                return key;
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        shoptet.phoneInput.interconnectFlagsWithSelect();
    });

    document.addEventListener('click', function() {
        var flagsGroups = document.getElementsByClassName('country-flags');
        for (var key in flagsGroups) {
            if (typeof flagsGroups[key] === 'object') {
                shoptet.phoneInput.hideCountriesSelect(flagsGroups[key]);
            }
        }
    });

    shoptet.phoneInput = shoptet.phoneInput || {};
    shoptet.phoneInput.phoneInputKeyup = false;
    shoptet.phoneInput.pressedKeys = '';
    shoptet.phoneInput.handleFlags = handleFlags;
    shoptet.phoneInput.interconnectFlagsWithSelect = interconnectFlagsWithSelect;
    shoptet.phoneInput.hideCountriesSelect = hideCountriesSelect;
    shoptet.phoneInput.setSelectedCountry = setSelectedCountry;
    shoptet.phoneInput.handleKeyCodes = handleKeyCodes;
    shoptet.phoneInput.selectSelectedOption = selectSelectedOption;

})(shoptet);
