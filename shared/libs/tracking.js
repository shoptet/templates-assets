// Functions available within global scope

/**
 * Get Shoptet data layer object
 *
 * @param {String} key
 * key = key of dataLayer object
 */
function getShoptetDataLayer(key) {
    if (dataLayer[0].shoptet) {
        if (key) {
            return dataLayer[0].shoptet[key];
        } else {
            return dataLayer[0].shoptet;
        }
    }
    return undefined;
}

/**
 * Get list of all products contained in page
 *
 * This function does not accept any arguments.
 */
function getShoptetProductsList() {
    return shoptet.tracking.productsList;
}

(function(shoptet) {
    function getFormAction(formAction) {
        if (formAction === shoptet.config.addToCartUrl) {
            return shoptet.config.addToCartUrl;
        } else if (formAction === shoptet.config.removeFromCartUrl) {
            return shoptet.config.removeFromCartUrl;
        } else if (formAction === shoptet.config.updateCartUrl) {
            return shoptet.config.updateCartUrl;
        } else if (formAction === shoptet.config.addDiscountCouponUrl) {
            return shoptet.config.addDiscountCouponUrl;
        } else if (formAction === shoptet.config.setSelectedGiftUrl) {
            return shoptet.config.setSelectedGiftUrl;
        }

        return false;
    }

    function resolveUpdateAction(data) {
        if (data.amount < data.previousAmount) {
            return 'remove';
        } else if (data.amount > 0) {
            return 'add';
        }
        return false;
    }

    function resolveAmount(formAction, data) {
        var amount = data.amount;
        if (shoptet.tracking.getFormAction(formAction) === shoptet.config.updateCartUrl) {
            amount = Math.abs(data.amount - data.previousAmount);
            if (amount === 0) {
                // All products deleted...
                amount = data.previousAmount;
            }
        }
        return amount;
    }

    function resolveTrackingAction(formAction, data) {
        if (formAction === shoptet.config.updateCartUrl) {
            return shoptet.tracking.resolveUpdateAction(data);
        } else if (formAction === shoptet.config.addToCartUrl) {
            return 'add';
        } else if (formAction === shoptet.config.removeFromCartUrl) {
            return 'remove';
        }
        return 'ViewContent';
    }

    function handleAction(form, response) {
        var formAction = shoptet.tracking.getFormAction(form.getAttribute('action'));
        if (!formAction) {
            return;
        }

        var priceId = false;
        var priceIdInput = form.querySelector('[name=priceId]');
        if (priceIdInput) {
            priceId = priceIdInput.value;
        }

        shoptet.tracking.updateDataLayerCartInfo(response);

        if (priceId) {
            trackProducts(
                form,
                priceId,
                formAction,
                [
                    shoptet.tracking.trackGoogleCart,
                    shoptet.tracking.trackFacebookPixel,
                    shoptet.tracking.updateDataLayer
                ]
            );
        }
    }

    function trackProducts(form, priceId, formAction, trackingFunctions) {
        if (typeof shoptet.tracking.productsList !== 'object') {
            return;
        }
        productData = shoptet.tracking.productsList[priceId];
        if (typeof productData !== 'object') {
            return;
        }

        var amountInput = form.querySelector('input[name=amount]'),
            amount = 1,
            previousAmount = false;

        if (amountInput) {
            amount = parseFloat(amountInput.value);
            amount = amount > 0 ? amount : 1;
            previousAmount = parseFloat(amountInput.defaultValue);
        }

        productData.amount = amount;
        productData.previousAmount = previousAmount;

        trackingFunctions.forEach(function(trackingFunction) {
            if (typeof trackingFunction === 'function') {
                trackingFunction(productData, formAction);
            }
        });
        shoptet.scripts.signalCustomEvent('ShoptetProductsTracked');
    }

    function trackFacebookPixel(fbPixelData, formAction) {
        if (typeof fbq === 'function') {
            var action = shoptet.tracking.resolveTrackingAction(formAction, fbPixelData);
            var eventName;

            var amount = shoptet.tracking.resolveAmount(formAction, fbPixelData);
            var priceValue = fbPixelData.facebookPixelVat ? fbPixelData.value : fbPixelData.valueWoVat;
            var data = {
                content_name: fbPixelData.content_name,
                content_category: fbPixelData.content_category,
                content_ids: fbPixelData.content_ids,
                content_type: 'product',
                value: parseFloat(priceValue) * amount,
                currency: fbPixelData.currency
            };

            switch (action) {
                case 'remove':
                    eventName = 'trackCustom';
                    action = 'RemoveFromCart';
                    break;
                case 'add':
                    eventName = 'track';
                    action = 'AddToCart';
                    break;
                case 'ViewContent':
                    eventName = 'track';
                    action = 'ViewContent';
                    break;
                default:
                    return;
            }

            fbq(eventName, action, data);
        }
        shoptet.scripts.signalCustomEvent('ShoptetFacebookPixelTracked');
    }

    function trackGoogleCart(gaData, formAction) {
        if (typeof ga === 'function') {
            var action = shoptet.tracking.resolveTrackingAction(formAction, gaData);
            var title;

            switch (action) {
                case 'add':
                    title = 'add to cart';
                    break;
                case 'remove':
                    title = 'remove from cart';
                    break;
                default:
                    return;
            }

            var amount = shoptet.tracking.resolveAmount(formAction, gaData);
            ga('ec:addProduct', {
                'id': gaData.content_ids[0],
                'name': gaData.base_name,
                'category': gaData.content_category,
                'brand': gaData.manufacturer,
                'variant': gaData.variant,
                'price': gaData.valueWoVat,
                'quantity': amount
            });
            ga('ec:setAction', action);
            ga('send', 'event', 'UX', 'click', title);
        }
        shoptet.scripts.signalCustomEvent('ShoptetGoogleCartTracked');
    }

    function updateDataLayer(data, formAction) {
        if (typeof dataLayer === 'object') {
            var action = shoptet.tracking.resolveTrackingAction(formAction, data);
            var amount = shoptet.tracking.resolveAmount(formAction, data);
            var itemWasHandled = false;

            var GTMshoppingCart = {
                'ecommerce': {
                  'currencyCode': data.currency,
                }
            }
            // Populate only notnull values productFieldObject
            productData = {};
            productData.id = data.content_ids[0];
            productData.name = data.base_name;
            productData.brand = data.manufacturer;
            productData.category = data.content_category;
            productData.variant = data.variant;
            productData.price = data.value;
            productData.quantity = data.amount;
            for (var key in productData) {
                if (productData[key] === null) {
                    delete productData[key];
                }
            }

            // check if item is already in cart
            dataLayer[0].shoptet.cart.forEach(function(el, i) {
                if (itemWasHandled) {
                    return;
                }
                if (el.code === data.content_ids[0]) {
                    switch (action) {
                        case 'add':
                            el.quantity = el.quantity + amount;
                            itemWasHandled = true;
                            break;
                        case 'remove':
                            if (el.quantity - amount > 0) {
                                el.quantity = el.quantity - amount;
                            } else {
                                dataLayer[0].shoptet.cart.splice(i, 1);
                            }
                            GTMshoppingCart.event = 'removeFromCart';
                            GTMshoppingCart.ecommerce.remove = [];
                            GTMshoppingCart.ecommerce.remove.push(productData);
                            itemWasHandled = true;
                            break;
                    }
                }
            });

            if (!itemWasHandled) {
                // handled item is not in cart, so we add it there
                dataLayer[0].shoptet.cart.push(
                    {
                        'code': data.content_ids[0],
                        'quantity': amount,
                        'priceWithVat': data.value
                    }
                );
            }

            // Not removing product, add an item
            if (typeof GTMshoppingCart.event === 'undefined') {
                GTMshoppingCart.event = 'addToCart';
                GTMshoppingCart.ecommerce.add = [];
                GTMshoppingCart.ecommerce.add.push(productData);
            }

            dataLayer.push(GTMshoppingCart);
        }
        shoptet.scripts.signalCustomEvent('ShoptetDataLayerUpdated');
    }

    function handlePromoClick(el) {
        var promo = shoptet.tracking.bannersList[el.dataset.ecPromoId];

        if (promo) {
            ga('ec:addPromo', promo);

            ga('ec:setAction', 'promo_click');
            ga('send', 'event', 'Internal Promotions', 'click', promo.name);
        }
    }

    function trackProductsFromPayload(requestedDocument) {
        var trackingScript = requestedDocument.getElementById('trackingScript');
        if (trackingScript) {
            var trackingProducts = JSON.parse(
                trackingScript.getAttribute('data-products')
            );
            shoptet.tracking.productsList = $.extend(trackingProducts.products, shoptet.tracking.productsList);
        }
    }

    function updateDataLayerCartInfo(response) {
        if (typeof dataLayer === 'object') {
            var leftToFreeShipping = response.getFromPayload('leftToFreeShipping');

            if(leftToFreeShipping !== null) {
                dataLayer[0].shoptet.cartInfo.leftToFreeShipping = leftToFreeShipping;
            }
            var freeShipping = response.getFromPayload('freeShipping');
            if(freeShipping !== null) {
                dataLayer[0].shoptet.cartInfo.freeShipping = freeShipping;
            }
            var discountCoupon = response.getFromPayload('discountCoupon');
            if(discountCoupon !== null) {
                dataLayer[0].shoptet.cartInfo.discountCoupon = discountCoupon;
            }

            var leftToFreeGift = response.getFromPayload('leftToFreeGift');
            if(leftToFreeGift !== null) {
                dataLayer[0].shoptet.cartInfo.leftToFreeGift = leftToFreeGift;
            }
            var freeGift = response.getFromPayload('freeGift');
            if(freeGift !== null) {
                dataLayer[0].shoptet.cartInfo.freeGift = freeGift;
            }
            var trackingContainer = response.getFromPayload('trackingContainer');
            if(trackingContainer !== null) {
                trackingContainer = JSON.parse(trackingContainer);
                shoptet.tracking.productsList = $.extend(trackingContainer.products, shoptet.tracking.productsList);
            }
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        var i;
        var imageBanners = document.querySelectorAll('a[data-ec-promo-id]');
        for (i = 0; i < imageBanners.length; i++) {
            (function(i) {
                imageBanners[i].addEventListener('click', function() {
                    shoptet.tracking.handlePromoClick(imageBanners[i]);
                });
            })(i);
        }
        var textBanners = document.querySelectorAll('span[data-ec-promo-id]');
        for (i = 0; i < textBanners.length; i++) {
            (function(i) {
                var linksInTextBanner = textBanners[i].querySelectorAll('a');
                (function(links, banner) {
                    for (var i = 0; i < links.length; i++) {
                        links[i].addEventListener('click', function() {
                            shoptet.tracking.handlePromoClick(banner);
                        });
                    }
                })(linksInTextBanner, textBanners[i]);
            })(i);
        }
    });

    shoptet.tracking = shoptet.tracking || {};
    shoptet.scripts.libs.tracking.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'tracking');
    });

})(shoptet);
