(function (shoptet) {
  function initSurcharges() {
    var surchargeSelector = '.surcharge-list .surcharge-parameter';
    var surcharges = document.querySelectorAll(surchargeSelector);
    var dataLayer, savePriceRatio;
    try {
      dataLayer = getShoptetDataLayer();
    } catch (error) {
      dataLayer = false;
    }
    if (dataLayer) {
      savePriceRatio = dataLayer.customer.priceRatio;
    }
    if (savePriceRatio) {
      shoptet.surcharges.customerPriceRatio = savePriceRatio;
    }
    if (surcharges.length) {
      surcharges.forEach(function (elem) {
        elem.addEventListener('change', shoptet.surcharges.updatePrices);
      });
    }
  }

  function getSurchargePrices(wrapper) {
    var activeOptions = wrapper.querySelectorAll('select.surcharge-parameter option:checked');
    shoptet.surcharges.totalSurchargeFinalPrice = 0;
    shoptet.surcharges.totalSurchargeAdditionalPrice = 0;
    activeOptions.forEach(function (activeOption) {
      var valueId = activeOption.value;
      if (valueId && !shoptet.surcharges.values.hasOwnProperty(valueId)) {
        shoptet.surcharges.values[valueId] = {};
        var finalPrice = activeOption.getAttribute('data-surcharge-final-price');
        var additionalPrice = activeOption.getAttribute('data-surcharge-additional-price');
        shoptet.surcharges.values[valueId].finalPrice = finalPrice === null ? 0 : parseFloat(finalPrice);
        shoptet.surcharges.values[valueId].additionalPrice = additionalPrice === null ? 0 : parseFloat(additionalPrice);
      }

      for (var property in shoptet.surcharges.values) {
        if (property === valueId) {
          shoptet.surcharges.totalSurchargeFinalPrice += shoptet.surcharges.values[property].finalPrice;
          shoptet.surcharges.totalSurchargeAdditionalPrice += shoptet.surcharges.values[property].additionalPrice;
        }
      }
    });
  }

  function writePrices(wrapper) {
    var finalPriceWrapper = wrapper.querySelectorAll('.price-final-holder.calculated:not(.noDisplay)');
    var additionalPriceWrapper = wrapper.querySelectorAll('.price-additional-holder.calculated:not(.noDisplay)');

    if (shoptet.surcharges.customerPriceRatio) {
      shoptet.surcharges.totalSurchargeFinalPrice *= shoptet.surcharges.customerPriceRatio;
      shoptet.surcharges.totalSurchargeAdditionalPrice *= shoptet.surcharges.customerPriceRatio;
    }

    for (var i = 0; i < finalPriceWrapper.length; i++) {
      var finalPrice = parseFloat(finalPriceWrapper.item(i).getAttribute('data-price'));
      finalPrice += shoptet.surcharges.totalSurchargeFinalPrice;
      finalPrice = Number(finalPrice).ShoptetFormatAsCurrency();
      finalPriceWrapper.item(i).querySelector('.calculated-price').textContent = finalPrice;
    }

    for (var i = 0; i < additionalPriceWrapper.length; i++) {
      var additionalPrice = parseFloat(additionalPriceWrapper.item(i).getAttribute('data-price'));
      additionalPrice += shoptet.surcharges.totalSurchargeAdditionalPrice;
      additionalPrice = Number(additionalPrice).ShoptetFormatAsCurrency();
      additionalPriceWrapper.item(i).querySelector('.calculated-price').textContent = additionalPrice;
    }
  }

  function updatePrices(e) {
    getSurchargePrices(document);
    writePrices(document);
    shoptet.scripts.signalCustomEvent('ShoptetSurchargesPriceUpdated', e.target);
  }

  shoptet.scripts.libs.surcharges = ['initSurcharges', 'updatePrices', 'getSurchargePrices', 'writePrices'];

  shoptet.surcharges = shoptet.surcharges || {};
  shoptet.scripts.libs.surcharges.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'surcharges');
  });

  shoptet.surcharges.values = {};
  shoptet.surcharges.totalSurchargeFinalPrice = 0;
  shoptet.surcharges.totalSurchargeAdditionalPrice = 0;
  shoptet.surcharges.customerPriceRatio = null;
})(shoptet);
