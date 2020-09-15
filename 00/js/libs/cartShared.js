(function(shoptet) {
    /**
     *
     * Add to cart function
     */

    function addToCart(payload, silent) {
        if (typeof payload !== 'object') {
            shoptet.scripts.signalCustomEvent('ShoptetCartAddCartItemFailed');
            throw new Error ('Invalid function arguments');
        }

        var form = document.createElement('form');
        form.setAttribute('action', shoptet.config.addToCartUrl);

        for (var key in payload) {
            if (typeof payload[key] === 'object') {
                for (var j in payload[key]) {
                    var input = document.createElement('input');
                    input.setAttribute('name', key + '[' + j + ']');
                    input.setAttribute('value', payload[key][j]);
                    form.appendChild(input);
                }
            } else {
                var input = document.createElement('input');
                input.setAttribute('name', key);
                input.setAttribute('value', payload[key]);
                form.appendChild(input);
            }
        }

        if (typeof silent !== 'undefined' && silent) {
            var completeCallback = function(response) {
                console.log(response.response);
            };
            cartUrlSuffix = '?simple_ajax_cart=1';
            shoptet.ajax.makeAjaxRequest(
                shoptet.config.addToCartUrl + cartUrlSuffix,
                shoptet.ajax.requestTypes.post,
                shoptet.common.serializeForm(form),
                {
                    'complete': completeCallback
                }
            );
        } else {
            if(typeof shoptet.cart.ajaxSubmitForm === 'undefined') {
                ajaxAddToCart(
                    shoptet.config.addToCartUrl,
                    form
                );
            } else {
                shoptet.cart.ajaxSubmitForm(
                    shoptet.config.addToCartUrl,
                    form,
                    'functionsForCart',
                    'cart',
                    true
                );
            }
        }
    }

    shoptet.cartShared = shoptet.cartShared || {};
    shoptet.scripts.libs.cartShared.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'cartShared');
    });

})(shoptet);
