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
        /* TODO: use shoptet.ajax from {D10170} */
        $.ajax({
            url: '/action/ProductStockAmount/?ids[]=' + productIds.join('&ids[]='),
            type: 'GET',
            success: function(responseData) {
                shoptet.stockAvailabilities.content = responseData.payload;
                shoptet.stockAvailabilities.setStockAvailabilities();
            },
            error: function() {
                showMessage(shoptet.messages['ajaxError'], 'error');
            }
        });
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

    function invalidateStockAvailabilities() {
        shoptet.stockAvailabilities.content = false;
        var event = new CustomEvent('DOMProductsLoaded');
        document.dispatchEvent(event);
    }

    function attachEventListeners() {
        var elements = document.getElementsByClassName('product-stock-amount');
        setTimeout(function() {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                element.removeEventListener('mouseenter', shoptet.stockAvailabilities.mouseEnterListener);
                element.addEventListener('mouseenter', shoptet.stockAvailabilities.mouseEnterListener);
                element.removeEventListener('mouseleave', shoptet.stockAvailabilities.mouseLeaveListener);
                element.addEventListener('mouseleave', shoptet.stockAvailabilities.mouseLeaveListener);
            }
        }, 1);
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
    shoptet.stockAvailabilities.getDeliveryPointName = getDeliveryPointName;
    shoptet.stockAvailabilities.getDeliveryPointAmount = getDeliveryPointAmount;
    shoptet.stockAvailabilities.getStockAvailabilities = getStockAvailabilities;
    shoptet.stockAvailabilities.setStockAvailabilities = setStockAvailabilities;
    shoptet.stockAvailabilities.invalidateStockAvailabilities = invalidateStockAvailabilities;
    shoptet.stockAvailabilities.attachEventListeners = attachEventListeners;
    shoptet.stockAvailabilities.mouseEnterListener = mouseEnterListener;
    shoptet.stockAvailabilities.mouseLeaveListener = mouseLeaveListener;
    shoptet.stockAvailabilities.events = ['DOMContentLoaded', 'DOMProductsLoaded'];

    for (var i = 0; i < shoptet.stockAvailabilities.events.length; i++) {
        document.addEventListener(
            shoptet.stockAvailabilities.events[i],
            shoptet.stockAvailabilities.attachEventListeners
        );
    }

})(shoptet);
