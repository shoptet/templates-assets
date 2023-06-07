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

    function resolveAffectedPriceId(response) {
        var FEdataLayer = getShoptetDataLayer('cart') || [];
        var BEdataLayer = response.getFromPayload('cartItems') || [];
        // Change of the amount
        if (FEdataLayer.length === BEdataLayer.length) {
            for (var i=0;i<FEdataLayer.length;i++) {
                if (FEdataLayer[i].quantity !== BEdataLayer[i].quantity) {
                    return FEdataLayer[i].priceId;
                }
            }
        } 
        // Product added
        if (BEdataLayer.length > FEdataLayer.length) {
            for (var i=0;i<BEdataLayer.length;i++) {
                if (!FEdataLayer[i] || FEdataLayer[i].code !== BEdataLayer[i].code) {
                    return BEdataLayer[i].priceId;
                }
            }
        }
        // Product removed
        if (FEdataLayer.length > BEdataLayer.length) {
            for (var i=0;i<FEdataLayer.length;i++) {
                if (!BEdataLayer[i] || FEdataLayer[i].code !== BEdataLayer[i].code) {
                    return FEdataLayer[i].priceId;
                }
            }
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

        var priceId = resolveAffectedPriceId(response);

        shoptet.tracking.updateDataLayerCartInfo(response);

        if (priceId) {
            trackProducts(
                form,
                priceId,
                formAction,
                [
                    shoptet.tracking.trackGoogleCart,
                    (productData, formAction) => {
                        if (shoptet.config.googleAnalytics.isGa4Enabled) {
                            shoptet.tracking.trackGtagCart(productData, formAction, response);
                        }
                    },
                    shoptet.tracking.trackFacebookPixel,
                    shoptet.tracking.trackGlamiPixel,
                    shoptet.tracking.updateGoogleEcommerce
                ]
            );
        }
        shoptet.tracking.updateCartDataLayer(response);
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
                currency: fbPixelData.currency,
                eventId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            };

            var eventInfo = {
                eventID: data.eventId
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

            fbq(eventName, action, data, eventInfo);
        }

        shoptet.tracking.trackFacebookPixelApi(eventName, action, data);
        shoptet.scripts.signalCustomEvent('ShoptetFacebookPixelTracked');
    }

    function trackFacebookPixelApi(eventName, action, data) {
        if (!shoptet.config.fbCAPIEnabled) {
            return;
        }

        var payload = {
            eventName: eventName,
            eventId: data.eventId,
            action: action,
            data: data
        };

        var settings = {
            url: shoptet.config.fbCAPIUrl,
            type: 'POST',
            headers: {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            },
            data: {
                payload: payload
            }
        };

        if (shoptet.csrf.token !== undefined) {
            settings.data.__csrf__ = shoptet.csrf.token;
        }

        $.ajax(settings);
    }

    function trackGlamiPixel(productData, formAction) {
        if (typeof glami !== 'function') {
            return;
        }

        var trackingAction = shoptet.tracking.resolveTrackingAction(formAction, productData);

        if (trackingAction !== 'add') {
            return;
        }

        var eventName = 'track';
        var eventAction = 'AddToCart';
        var eventParams = {
            item_ids: productData.content_ids.slice(),
            value: productData.value,
            currency: productData.currency,
            consent: shoptet.consent.isAccepted(shoptet.config.cookiesConsentOptAnalytics) ? 1 : 0
        };

        glami(eventName, eventAction, eventParams);

        shoptet.scripts.signalCustomEvent('ShoptetGlamiPixelTracked');
    }

    /**
     * @deprecated #UA-drop will be removed when we stop support Universal Analytics
     * @see trackGtagProductDetail
     */
    function trackGoogleProductDetail(gaData, action) {
        if (typeof gtag === 'function') {
            gtag('event', 'view_item', {
                "send_to": shoptet.config.googleAnalytics.route.ua,
                "items": [
                    {
                        "id": gaData.content_ids[0],
                        "name": gaData.base_name,
                        "category": gaData.content_category,
                        "brand": gaData.manufacturer,
                        "variant": gaData.variant,
                        "price": gaData.valueWoVat
                    }
                ]
            });
        }

        shoptet.scripts.signalCustomEvent('ShoptetGoogleProductDetailTracked');
    }

    /**
     * @see trackGoogleProductDetail
     */
    function trackGtagProductDetail(product) {
        if (typeof gtag !== 'function') {
            return;
        }

        const eventParams = {
            send_to: shoptet.config.googleAnalytics.route.ga4,
            items: [createGtagItem(product)],
        };

        if ('valueWoVat' in product) {
            eventParams.currency = product.currency;
            eventParams.value = product.valueWoVat;
        }

        gtag('event', 'view_item', eventParams);

        shoptet.scripts.signalCustomEvent('ShoptetGoogleProductDetailTracked');
    }

    /**
     * @deprecated #UA-drop will be removed when we stop support Universal Analytics
     * @see trackGtagCart
     */
    function trackGoogleCart(gaData, formAction) {
        var action = shoptet.tracking.resolveTrackingAction(formAction, gaData);
        var eventName = '';

        switch (action) {
            case 'add':
                eventName = 'add_to_cart';
                break;
            case 'remove':
                eventName = 'remove_from_cart';
                break;
            default:
                return;
        }

        var amount = shoptet.tracking.resolveAmount(formAction, gaData);

        if (typeof gtag === 'function') {
            gtag('event', eventName, {
                "send_to": shoptet.config.googleAnalytics.route.ua,
                "items": [
                    {
                        "id": gaData.content_ids[0],
                        "name": gaData.base_name,
                        "brand": gaData.manufacturer,
                        "category": gaData.content_category,
                        "variant": gaData.variant,
                        "quantity": amount,
                        "price": gaData.valueWoVat
                    }
                ]
            });
        }

        shoptet.scripts.signalCustomEvent('ShoptetGoogleCartTracked');
    }

    function updateGoogleEcommerce(data, formAction) {
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

            // Not removing product, add an item
            if (typeof GTMshoppingCart.event === 'undefined') {
                GTMshoppingCart.event = 'addToCart';
                GTMshoppingCart.ecommerce.add = [];
                GTMshoppingCart.ecommerce.add.push(productData);
            }

            dataLayer.push(GTMshoppingCart);
        }
    }

    function handlePromoClick(el) {
        var promo = shoptet.tracking.bannersList[el.dataset.ecPromoId];

        if (promo && typeof gtag === 'function') {
            gtag('event', 'select_content', {
                "send_to": shoptet.config.googleAnalytics.route.ua,
                "promotions": [
                    {
                        "id": promo.id,
                        "name": promo.name
                    }
                ]
            });
        }
    }

    function trackProductsFromPayload(requestedDocument) {
        var trackingScript = requestedDocument.getElementById('trackingScript');
        if (trackingScript) {
            shoptet.tracking.processTrackingContainer(trackingScript.getAttribute('data-products'));
        }
    }

    function processTrackingContainer(trackingContainerJson) {
        const container = JSON.parse(trackingContainerJson);

        shoptet.tracking.bannersList ||= container.banners;
        shoptet.tracking.productsList = Object.assign(container.products, shoptet.tracking.productsList);
        shoptet.tracking.listingsList ||= new Map();

        for (const list of container.lists) {
            shoptet.tracking.listingsList.set(`${list.id}#${list.name}`, list);
        }

        shoptet.tracking.trackListings(container.lists);
    }

    /** @typedef {{ id:string, name:string, price_ids:int[], isMainListing:boolean }} TrackingList */

    /** @typedef {{ coupon:(string|null), lastItemDelta:number }} TrackingCartInfo */

    /**
     * @param {TrackingList[]} lists
     */
    function trackListings(lists) {
        if (!shoptet.config.googleAnalytics.isGa4Enabled) {
            return;
        }

        for (const list of lists) {
            const products = list.price_ids
                .map(priceId => shoptet.tracking.productsList[priceId])
                .filter(product => !!product);

            if (products.length) {
                shoptet.tracking.trackGtagViewItemList(list, products);
            }
        }
    }

    /**
     * @param {TrackingList} list
     */
    function trackGtagViewItemList(list, products) {
        if (typeof gtag !== 'function') {
            return;
        }

        const items = products.map(product => createGtagItem(product, list));

        gtag('event', 'view_item_list', {
            send_to: shoptet.config.googleAnalytics.route.ga4,
            item_list_id: list.id,
            item_list_name: list.name,
            items
        });
    }

    /**
     * @param {string} formAction
     * @see trackGoogleCart
     */
    function trackGtagCart(product, formAction, response) {
        if (typeof gtag !== 'function') {
            return;
        }

        const action = shoptet.tracking.resolveTrackingAction(formAction, product);

        if (action !== 'add') {
            return;
        }

        const eventParams = {
            send_to: shoptet.config.googleAnalytics.route.ga4,
            items: [createGtagItem(
                product,
                findProductListing(product),
                createCartInfo(formAction, response, product)
            )],
        };

        if ('valueWoVat' in product) {
            eventParams.currency = product.currency;
            eventParams.value = product.valueWoVat;
        }

        gtag('event', 'add_to_cart', eventParams);
    }

    /**
     * @param {(TrackingList|null)} [list=null]
     * @param {(TrackingCartInfo|null)} [cartInfo=null]
     */
    function createGtagItem(product, list = null, cartInfo = null) {
        const item = {
            item_id: String(product.base_id),
            item_name: product.base_name,
            quantity: 1
        };

        if (product.manufacturer) {
            item.item_brand = product.manufacturer;
        }

        if (product.variant) {
            item.item_variant = `${product.content_ids[0]}~${product.variant}`;
        }

        if ('valueWoVat' in product) {
            item.price = product.valueWoVat;
        }

        for (const [i, category] of product.category_path.entries()) {
            item[`item_category${i || ''}`] = category;
        }

        if (list) {
            item.item_list_id = list.id;
            item.item_list_name = list.name;
        }

        if (cartInfo) {
            item.quantity = cartInfo.lastItemDelta;

            if (cartInfo.coupon) {
                item.coupon = cartInfo.coupon;
            }
        }

        return item;
    }

    /**
     * @param {string} formAction
     * @returns {TrackingCartInfo}
     */
    function createCartInfo(formAction, response, updatedProduct) {
        const cartInfo = {
            coupon: null,
            lastItemDelta: shoptet.tracking.resolveAmount(formAction, updatedProduct),
        };

        const coupon = response.getFromPayload('discountCoupon');

        if (coupon && coupon.code) {
            cartInfo.coupon = coupon.code;
        }

        return cartInfo;
    }

    /**
     * @returns {(TrackingList|null)}
     */
    function findProductListing(product) {
        const { listingsList, productsList } = shoptet.tracking;

        if (!(listingsList instanceof Map) || typeof productsList !== 'object') {
            return null;
        }

        for (const list of listingsList.values()) {
            if (!list.isMainListing) {
                continue;
            }

            for (const priceId of list.price_ids) {
                if (productsList[priceId] === product) {
                    return list;
                }
            }
        }

        return null;
    }

    function updateCartDataLayer(response) {
        var cartItems = response.getFromPayload('cartItems');
        if (cartItems !== null) {
            dataLayer[0].shoptet.cart = cartItems;
            shoptet.scripts.signalCustomEvent('ShoptetDataLayerUpdated');
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
                shoptet.tracking.processTrackingContainer(trackingContainer);
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
