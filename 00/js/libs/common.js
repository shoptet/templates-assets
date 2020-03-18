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
