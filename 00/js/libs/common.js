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
                for (key in data) {
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
