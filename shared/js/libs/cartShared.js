(function(shoptet) {
    /**
     *
     * Add to cart function
     */

    function addToCart(payload, silent, configUrlType) {
        if (typeof payload !== 'object') {
            shoptet.scripts.signalCustomEvent('ShoptetCartAddCartItemFailed');
            throw new Error('Invalid function arguments');
        }

        if (typeof configUrlType === 'undefined') {
            configUrl = shoptet.config.addToCartUrl;
        } else {
            configUrl = configUrlType;
        }

        var form = document.createElement('form');
        form.setAttribute('action', configUrl);

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
                configUrl + cartUrlSuffix,
                shoptet.ajax.requestTypes.post,
                shoptet.common.serializeForm(form),
                {
                    'complete': completeCallback
                },
                {
                    'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                }
            );
        } else {
            if (shoptet.abilities.about.generation !== 3) {
                ajaxAddToCart(
                    configUrl,
                    form
                );
            } else {
                shoptet.cart.ajaxSubmitForm(
                    configUrl,
                    form,
                    'functionsForCart',
                    'cart',
                    true
                );
            }
        }
    }

    function removeFromCart(payload, silent) {
        addToCart(payload, silent, shoptet.config.removeFromCartUrl);
    }

    function updateQuantityInCart(payload, silent) {
        addToCart(payload, silent, shoptet.config.updateCartUrl);
    }

    shoptet.cartShared = shoptet.cartShared || {};
    shoptet.scripts.libs.cartShared.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'cartShared');
    });

})(shoptet);
