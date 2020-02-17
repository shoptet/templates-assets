(function(shoptet) {

    /**
     * Wrapper for functions apply
     *
     * @param {Function} fn
     * fn = function to apply
     * @param {Object} args
     * args = optional array of arguments for applied function
     *
     */
    function applyFunction(fn, args) {
        var namespace = '';
        if (typeof fn.prototype.shoptetNamespace !== 'undefined') {
            namespace = fn.prototype.shoptetNamespace;
        }
        // TODO: remove after all files will be updated
        if (typeof args !== 'object') {
            args = [];
        }
        try {
            handleFunctionCall(fn, args, namespace);
            var returnValue = fn.apply(null, args);
            handleFunctionCallback(fn, args, namespace);
            return returnValue;
        } catch (e) {
            console.log('%cFunction ' + namespace + fn.name + ' was not applied.', shoptet.dev.config.log.styles.error);
            console.log('%cException:', shoptet.dev.config.log.styles.error);
            console.log(e);
        }
    }

    function handleFunctionCall(fn, args, namespace) {
        var event = new CustomEvent(namespace + fn.name);
        shoptet.scripts.arguments[namespace + fn.name] = args;
        document.dispatchEvent(event);
    }

    function handleFunctionCallback(fn, args, namespace) {
        var fnToApply = shoptet.scripts.customCallbacks[namespace + fn.name];
        if (typeof fnToApply === 'function') {
            fnToApply(args);
        }
    }

    function setCustomCallback(fnName, customCallback) {
        var fn = eval(fnName);
        if (typeof fn === 'function' && typeof customCallback === 'function') {
            var previousCallback = function() {};
            if (typeof shoptet.scripts.customCallbacks[fnName] === 'function') {
                previousCallback = shoptet.scripts.customCallbacks[fnName];
            }
            shoptet.scripts.customCallbacks[fnName] = function() {
                previousCallback();
                customCallback();
            };
        }
    }

    function signal(event, element, eventSource, globalEvent) {
        if (typeof element === 'undefined') {
            element = document;
        }
        try {
            if (eventSource === null || eventSource.indexOf(event) !== -1) {
                var ev;
                if (globalEvent) {
                    ev = new CustomEvent(globalEvent, {bubbles: true});
                    element.dispatchEvent(ev);
                }
                ev = new CustomEvent(event, {bubbles: true});
                element.dispatchEvent(ev);
                if (shoptet.dev.config.monitorEvents) {
                    if (globalEvent) {
                        console.log(
                            '%cEvent "' + globalEvent + '" was dispatched.',
                            shoptet.dev.config.log.styles.success
                        );
                    }
                    console.log('%cEvent "' + event + '" was dispatched.', shoptet.dev.config.log.styles.success);
                    console.log('%cElement on which the event was dispatched: ', shoptet.dev.config.log.styles.success);
                    console.log(element);
                }
                return true;
            }
            return false;
        } catch (e) {
            console.log('%cEvent "' + event + '" was not dispatched.', shoptet.dev.config.log.styles.error);
            console.log('%cElement on which the event should be dispatched: ', shoptet.dev.config.log.styles.error);
            console.log(element);
            console.log('%cException:', shoptet.dev.config.log.styles.error);
            console.log(e);
        }
    }

    function signalDomLoad(event, element) {
        signal(
            event,
            element,
            shoptet.scripts.availableDOMLoadEvents,
            'ShoptetDOMContentLoaded'
        );
    }

    function signalDomUpdate(event, element) {
        signal(
            event,
            element,
            shoptet.scripts.availableDOMUpdateEvents,
            'ShoptetDOMContentChanged'
        );
    }

    function signalCustomEvent(event, element) {
        signal(
            event,
            element,
            shoptet.scripts.availableCustomEvents,
            false
        );
    }

    function signalNativeEvent(event, element) {
        signal(
            event,
            element,
            null,
            false
        );
    }

    // Fix Function#name on browsers that do not support it (IE):
    if (!(function f() {}).name) {
        Object.defineProperty(Function.prototype, 'name', {
            get: function() {
                var name = (this.toString().match(/^function\s*([^\s(]+)/) || [])[1];
                // For better performance only parse once, and then cache the
                // result through a new accessor for repeated access.
                Object.defineProperty(this, 'name', { value: name });
                return name;
            }
        });
    }

    function registerFunction(fn, lib) {
        fn.prototype.shoptetNamespace = 'shoptet.' + lib + '.';
        shoptet[lib][fn.name] = function() {
            return shoptet.scripts.applyFunction(
                fn,
                arguments
            );
        };
    }

    shoptet.scripts = shoptet.scripts || {};
    shoptet.scripts.arguments = {};
    shoptet.scripts.monitoredFunctions = [];
    shoptet.scripts.availableDOMLoadEvents = [
        'ShoptetDOMContentLoaded',
        'ShoptetDOMRegisterFormLoaded',
        'ShoptetDOMCartContentLoaded',
        'ShoptetDOMAdvancedOrderLoaded',
        'ShoptetDOMPageContentLoaded',
        'ShoptetDOMPageMoreProductsLoaded'
    ];
    shoptet.scripts.availableDOMUpdateEvents = [
        'ShoptetDOMCartCountUpdated'
    ];
    // TODO: standardize format of "validatedFormSubmit"
    shoptet.scripts.availableCustomEvents = [
        'ShoptetPhoneCodeChange',
        'ShoptetPhoneCodeActive',
        'ShoptetSelectedParametersReset',
        'ShoptetSplitVariantParameterChange',
        'ShoptetSimpleVariantChange',
        'ShoptetVariantAvailable',
        'ShoptetVariantUnavailable',
        'ShoptetCartSetCartItemAmount',
        'ShoptetCartAddCartItem',
        'ShoptetCartDeleteCartItem',
        'ShoptetCartSetSelectedGift',
        'ShoptetCartAddDiscountCoupon',
        'ShoptetCartUpdated',
        'validatedFormSubmit',
        'ShoptetPagePaginationUsed',
        'ShoptetPageSortingChanged',
        'ShoptetPageFiltersRecalledFromHistory',
        'ShoptetPagePriceFilterChange',
        'ShoptetPageFilterValueChange',
        'ShoptetPageFiltersCleared',
        'ShoptetPageMoreProductsRequested',
        'ShoptetSuccessfulValidation',
        'ShoptetFailedValidation'
    ];
    // TODO: updateCartButton - on cart page unnecessary
    shoptet.scripts.libs = {
        cart: [
            'updateCartButton',
            'getCartContent',
            'getAdvancedOrder',
            'functionsForCart',
            'functionsForStep1',
            'createEventNameFromFormAction',
            'ajaxSubmitForm',
            'updateQuantityInCart',
            'removeItemFromCart',
            'toggleRelatedProducts',
            'triggerCofidisCalc'
        ],
        cookie: [
            'get',
            'create'
        ],
        checkout: [
            'changePaymentRelations',
            'callShippingBillingRelations',
            'replacingChosenShippingAndBilling',
            'revealMatrixPrice',
            'displaySelectedPriceByShippingBillingMethods',
            'checkFirstPossibleBillingMethod',
            'setFirstPossibleShippingAndBilling',
            'setActiveShippingAndPayments',
            'checkIsSelectedActive',
            'payu',
            'gopaySelectHelper',
            'getStatedValues',
            'setFieldValues',
            'toggleAnotherShipping',
            'modalMagic',
            'chooseABranchModal',
            'compareHeight',
            'fixSidebar',
            'handleWithSidebar',
            'setupDeliveryShipping'
        ],
        validator: [
            'initNewValidator',
            'formContainsInvalidFields',
            'handleValidators',
            'getExistingMessage',
            'removeErrorMessage',
            'addErrorMessage'
        ],
        validatorRequired: [
            'validateRequiredField'
        ],
        validatorPhone: [
            'validateNumber'
        ],
        global: [
            'showPopupWindow',
            'hideContentWindows',
            'updateSelectedRegions',
            'toggleRegionsWrapper',
            'restoreDefaultRegionSelect',
        ],
        menu: [
            'toggleMenu',
            'splitMenu',
            'splitHelperMenu',
            'showMenuHelper',
            'hideMenuHelper',
            'showSubmenu',
            'hideSubmenu',
            'updateMenu',
            'hideNavigation'
        ],
        variantsCommon: [
            'disableAddingToCart',
            'enableAddingToCart',
            'hasToDisableCartButton',
            'handleSubmit'
        ],
        variantsSimple: [
            'handler',
            'switcher'
        ],
        variantsSplit: [
            'handler',
            'callback',
            'showVariantDependent'
        ],
        variantsUnavailable: [
            'setupAllParameters',
            'attachEventListeners',
            'getAvailableCombinations',
            'getSelected',
            'getExistingOptions',
            'getUnavailableOptgroup',
            'handleOptions',
            'getOption',
            'moveOptionFromUnavailable',
            'areUnavailableOptionsSelected',
            'setupCurrentParameter',
            'sortOptions'
        ],
        phoneInput: [
            'handleFlags',
            'interconnectFlagsWithSelect',
            'hideCountriesSelect',
            'setSelectedCountry',
            'setLastPreferredCountry',
            'handleKeyCodes',
            'selectSelectedOption',
            'positionCountriesSelect'
        ],
        common: [
            'getSelectValue',
            'getCheckedInputValue',
            'createDocumentFromString'
        ],
        stockAvailabilities: [
            'getDeliveryPointName',
            'getDeliveryPointAmount',
            'getStockAvailabilities',
            'setStockAvailabilities',
            'attachEventListeners',
            'mouseEnterListener',
            'mouseLeaveListener'
        ]
    };

    for (var key in shoptet.scripts.libs) {
        if (shoptet.scripts.libs.hasOwnProperty(key)) {
            for (var i = 0; i < shoptet.scripts.libs[key].length; i++) {
                shoptet.scripts.monitoredFunctions.push(
                    'shoptet.' + key + '.' + shoptet.scripts.libs[key][i]
                );
            }
        }
    }

    shoptet.scripts.applyFunction = applyFunction;
    shoptet.scripts.handleFunctionCall = handleFunctionCall;
    shoptet.scripts.handleFunctionCallback = handleFunctionCallback;
    shoptet.scripts.setCustomCallback = setCustomCallback;
    shoptet.scripts.signal = signal;
    shoptet.scripts.signalDomLoad = signalDomLoad;
    shoptet.scripts.signalDomUpdate = signalDomUpdate;
    shoptet.scripts.signalCustomEvent = signalCustomEvent;
    shoptet.scripts.signalNativeEvent = signalNativeEvent;
    shoptet.scripts.registerFunction = registerFunction;

    shoptet.scripts.customCallbacks = {};

})(shoptet);
