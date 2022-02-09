(function(shoptet) {

    function refreshCSRFToken() {
        $.getJSON('/action/refreshCSRFToken/Index/', function(data) {
            shoptet.csrf.csrfToken = data.token;

            $('form.csrf-enabled').each(function() {
                shoptet.csrf.injectCSRFToken($(this));
            });
        });
    }

    function injectCSRFToken($form) {
        var $csrfInput = $form.find('[name=__csrf__]');

        if ($csrfInput.length) {
            $csrfInput.val(shoptet.csrf.csrfToken);
        } else {
            shoptet.csrf.appendCSRFInput($form);
        }
    }

    function appendCSRFInput($form) {
        $('<input>').attr({
                type: 'hidden',
                name: '__csrf__',
                value: shoptet.csrf.csrfToken
        }).appendTo($form);
    }

    function validateCSRFToken() {
        var response;

        $.ajax({
            type: 'POST',
            url: '/action/ValidateCSRFToken/Index/',
            data: {
                __csrf__: shoptet.csrf.csrfToken
            },
            async: false
        })
        .done(function(result) {
            response = true;
        })
        .fail(function(jqXHR, textStatus, text) {
            response = false;
        });

        return response;
    };

    function submitLink(e) {
        e.stopImmediatePropagation();

        var link = e.target;

        if ($(link).hasClass('muted')) {
            return false;
        }

        if ($(link).data('confirm')) {
            if (!confirm($(link).data('confirm'))) {
                return false;
            }
        }

        var attributes = shoptet.helpers.loadDataAttributes($(link));
        var $form = $('<form>').attr({
            method: 'POST',
            action: $(link).data('url')
        });

        shoptet.csrf.injectCSRFToken($form);

        for (var key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                $('<input>').attr({
                    type: "hidden",
                    name: key,
                    value: attributes[key]
                }).appendTo($form);
            }
        }

        var precb = shoptet.helpers.getFunctionFromString($(link).data('pre-callback'));
        if (typeof precb == 'function') {
            precb(link);
        }

        if ($(link).hasClass('csrf-post-ajax-js')) {
            var settings = {
                url: $(link).data('url'),
                type: 'POST',
                data: $form.serialize(),
                dataType: 'json',
                context: link
            }
            var ajaxcb = shoptet.helpers.getFunctionFromString($(link).data('ajax-callback'));
            if (typeof ajaxcb == 'function') {
                settings.complete = ajaxcb;
            }
            $.ajax(settings);
        } else {
            // Submit doesn't work in IE & FF if the form is not attached to the DOM.
            $form.appendTo('body').submit();
        }

        return false;
    }

    document.addEventListener("DOMContentLoaded", function() {
        var forms = document.querySelectorAll('form.csrf-enabled');
        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            shoptet.csrf.appendCSRFInput($(form));
        }

        var links = document.querySelectorAll('.csrf-post-js, .csrf-post-ajax-js');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            link.addEventListener('click', function(e) {
                shoptet.csrf.submitLink(e);
            });
        }

        // Refresh CSRF token every hour.
        setInterval(shoptet.csrf.refreshCSRFToken, 3600*1000);
    });

    document.addEventListener('submit', function(e) {
        if (e.target && e.target.classList.contains('csrf-enabled')) {
            var prevDefaultPrevented = e.defaultPrevented;
            e.preventDefault();
            e.stopPropagation();
            shoptet.csrf.injectCSRFToken($(e.target));
            if (!shoptet.csrf.validateCSRFToken()) {
                var modalContent = $('.js-invalidCsrfToken').html();
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

    shoptet.csrf = shoptet.csrf || {};
    shoptet.scripts.libs.csrf.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'csrf');
    });
})(shoptet);
