(function(shoptet) {

    function getFunctionFromString(string) {
        if (typeof string === 'undefined') {
            return;
        }
        var scope = window;
        var scopeSplit = string.split('.');
        for (i = 0; i < scopeSplit.length - 1; i++) {
            scope = scope[scopeSplit[i]];
            if (scope === undefined) {
                return;
            }
        }
        return scope[scopeSplit[scopeSplit.length - 1]];
    }

    function loadDataAttributes($elem) {
        var names = $elem.data('names').toString().split(',');
        var values = $elem.data('values').toString().split(',');
        var attributes = {};
        for (i = 0, cnt = names.length; i < cnt; i++) {
            attributes[names[i]] = values[i];
        }
        return attributes;
    }

    shoptet.csrfLink = shoptet.csrfLink || {};
    shoptet.scripts.libs.csrfLink.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'csrfLink');
    });

    let elements = document.querySelectorAll('.csrf-post-js, .csrf-post-ajax-js');
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', function(e) {
            e.stopImmediatePropagation();
            if ($(this).hasClass('muted')) {
                return false;
            }
            if ($(this).attr('data-confirm')) {
                if (!confirm($(this).attr('data-confirm'))) {
                    return false;
                }
            }
            var attributes = shoptet.csrfLink.loadDataAttributes($(this));
            var $form = $('<form>').attr({
                method: 'POST',
                action: $(this).data('url')
            });
            if (shoptet.csrf.enabled) {
                shoptet.csrf.injectToken($form[0]);
            }
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    $('<input>').attr({
                        type: "hidden",
                        name: key,
                        value: attributes[key]
                    }).appendTo($form);
                }
            }
            var precb = shoptet.csrfLink.getFunctionFromString($(this).data('pre-callback'));
            if (typeof precb === 'function') {
                precb(this);
            }
            if ($(this).hasClass('csrf-post-ajax-js')) {
                var settings = {
                    url: $(this).data('url'),
                    type: 'POST',
                    data: $form.serialize(),
                    dataType: 'json',
                    context: this
                }
                var ajaxcb = shoptet.csrfLink.getFunctionFromString($(this).data('ajax-callback'));
                if (typeof ajaxcb === 'function') {
                    settings.complete = ajaxcb;
                }
                $.ajax(settings);
            } else {
                /* TODO: Probably obsolete, check it!
                Submit doesn't work in IE & FF if the form is not attached to the DOM. */
                $form.appendTo('body').submit();
            }
            return false;
        });
    }

})(shoptet);
