(function(shoptet) {

    /**
    *
    * @param {String} url
    * url = url of AJAX request
    * @param {String} type
    * type = type of request, get or post
    * @param {Object} data
    * data = serialized form data in case of post request, empty string in case of get request
    * @param {Object} callbacks
    * callbacks = object with functions to be fired after request
    */
    function makeAjaxRequest(url, type, data, callbacks) {
        // TODO: remove this control after the IE browser will be completely unsupported
        //  and use default parameter (callbacks = {})
        if (typeof callbacks === 'undefined') {
            callbacks = {}
        }

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {

                var response = new AjaxResponse(xmlhttp.response);
                var allowedCallbacks = [
                    'success',
                    'failed',
                    'redirect',
                    'complete'
                ];

                allowedCallbacks.forEach(function(callback) {
                    response.setCallback(callback, function() {
                        if (callbacks.hasOwnProperty(callback)
                            && typeof callbacks[callback] === 'function'
                        ) {
                            callbacks[callback](response);
                        }
                    });
                });

                response.processResult();
                response.showNotification();
            }
        };

        xmlhttp.open(type, url, true);
        xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        if (type === shoptet.ajax.requestTypes.post) {
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        }
        xmlhttp.send(data);
    }

    shoptet.ajax = shoptet.ajax || {};
    shoptet.ajax.makeAjaxRequest = makeAjaxRequest;

    shoptet.ajax.requestTypes = {
        get: "GET",
        post: "POST"
    };
    shoptet.ajax.pendingClass = 'ajax-pending-element';

})(shoptet);
