(function(shoptet) {

    function makeAjaxRequest(url, type, data, successCallback, errorCallback, redirectCallback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                var response = new AjaxResponse(xmlhttp.response);
                response.setOnSuccessCallback(function() {
                    if (typeof successCallback === 'function') {
                        successCallback(response);
                    }
                });
                response.setOnFailedCallback(function() {
                    if (typeof errorCallback === 'function') {
                        errorCallback(response);
                    }
                });
                response.setOnRedirectCallback(function() {
                    if (typeof redirectCallback === 'function') {
                        redirectCallback(response);
                    }
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
