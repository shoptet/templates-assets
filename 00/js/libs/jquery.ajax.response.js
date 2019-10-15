/**
 * AjaxResponse layer
 */
function AjaxResponse(result, customSettings) {
    this.R200_OK = 200;
    this.R301_REDIRECT = 301;
    this.R302_REDIRECT = 302;
    this.R303_REDIRECT = 303;
    this.R500_SERVER_ERROR = 500;

    this.settings = $.extend({
        onSuccess: null,
        onFailed: null,
        onRedirect: null
    }, customSettings);
    try {
        if (typeof result === 'object') {
            this.response = result;
        } else {
            this.response = $.parseJSON(result);
        }
    } catch(e) {
        this.response = {
            code: this.R200_OK,
            message: e.message,
            payload: result
        }
    }

    return this;
}

AjaxResponse.prototype.setOnSuccessCallback = function(fn) {
    if ($.isFunction(fn)) {
        this.settings.onSuccess = fn;
    } else {
        throw new Error('Argument is not a function');
    }

    return this;
};

AjaxResponse.prototype.setOnRedirectCallback = function(fn) {
    if ($.isFunction(fn)) {
        this.settings.onRedirect = fn;
    } else {
        throw new Error('Argument is not a function');
    }

    return this;
};

AjaxResponse.prototype.setOnFailedCallback = function(fn) {
    if ($.isFunction(fn)) {
        this.settings.onFailed = fn;
    } else {
        throw new Error('Argument is not a function');
    }

    return this;
};

AjaxResponse.prototype.isFailed = function() {
    return this.getCode() === this.R500_SERVER_ERROR;
};

AjaxResponse.prototype.isSuccess = function() {
    return this.getCode() === this.R200_OK;
};

AjaxResponse.prototype.isRedirected = function() {
    return this.getFromPayload('returnUrl') !== null
        && (
            this.getCode() === this.R301_REDIRECT
            || this.getCode() === this.R302_REDIRECT
            || this.getCode() === this.R303_REDIRECT
        );
};

AjaxResponse.prototype.redirect = function() {
    if (this.isRedirected()) {
        location.replace(this.getFromPayload('returnUrl'));
    }

    return false;
};

AjaxResponse.prototype.getCode = function() {
    return this.response.code;
};

AjaxResponse.prototype.getMessage = function() {
    return this.response.message;
};

AjaxResponse.prototype.getPayload = function() {
    return this.response.payload;
};

AjaxResponse.prototype.getFromPayload = function(key) {
    var payload = this.getPayload();
    if (payload === null) {
        return null;
    }
    if (payload.hasOwnProperty(key)) {
        return payload[key];
    }

    return null;
};

AjaxResponse.prototype.showNotification = function() {
    var message = this.getMessage();
    if (!message) {
        return false;
    }
    if (this.isFailed()) {
        showMessage(message, 'error');
    } else {
        showMessage(message, 'success');
    }

    return this;
};

AjaxResponse.prototype.processResult = function() {
    var callback;
    if (this.isFailed()) {
        callback = this.settings.onFailed;
    } else if (this.isRedirected()) {
        this.redirect();
        callback = this.settings.onRedirect;
    } else {
        callback = this.settings.onSuccess;
    }

    if ($.isFunction(callback)) {
        callback(this.getCode(), this.getMessage(), this.getPayload());
    }
};
