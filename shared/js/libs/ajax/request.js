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
    * @param {Object} header
    * header = identification of request, only for internal use
    */
    function makeAjaxRequest(url, type, data, callbacks, header) {

        return new Promise(function(resolve, reject) {
            // TODO: remove this control after the IE browser will be completely unsupported
            //  and use default parameter (callbacks = {})
            if (typeof callbacks === 'undefined') {
                callbacks = {}
            }
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open(type, url, true);

            if (header && header.hasOwnProperty('X-Shoptet-XHR')) {
                if (header['X-Shoptet-XHR'] === 'Shoptet_Coo7ai') {
                    xmlhttp.setRequestHeader('X-Shoptet-XHR', 'Shoptet_Coo7ai');
                }
            }

            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");

            if(header && header.hasOwnProperty('Content-Type')) {
                xmlhttp.setRequestHeader('Content-Type', header['Content-Type']);
            } else if (type === shoptet.ajax.requestTypes.post) {
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            }

            xmlhttp.onload = function() {
                if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
                    var response = new shoptet.ajax.AjaxResponse(xmlhttp.response);
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
                    // TODO: postpone the notification in the case of the requests chaining,
                    // TODO: for example in the cart between the initial action and the final
                    // TODO: loading of the actual cart.
                    response.showNotification();
                    resolve(response);
                } else {
                    reject(
                        {
                            status: this.status,
                            statusText: this.statusText
                        }
                    );
                }
            }
            xmlhttp.onerror = function() {
                reject({
                  status: this.status,
                  statusText: this.statusText
                });
            };
            xmlhttp.send(shoptet.common.serializeData(data));
        });
    }

    shoptet.ajax = shoptet.ajax || {};
    shoptet.ajax.makeAjaxRequest = makeAjaxRequest;

    shoptet.ajax.requestTypes = {
        get: "GET",
        post: "POST"
    };
    shoptet.ajax.pendingClass = 'ajax-pending-element';

})(shoptet);
