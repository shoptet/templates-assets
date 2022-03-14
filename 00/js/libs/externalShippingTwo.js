(function(shoptet) {
    // myShippingName - required shipping name in camelCase
    // must be identical as code of external shipping
    var myShippingName = 'externalShippingTwo';
    // create content of modal
    var modalContent = document.createElement('div');
    var chooseLink = document.createElement('a');
    var invalidateLink = document.createElement('a');
    chooseLink.innerText = 'Choose shipping method\n';
    chooseLink.setAttribute('href', '#');
    invalidateLink.innerText = 'Invalidate shipping method';
    invalidateLink.setAttribute('href', '#');
    chooseLink.addEventListener('click', function (e) {
        e.preventDefault();
        // do all your necessary stuff here
        shoptet.checkoutShared.externalShippingDetails[myShippingName].invalidate = false;
        shoptet.checkoutShared.externalShippingDetails[myShippingName].verificationCode = 'abcde12345';
        shoptet.checkoutShared.externalShippingDetails[myShippingName].expires =
            new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        shoptet.checkoutShared.externalShippingDetails[myShippingName].label.selected = 'Label of selected shipping';
        shoptet.checkoutShared.externalShippingDetails[myShippingName].price = {
            withVat: 200,
            withoutVat: 165.28,
            vat: 34.72
        };
        shoptet.modal.close();
    });
    invalidateLink.addEventListener('click', function (e) {
        e.preventDefault();
        // invalidate property set to true is required to invalidate shipping method
        // resetting of other properties is optional
        shoptet.checkoutShared.externalShippingDetails[myShippingName].invalidate = true;
        shoptet.modal.close();
    });
    modalContent.appendChild(chooseLink);
    modalContent.appendChild(invalidateLink);

    // do not ever rewrite shoptet nor shoptet.externalShipping object
    shoptet.externalShipping = shoptet.externalShipping || {};
    shoptet.externalShipping[myShippingName] = {
        modalContent: modalContent,
        onComplete: function(el) {
            // code executed after the modal is fully loaded
            // you have access to element containing your shipping method details
            console.log(el);
            // shoptet.modal.resize() has to be the last called function
            shoptet.modal.resize();
        },
        onClosed: function(el) {
            // set all necessary details about shipping
            // and fire event to update prices and labels in checkout
            var ev = new CustomEvent(
                'ShoptetExternalShippingChanged',
                {
                    detail: shoptet.checkoutShared.externalShippingDetails[myShippingName]
                }
            );
            el.dispatchEvent(ev);
        }
    };
    // parameters modalContent, onComplete and onClosed are required
    // optionally you can use also modalWidth and modalClass parameters
    // default values are shoptet.modal.config.widthMd and shoptet.modal.config.classMd

    // below are examples of events you should listen to
    // ShoptetBaseShippingInfoObtained is fired only once after page load
    // ShoptetShippingMethodUpdated and ShoptetBillingMethodUpdated are fired every time
    // when the shipping/billing method is changed/confirmed; even if it is caused by your shipping method
    document.addEventListener('ShoptetBaseShippingInfoObtained', function() {
        console.log(
            '%cdeliveryCountryId: ' + shoptet.checkoutShared.deliveryCountryId,
            'color: violet;'
        );
        console.log(
            '%cregionCountryId: ' + shoptet.checkoutShared.regionCountryId,
            'color: violet;'
        );
        console.log(
            '%ccurrencyCode: ' + shoptet.checkoutShared.currencyCode,
            'color: violet;'
        );
        // information about your shipping method, if that had been previously selected:
        console.log('%cshoptet.checkoutShared.externalShippingDetails[myShippingName]:', 'color: orangered;');
        console.log(shoptet.checkoutShared.externalShippingDetails[myShippingName]);
    });
    document.addEventListener('ShoptetShippingMethodUpdated', function() {
        console.log('%cactiveShipping:', 'color: orangered;');
        // currently the shoptet.checkoutShared.activeShipping is HTML div element containing
        // all information about shipping, you can access necessary information by query selector
        console.log(shoptet.checkoutShared.activeShipping);
        // for example, you can get also GUID of chosen shipping:
        console.log('%cactiveShipping GUID:', 'color: orangered;');
        console.log(shoptet.checkoutShared.activeShipping.querySelector('input[data-guid]').getAttribute('data-guid'));
        // shipping request code is available under shoptet.checkoutShared.shippingRequestCode
        console.log('%cshippingRequestCode:', 'color: orangered;');
        console.log(shoptet.checkoutShared.shippingRequestCode);
        // information about language, e-shop ID and currency, you can get from dataLayer:
        console.log('%cgetShoptetDataLayer():', 'color: orangered;');
        console.log(getShoptetDataLayer());
    });
    document.addEventListener('ShoptetBillingMethodUpdated', function() {
        // currently the shoptet.checkoutShared.activeBilling is HTML div element containing
        // all information about billing, you can access necessary information by query selector
        console.log('%cactiveBilling:', 'color: orangered;');
        console.log(shoptet.checkoutShared.activeBilling);
    });
})(shoptet);
