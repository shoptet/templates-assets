(function(shoptet) {

    function get() {
        var content = shoptet.cookie.get(shoptet.config.cookiesConsentName);
        if (!content) {
            return false;
        }
        return JSON.parse(content);
    }

    function set(agreements) {
        var consentValidity = 6 * 30; /* 6 months */
        var consentAgreements = Object.create(agreements);
        if (consentAgreements.length == 0) {
            consentAgreements.push(shoptet.config.cookiesConsentOptNone);
            consentValidity = shoptet.config.cookiesConsentRefuseDuration;
        }
        var cookieId = '';
        for (i = 0; i < 8; i++) {
            cookieId += Math.random().toString(32).substr(2, 4);
        }
        var cookieData = {
            consent: consentAgreements.join(','),
            cookieId: cookieId
        };
        if (!shoptet.cookie.create(shoptet.config.cookiesConsentName, JSON.stringify(cookieData), {days: consentValidity})) {
            return false;
        }

        $.ajax({
            type: 'POST',
            headers: {
                'X-Shoptet-XHR': 'Shoptet_Coo7ai'
            },
            url: shoptet.config.cookiesConsentUrl,
            data: cookieData,
            success: function(data) {
                if (data.code == 200) {
                    console.debug('ajax db saving ok');
                }
            }
        });

        if (shoptet.consent.acceptEvents.length > 0) {
            shoptet.consent.acceptEvents.forEach(function(fn) {
                fn(agreements);
            });
        }
        return true;
    }

    function onAccept(event) {
        if (typeof event === 'function') {
            shoptet.consent.acceptEvents.push(event);
        }
    }

    function isSet() {
        var cookie = shoptet.consent.get();
        return (cookie !== false) ? true : false;
    }

    function isAccepted(agreementType) {
        if (shoptet.config.cookiesConsentIsActive !== 1) {
            return true;
        }
        var cookie = shoptet.consent.get();
        if (!cookie.consent) {
            return false;
        }
        var allowed = cookie.consent.split(',');
        return allowed.includes(agreementType);
    }

    function openCookiesSettingModal() {
        $('html').addClass('cookies-visible');
        showSpinner();
        setTimeout(() => {
            var successCallback = function (response) {
                var requestedDocument = shoptet.common.createDocumentFromString(response.getPayload());
                var content = $(requestedDocument).find('.js-cookiesSetting');
                content.find('.js-cookiesConsentOption').each(function () {
                    if(shoptet.consent.isAccepted(this.value)) {
                        $(this).attr('checked','checked');
                    }
                });
                content = content.html();
                hideSpinner();
                shoptet.modal.open({
                    scrolling: true,
                    opacity: '.95',
                    html: shoptet.content.colorboxHeader + content + shoptet.content.colorboxFooter,
                    className: shoptet.modal.config.classMd,
                    width: shoptet.modal.config.widthMd,
                    height: shoptet.modal.config.initialHeight,
                    onComplete: function() {
                        $('#cboxContent').addClass('cookiesDialog');
                        shoptet.modal.shoptetResize();
                    },
                    onClosed: function() {
                        $('html').removeClass('cookies-visible');
                        $('#cboxContent').removeClass('cookiesDialog');
                    }
                });
                shoptet.scripts.signalDomLoad('ShoptetDOMContentLoaded');
            };
            shoptet.ajax.makeAjaxRequest(
                shoptet.config.cookiesConsentSettingsUrl,
                shoptet.ajax.requestTypes.get,
                '',
                {
                    'success': successCallback
                },
                {
                    'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                }
            );
        });
    }

    function cookiesConsentSubmit(value) {
        $('.js-siteCookies').remove();
        shoptet.modal.close();
        setTimeout(() => {
            var possibleAgreements = [
                shoptet.config.cookiesConsentOptAnalytics,
                shoptet.config.cookiesConsentOptPersonalisation
            ];
            var agreements = [];
            switch(value) {
                case 'all':
                    agreements = possibleAgreements;
                    break;
                case 'reject':
                    value = 'none'
                    break;
                case 'selection':
                    $('.js-cookiesConsentOption').each(function () {
                        if (this.checked == true && possibleAgreements.includes(this.value)) {
                            agreements.push(this.value);
                        }
                    });
                    break;
                default:
                    if (value != 'none') {
                        console.debug('unknown consent action');
                        return;
                    }
            }
            if (!shoptet.consent.set(agreements)) {
                console.debug('error setting consent cookie');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        (function() {
            'use strict';
            var CookieConsent = function(root) {
                var script_selector = 'data-cookiecategory';
                var _cookieconsent = {};

                _cookieconsent.run = function() {
                    if (shoptet.consent.isSet()) {
                        var consent = shoptet.consent.get();
                        if (consent) {
                            var accepted_categories = consent.consent.split(',');
                            var scripts = document.querySelectorAll('script[' + script_selector + ']');

                            var _loadScripts = function(scripts, index) {
                                if(index < scripts.length){
                                    var curr_script = scripts[index];
                                    var curr_script_category = curr_script.getAttribute(script_selector);
                                    if(_inArray(accepted_categories, curr_script_category) > -1){
                                        curr_script.type = 'text/javascript';
                                        curr_script.removeAttribute(script_selector);
                                        var src = curr_script.getAttribute('data-src');
                                        var fresh_script = _createNode('script');
                                        fresh_script.textContent = curr_script.innerHTML;
                                        (function(destination, source){
                                            var attr, attributes = source.attributes;
                                            var len = attributes.length;
                                            for(var i=0; i<len; i++){
                                                attr = attributes[i];
                                                destination.setAttribute(attr.nodeName, attr.nodeValue);
                                            }
                                        })(fresh_script, curr_script);
                                        src ? (fresh_script.src = src) : (src = curr_script.src);
                                        if(src){
                                            if(fresh_script.readyState) {
                                                fresh_script.onreadystatechange = function() {
                                                    if (fresh_script.readyState === "loaded" || fresh_script.readyState === "complete" ) {
                                                        fresh_script.onreadystatechange = null;
                                                        _loadScripts(scripts, ++index);
                                                    }
                                                };
                                            } else {
                                                fresh_script.onload = function(){
                                                    fresh_script.onload = null;
                                                    _loadScripts(scripts, ++index);
                                                };
                                            }
                                        }
                                        curr_script.parentNode.replaceChild(fresh_script, curr_script);
                                        if(src) return;
                                    }
                                    _loadScripts(scripts, ++index);
                                }
                            }
                            _loadScripts(scripts, 0);
                        }
                    }
                }

                var _inArray = function(arr, value) {
                    var len = arr.length;
                    for(var i=0; i<len; i++){
                        if(arr[i] === value)
                            return i;
                    }
                    return -1;
                }

                var _createNode = function(type){
                    var el = document.createElement(type);
                    if(type === 'button'){
                        el.setAttribute('type', type);
                    }
                    return el;
                }

                return _cookieconsent;
            }

            var init = 'initCookieConsent';
            if(typeof window[init] !== 'function'){
                window[init] = CookieConsent
            }
        })();
        var cc = initCookieConsent();
        cc.run();
        shoptet.consent.onAccept(function(agreements) {
            cc.run();
        });
    });

    shoptet.consent = shoptet.consent || {};
    shoptet.scripts.libs.consent.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'consent');
    });
    shoptet.consent.acceptEvents = [];

})(shoptet);
