(function (shoptet) {
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
      var previousCallback = function () {};
      if (typeof shoptet.scripts.customCallbacks[fnName] === 'function') {
        previousCallback = shoptet.scripts.customCallbacks[fnName];
      }
      shoptet.scripts.customCallbacks[fnName] = function (args) {
        previousCallback(args);
        customCallback(args);
      };
    }
  }

  function setCustomFunction(fnName, fn) {
    if (typeof fn !== 'function' || typeof shoptet.custom[fnName] !== 'function') {
      return;
    }
    var previousCallback = shoptet.custom[fnName];
    shoptet.custom[fnName] = function (el, args) {
      var originalReturnValue = previousCallback(el, args);
      var returnValue = fn(el, args);
      return !(originalReturnValue === false || returnValue === false);
    };
  }

  function signal(event, element, eventSource, globalEvent) {
    if (typeof element === 'undefined' || !element) {
      element = document;
    }
    try {
      if (eventSource === null || eventSource.indexOf(event) !== -1) {
        var ev;
        if (globalEvent) {
          ev = new CustomEvent(globalEvent, { bubbles: true });
          element.dispatchEvent(ev);
        }
        ev = new CustomEvent(event, { bubbles: true });
        element.dispatchEvent(ev);
        if (shoptet.dev.config.monitorEvents) {
          if (globalEvent) {
            console.log('%cEvent "' + globalEvent + '" was dispatched.', shoptet.dev.config.log.styles.success);
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
    signal(event, element, shoptet.scripts.availableDOMLoadEvents, 'ShoptetDOMContentLoaded');
  }

  function signalDomUpdate(event, element) {
    signal(event, element, shoptet.scripts.availableDOMUpdateEvents, 'ShoptetDOMContentChanged');
  }

  function signalCustomEvent(event, element) {
    signal(event, element, shoptet.scripts.availableCustomEvents, false);
  }

  function signalNativeEvent(event, element) {
    signal(event, element, null, false);
  }

  // Fix Function#name on browsers that do not support it (IE):
  if (!function f() {}.name) {
    Object.defineProperty(Function.prototype, 'name', {
      get: function () {
        var name = (this.toString().match(/^function\s*([^\s(]+)/) || [])[1];
        // For better performance only parse once, and then cache the
        // result through a new accessor for repeated access.
        Object.defineProperty(this, 'name', { value: name });
        return name;
      },
    });
  }

  function registerFunction(fn, lib) {
    fn.prototype.shoptetNamespace = 'shoptet.' + lib + '.';
    shoptet[lib][fn.name] = function () {
      return shoptet.scripts.applyFunction(fn, arguments);
    };
  }

  shoptet.scripts = shoptet.scripts || {};
  shoptet.scripts.arguments = {};
  shoptet.scripts.monitoredFunctions = [];
  shoptet.scripts.availableDOMLoadEvents = [
    'ShoptetDOMContentLoaded',
    'ShoptetDOMRegisterFormLoaded',
    'ShoptetDOMCartContentLoaded',
    'ShoptetDOMSearchResultsLoaded',
    'ShoptetDOMProductRatingsLoaded',
    'ShoptetDOMProductDiscussionsLoaded',
    'ShoptetDOMAdvancedOrderLoaded',
    'ShoptetDOMPageContentLoaded',
    'ShoptetDOMPageMoreProductsLoaded',
    'ShoptetDOMExpressCheckoutLoaded',
  ];
  shoptet.scripts.availableDOMUpdateEvents = ['ShoptetDOMCartCountUpdated'];
  // TODO: standardize format of "validatedFormSubmit"
  shoptet.scripts.availableCustomEvents = [
    'ShoptetPhoneCodeChange',
    'ShoptetPhoneCodeActive',
    'ShoptetBillZipPatternChange',
    'ShoptetDeliveryZipPatternChange',
    'ShoptetCompanyIdPatternChange',
    'ShoptetSelectedParametersReset',
    'ShoptetSplitVariantParameterChange',
    'ShoptetSimpleVariantChange',
    'ShoptetVariantAvailable',
    'ShoptetVariantUnavailable',
    'ShoptetCartSetCartItemAmount',
    'ShoptetCartAddCartItem',
    'ShoptetCartAddCartItemFailed',
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
    'ShoptetProductRatingsRequested',
    'ShoptetProductDiscussionsRequested',
    'ShoptetSuccessfulValidation',
    'ShoptetFailedValidation',
    'ShoptetProductsTracked',
    'ShoptetFacebookPixelTracked',
    'ShoptetGlamiPixelTracked',
    'ShoptetTikTokPixelTracked',
    'ShoptetGoogleCartTracked',
    'ShoptetGoogleProductDetailTracked',
    'ShoptetDataLayerUpdated',
    'ShoptetValidationTransform',
    'ShoptetValidationWarning',
    'ShoptetValidationError',
    'ShoptetBaseShippingInfoObtained',
    'ShoptetShippingMethodUpdated',
    'ShoptetBillingMethodUpdated',
    'ShoptetSurchargesPriceUpdated',
    'ShoptetQuantityDiscountUpdated',
  ];
  // TODO: updateCartButton - on cart page unnecessary
  shoptet.scripts.libs = {
    cart: [
      'updateCartButton',
      'getCartContent',
      'getAdvancedOrder',
      'functionsForStep1',
      'handleCartPostUpdate',
      'ajaxSubmitForm',
      'updateQuantityInCart',
      'removeItemFromCart',
      'toggleRelatedProducts',
    ],
    cartShared: ['addToCart', 'removeFromCart', 'updateQuantityInCart'],
    expressCheckout: ['initExpressCheckout'],
    cookie: ['get', 'create'],
    consent: ['get', 'set', 'isSet', 'isAccepted', 'onAccept', 'openCookiesSettingModal', 'cookiesConsentSubmit'],
    checkout: ['toggleAnotherShipping'],
    checkoutShared: [
      'displaySelectedPriceByShippingBillingMethods',
      'callShippingBillingRelations',
      'changePaymentRelations',
      'replacingChosenShippingAndBilling',
      'setActiveShippingAndPayments',
      'checkIsSelectedActive',
      'payu',
      'getStatedValues',
      'setFieldValues',
      'displayApplePay',
      'updatePrice',
      'getPriceFromElement',
      'updatePriceSummary',
      'afterPriceChange',
      'setExternalShippingMethod',
      'getDefaultShippingInfo',
      'setTimeoutForExpiration',
      'setupExternalShipping',
      'handleExternalShippingLinks',
      'setupDeliveryShipping',
      'chooseABranchModal',
      'modalMagic',
      'initBranchSelect',
      'twisto',
      'postDeliveryPoints',
      'setPickupPoint',
    ],
    validator: [
      'initNewValidator',
      'formContainsInvalidFields',
      'handleValidators',
      'getExistingMessage',
      'removeErrorMessage',
      'addErrorMessage',
    ],
    validatorRequired: ['validateRequiredField'],
    validatorPhone: ['validateNumber'],
    validatorZipCode: ['validateZipCode', 'updateZipValidPattern'],
    validatorCompanyId: ['validateCompanyId', 'updateCompanyIdValidPattern'],
    global: ['updateSelectedRegions', 'toggleRegionsWrapper', 'restoreDefaultRegionSelect', 'toggleAnotherShipping'],
    popups: ['showPopupWindow', 'hideContentWindows', 'showWindow', 'hidePopupWindowCallback'],
    cookieBar: ['setCookieBarVisibility'],
    helpers: [
      'toFloat',
      'toLocaleFloat',
      'resolveDecimalSeparator',
      'resolveThousandSeparator',
      'resolveDecimalPlaces',
      'resolveCurrencySymbol',
      'resolveCurrencySymbolPosition',
      'formatNumber',
      'formatAsCurrency',
      'resolveMinimumAmount',
      'isTouchDevice',
      'enableUpdatePreview',
      'isApplePayAvailable',
    ],
    images: ['unveil'],
    products: [
      'splitWidgetParameters',
      'splitSingleWidgetParameter',
      'replaceImage',
      'highlightActiveThumbnail',
      'browseProducts',
      'setThumbnailsDirection',
      'setThumbnails',
      'checkThumbnailsAction',
      'checkThumbnails',
      'switchThumbnails',
      'checkDiscountFlag',
      'changeStyle',
      'setStyle',
      'returnStyle',
      'unveilProductVideoTab',
      'changeQuantity',
    ],
    ...(shoptet.config.ums_a11y_category_page ? { productSorting: ['initProductSorting'] } : []),
    menu: [
      'toggleMenu',
      'splitMenu',
      'splitHelperMenu',
      'showMenuHelper',
      'hideMenuHelper',
      'showSubmenu',
      'hideSubmenu',
      'updateMenu',
      'hideNavigation',
    ],
    phoneInput: [
      'handleFlags',
      'interconnectFlagsWithSelect',
      'hideCountriesSelect',
      'setSelectedCountry',
      'setLastPreferredCountry',
      'handleKeyCodes',
      'selectSelectedOption',
      'positionCountriesSelect',
    ],
    common: [
      'getSelectValue',
      'getCheckedInputValue',
      'createDocumentFromString',
      'serializeData',
      'serializeForm',
      'createEventNameFromFormAction',
      'fitsToParentWidth',
      'addClassToElements',
      'removeClassFromElements',
      'moveCursorToEnd',
      'throttle',
    ],
    stockAvailabilities: [
      'getDeliveryPointName',
      'getDeliveryPointAmount',
      'getStockAvailabilities',
      'setStockAvailabilities',
      'attachEventListeners',
      'mouseEnterListener',
      'mouseLeaveListener',
    ],
    cofidis: ['getElements', 'setMinPayment', 'calculator', 'handleClick', 'addCalculatorListeners'],
    tracking: [
      'getFormAction',
      'resolveUpdateAction',
      'resolveAmount',
      'resolveTrackingAction',
      'handleAction',
      'trackProducts',
      'trackFacebookPixel',
      'trackFacebookPixelApi',
      'trackGlamiPixel',
      'trackTikTokPixel',
      'trackGoogleCart',
      'trackGtagCart',
      'trackGoogleProductDetail',
      'trackGtagProductDetail',
      'updateCartDataLayer',
      'updateGoogleEcommerce',
      'handlePromoClick',
      'trackProductsFromPayload',
      'trackListings',
      'trackGtagViewItemList',
      'processTrackingContainer',
      'updateDataLayerCartInfo',
    ],
    runtime: ['resizeEnd'],
    modal: ['open', 'close', 'resize', 'shoptetResize'],
    slider: ['runSlider', 'runProductSlider'],
    watchdog: ['initWatchdog'],
    csrf: ['isTokenExpired', 'injectToken', 'validateToken'],
    csrfLink: ['getFunctionFromString', 'loadDataAttributes'],
    xyDiscounts: ['updateFlags'],
    quantityDiscounts: [
      'onVariantChange',
      'showQuantityDiscountsFlag',
      'hideQuantityDiscountsFlag',
      'showQuantityDiscountsTable',
      'hideQuantityDiscountsTable',
      'recalculateQuantityDiscountsTable',
      'getQuantityDiscountElementByAmount',
      'calculateQuantityDiscount',
      'updateQuantityDiscount',
    ],
  };

  for (var key in shoptet.scripts.libs) {
    if (shoptet.scripts.libs.hasOwnProperty(key)) {
      for (var i = 0; i < shoptet.scripts.libs[key].length; i++) {
        shoptet.scripts.monitoredFunctions.push('shoptet.' + key + '.' + shoptet.scripts.libs[key][i]);
      }
    }
  }

  shoptet.scripts.applyFunction = applyFunction;
  shoptet.scripts.handleFunctionCall = handleFunctionCall;
  shoptet.scripts.handleFunctionCallback = handleFunctionCallback;
  shoptet.scripts.setCustomCallback = setCustomCallback;
  shoptet.scripts.setCustomFunction = setCustomFunction;
  shoptet.scripts.signal = signal;
  shoptet.scripts.signalDomLoad = signalDomLoad;
  shoptet.scripts.signalDomUpdate = signalDomUpdate;
  shoptet.scripts.signalCustomEvent = signalCustomEvent;
  shoptet.scripts.signalNativeEvent = signalNativeEvent;
  shoptet.scripts.registerFunction = registerFunction;

  shoptet.scripts.customCallbacks = {};
})(shoptet);
