(function(shoptet) {

    function getSelectValue(select) {
        return select.value;
    }

    function getCheckedInputValue(containingElement) {
        var inputs = containingElement.querySelectorAll('input[type="radio"]');
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].checked) {
                return inputs[i].value;
            }
        }
        return false;
    }

    function createDocumentFromString(string) {
        return new DOMParser().parseFromString(string, "text/html");
    }

    function serializeData(data) {
        if (typeof data === "object") {
            try {
                var params = [];
                for (const key in data) {
                    params.push(key + '=' + data[key]);
                }
                return params.join('&');
            } catch(e) {
                console.error(e);
                return data;
            }
        }
        return data;
    }

    /**
     * Create object from form through FormData object
     *  Ready for request consume FormData Directly
     */
    function serializeForm(form) {
        var fallBack = form;
        if (typeof form === 'undefined' || form === null) {
            return form;
        }
        if (form instanceof jQuery) {
            form = form.get(0);
        }
        if (form instanceof HTMLFormElement) {
            form = new FormData(form);
        }
        if (form instanceof FormData) {
            var object = {};
            try {
                var formDataEntries = form.entries(), formDataEntry = formDataEntries.next(), pair;
                while (!formDataEntry.done) {
                    pair = formDataEntry.value;
                    object[pair[0]] = encodeURIComponent(pair[1]);
                    formDataEntry = formDataEntries.next();
                }
                return serializeData(object);
            } catch (e) {
                console.error(e);
                // Polyfill doesn't work or something wrong => jQuery fallBack
                form = $(fallBack).serialize();
                return form;
            }
        } else {
            return form;
        }
    }

    /**
     * Create name for custom event depending on form action
     *
     * @param {String} action
     * action = action attribute of submitted form
     */
    function createEventNameFromFormAction(action) {
        var actionName = action.replace(shoptet.config.cartActionUrl, '');
        actionName = actionName.replace(/\//gi, '');
        actionName = 'ShoptetCart' + actionName.charAt(0).toUpperCase() + actionName.slice(1);
        return actionName;
    }

    /**
     * Check if element width fits into its closest positioned ancestor element (offset parent)
     *
     * @param {Element} el
     * el = element
     * @param {Number} paddingRight
     * paddingRight = optional - width reserved on offset parent right side in pixels
     */
    function fitsToParentWidth(el, paddingRight) {
        var reserved = typeof paddingRight === 'undefined' ? 0 : paddingRight;
        var parent = el.offsetParent;
        if (!parent) {
            return true;
        }
        if (el.offsetLeft + el.offsetWidth > parent.offsetWidth - reserved) {
            return false;
        }
        return true;
    }

    function addClassToElements(elements, className) {
        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.add(className);
        }
    }

    function removeClassFromElements(elements, className) {
        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove(className);
        }
    }

    /**
     * Move cursor to the end of input or textarea
     */
    function moveCursorToEnd(el) {
        if (typeof el.selectionStart == "number") {
            el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange != "undefined") {
            el.focus();
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
        }
    }

    /**
     * See https://github.com/jashkenas/underscore/blob/master/modules/throttle.js
     * Returns a function, that, when invoked, will only be triggered at most once
     * during a given window of time. Normally, the throttled function will run
     * as much as it can, without ever going more than once per `wait` duration;
     * but if you'd like to disable the execution on the leading edge, pass
     * `{leading: false}`. To disable execution on the trailing edge, ditto.
     */
    function throttle(func, wait, options) {
        var now =
            Date.now ||
            function () {
                return new Date().getTime();
            };

        var timeout, context, args, result;
        var previous = 0;
        if (!options) options = {};

        var later = function () {
            previous = options.leading === false ? 0 : now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };

        var throttled = function () {
            var _now = now();
            if (!previous && options.leading === false) previous = _now;
            var remaining = wait - (_now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = _now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };

        throttled.cancel = function () {
            clearTimeout(timeout);
            previous = 0;
            timeout = context = args = null;
        };

        return throttled;
    }

    shoptet.common = shoptet.common || {};
    shoptet.scripts.libs.common.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'common');
    });
    shoptet.common.keyCodes = {
        backspace: 8,
        enter: 13,
        escape: 27
    };
})(shoptet);
