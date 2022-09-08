(function(shoptet) {

    function isTokenExpired() {
        let t = new Date().getTime();
        let ti = shoptet.csrf.tokenIssuedAt;
        return t - ti > shoptet.csrf.refreshTimeoutDuration;
    }

    function refreshToken() {
        clearTimeout(shoptet.csrf.refreshTimeout);
        $.getJSON(shoptet.csrf.refreshURL).done(
            function(data) {
                if (data && typeof data.token !== 'undefined') {
                    // If we have successfully received the token,
                    // refresh it and inject to the forms...
                    shoptet.csrf.refreshTimeout = setTimeout(shoptet.csrf.refreshToken, shoptet.csrf.refreshTimeoutDuration);
                    shoptet.csrf.token = data.token;
                    shoptet.csrf.tokenIssuedAt = new Date().getTime();
                    document.querySelectorAll('form').forEach(function(form) {
                        shoptet.csrf.injectToken(form);
                    });
                } else {
                    // ...if not, try to receive it again after some time
                    shoptet.csrf.refreshTimeout = setTimeout(shoptet.csrf.refreshToken, shoptet.csrfRetryTimeoutDuration);
                }
            }
        ).fail(
            function() {
                // If the request fails, try to receive the token again after some time
                shoptet.csrf.refreshTimeout = setTimeout(shoptet.csrf.refreshToken, shoptet.csrfRetryTimeoutDuration);
            }
        );
    }

    function injectToken(f) {
        let i = f.querySelector('[name=__csrf__]');
        if (i) {
            i.value = shoptet.csrf.token;
        } else {
            let i = document.createElement('input');
            i.setAttribute('type', 'hidden');
            i.setAttribute('name', '__csrf__');
            i.setAttribute('value', shoptet.csrf.token);
            f.appendChild(i);
        }
    }

    function validateToken() {
        var response;
        $.ajax({
            type: 'POST',
            url: shoptet.csrf.validateURL,
            data: {
                __csrf__: shoptet.csrf.token
            },
            async: false
        })
            .done(function() {
                response = true;
            })
            .fail(function() {
                response = false;
            });

        return response;
    }

    if (shoptet.csrf.enabled) {
        shoptet.csrf = shoptet.csrf || {};
        shoptet.scripts.libs.csrf.forEach(function(fnName) {
            var fn = eval(fnName);
            shoptet.scripts.registerFunction(fn, 'csrf');
        });
        shoptet.csrf.refreshTimeoutDuration = 60 * 60 * 1000;
        shoptet.csrf.retryTimeoutDuration = 60 * 1000;
        shoptet.csrf.refreshTimeout = setTimeout(shoptet.csrf.refreshToken, shoptet.csrf.refreshTimeoutDuration);

        // Refresh token after the period of inactivity (waking up the device from sleep, activated inactive tab...)
        var wakeUpTimeout = 1000 * 30;
        var lastTime = (new Date()).getTime();
        setInterval(function() {
            var currentTime = (new Date()).getTime();
            if (currentTime > (lastTime + wakeUpTimeout + 2000)) {
                if (shoptet.csrf.isTokenExpired()) {
                    shoptet.csrf.refreshToken();
                }
            }
            lastTime = currentTime;
        }, wakeUpTimeout);

        document.addEventListener("DOMContentLoaded", function() {
            var selector;
            if (shoptet.csrf.formsSelector === '') {
                selector = 'form';
            } else {
                selector = 'form' + '.' + shoptet.csrf.formsSelector;
            }
            document.querySelectorAll(selector).forEach(function(form) {
                shoptet.csrf.injectToken(form);
            });
        });

        if (shoptet.csrf.submitListener) {
            document.addEventListener('ShoptetDOMContentLoaded', function() {
                if (shoptet.csrf.isTokenExpired()) {
                    shoptet.csrf.refreshToken();
                }
            });
            document.addEventListener('submit', function(e) {
                if (e.target && (shoptet.csrf.formsSelector === '' || e.target.classList.contains(shoptet.csrf.formsSelector))) {
                    var prevDefaultPrevented = e.defaultPrevented;
                    e.preventDefault();
                    e.stopPropagation();
                    shoptet.csrf.injectToken(e.target);
                    if (shoptet.csrf.isTokenExpired() && !shoptet.csrf.validateToken()) {
                        var modalContent = shoptet.csrf.invalidTokenModal;
                        shoptet.modal.open({
                            html: shoptet.content.colorboxHeader + modalContent + shoptet.content.colorboxFooter,
                            className: shoptet.modal.config.classMd,
                            width: shoptet.modal.config.widthMd
                        });
                        return false;
                    }
                    if (!prevDefaultPrevented) {
                        e.target.submit();
                    }
                }
            });
        }
    }

})(shoptet);
