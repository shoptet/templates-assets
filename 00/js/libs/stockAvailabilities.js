(function(shoptet) {

    function getDeliveryPointName(stockCode) {
        return shoptet.stockAvailabilities.content.stocks[stockCode].title;
    }

    function getDeliveryPointAmount(stockCode, productId, variantCode) {
        if (shoptet.stockAvailabilities.content.products[productId].codes.hasOwnProperty(variantCode)) {
            return shoptet.stockAvailabilities.content.products[productId].codes[variantCode].stocks[stockCode]
        }
        return false;
    }

    function getStockAvailabilities(productIds) {
        if (shoptet.stockAvailabilities.content !== false) {
            return;
        }
        var successCallback = function(response) {
            shoptet.stockAvailabilities.content = response.getPayload();
            shoptet.stockAvailabilities.setStockAvailabilities();
        };

        var errorCallback = function() {
            showMessage(shoptet.messages['ajaxError'], 'error');
        }

        shoptet.ajax.makeAjaxRequest(
            shoptet.config.stockAmountUrl + '?ids[]=' + productIds.join('&ids[]='),
            shoptet.ajax.requestTypes.get,
            '',
            successCallback,
            errorCallback
        );
    }

    function setStockAvailabilities() {
        var elements = document.getElementsByClassName('product-stock-amount');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var title = [];
            for (var stock in shoptet.stockAvailabilities.content.stocks) {
                if (shoptet.stockAvailabilities.content.stocks.hasOwnProperty(stock)) {
                    var deliveryPointName = shoptet.stockAvailabilities.getDeliveryPointName(stock);
                    var deliveryPointAmount = shoptet.stockAvailabilities.getDeliveryPointAmount(
                        stock,
                        element.getAttribute('data-product-id'),
                        element.getAttribute('data-variant-code')
                    );
                    if (typeof deliveryPointAmount === 'undefined') {
                        continue;
                    } else if (deliveryPointAmount === false) {
                        deliveryPointAmount = '-';
                    } else if (typeof deliveryPointAmount === 'number') {
                        deliveryPointAmount = shoptet.helpers.toLocaleFloat(
                            deliveryPointAmount, element.getAttribute('data-decimals'), true
                        );
                    }
                    if (deliveryPointName && deliveryPointAmount !== false) {
                        title.push(deliveryPointName
                            + ' '
                            + deliveryPointAmount
                            + element.getAttribute('data-variant-unit')
                        );
                        element.setAttribute('title', title.join('<br />'));
                        fixTooltipAfterChange(element);
                    }
                }
            }
        }
    }

    function attachEventListeners() {
        shoptet.stockAvailabilities.content = false;
        var elements = document.getElementsByClassName('product-stock-amount');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.removeEventListener('mouseenter', shoptet.stockAvailabilities.mouseEnterListener);
            element.addEventListener('mouseenter', shoptet.stockAvailabilities.mouseEnterListener);
            element.removeEventListener('mouseleave', shoptet.stockAvailabilities.mouseLeaveListener);
            element.addEventListener('mouseleave', shoptet.stockAvailabilities.mouseLeaveListener);
        }
    }

    function mouseEnterListener(e) {
        e.target.classList.add('hovered');
        if (shoptet.stockAvailabilities.content === false) {
            var productIds = [];
            var elements = document.getElementsByClassName('product-stock-amount');
            for (var i = 0; i < elements.length; i++) {
                productIds.push(elements[i].getAttribute('data-product-id'));
            }
            shoptet.stockAvailabilities.getStockAvailabilities(productIds);
        }
    }

    function mouseLeaveListener(e) {
        e.target.classList.remove('hovered');
    }

    shoptet.stockAvailabilities = shoptet.stockAvailabilities || {};
    shoptet.stockAvailabilities.content = false;
    shoptet.stockAvailabilities.events = [
        'DOMContentLoaded',
        'ShoptetDOMPageContentLoaded',
        'ShoptetDOMPageMoreProductsLoaded',
        'ShoptetDOMCartContentLoaded'
    ];

    shoptet.scripts.libs.stockAvailabilities.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'stockAvailabilities');
    });

    for (var i = 0; i < shoptet.stockAvailabilities.events.length; i++) {
        document.addEventListener(
            shoptet.stockAvailabilities.events[i],
            shoptet.stockAvailabilities.attachEventListeners
        );
    }

})(shoptet);
