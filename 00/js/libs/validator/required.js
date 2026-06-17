(function (shoptet) {
  const dirtyElements = new WeakSet();
  document.addEventListener('input', function (e) {
    if (e.target.classList.contains('js-validate-required')) {
      dirtyElements.add(e.target);
    }
  });

  function validateRequiredField(el, event) {
    if (el.classList.contains('js-validation-suspended')) {
      return true;
    }

    if (shoptet.config.ums_forms_redesign && event === 'blur' && !dirtyElements.has(el)) {
      return true;
    }

    // TODO: support for other than text fields
    if (!el.value.length && !el.classList.contains('no-js-validation')) {
      shoptet.validator.addErrorMessage(el, shoptet.validatorRequired.messageType);
      shoptet.scripts.signalCustomEvent('ShoptetValidationError', el);
    } else {
      phoneWrapper = el.parentElement;
      shoptet.validator.removeErrorMessage(el, shoptet.validatorRequired.messageType);
    }
  }

  shoptet.validatorRequired = shoptet.validatorRequired || {};
  shoptet.scripts.libs.validatorRequired.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'validatorRequired');
  });
  shoptet.validatorRequired.messageType = 'validatorRequired';
  shoptet.validatorRequired.validators = {
    requiredInputs: {
      elements: document.getElementsByClassName('js-validate-required'),
      events: shoptet.config.ums_forms_redesign ? ['change', 'blur'] : ['change', 'blur', 'validatedFormSubmit'],
      validator: shoptet.validatorRequired.validateRequiredField,
      fireEvent: false,
    },
  };
  for (var i = 0; i < shoptet.validator.events.length; i++) {
    document.addEventListener(shoptet.validator.events[i], function () {
      shoptet.validator.handleValidators(shoptet.validatorRequired.validators);
    });
  }
})(shoptet);
