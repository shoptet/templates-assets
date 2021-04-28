/**
 * AjaxResponse layer
 */
function AjaxResponse(result, customSettings) {
    this.R200_OK = 200;
    this.R301_REDIRECT = 301;
    this.R302_REDIRECT = 302;
    this.R303_REDIRECT = 303;
    this.R500_SERVER_ERROR = 500;

    // TODO: replace this with spread syntax and drop IE11 support finally
    this.settings = $.extend({
        complete: null,
        success: null,
        failed: null,
        redirect: null
    }, customSettings);
    try {
        if (typeof result === 'object') {
            this.response = result;
        } else if (typeof result === 'string') {
            this.response = JSON.parse(result)
        }
    } catch(e) {
        this.response = {
            code: this.R200_OK,
            message: null,
            payload: result
        }
    }

    return this;
}

AjaxResponse.prototype.setCallback = function(callback, fn) {
    if (typeof fn === 'function') {
        this.settings[callback] = fn;
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
        callback = this.settings.failed;
    } else if (this.isRedirected()) {
        this.redirect();
        callback = this.settings.redirect;
    } else {
        callback = this.settings.success;
    }

    if (typeof callback === 'function') {
        callback(this.getCode(), this.getMessage(), this.getPayload());
    }

    if (typeof this.settings.complete === 'function') {
        this.settings.complete(this.getCode(), this.getMessage(), this.getPayload());
    }
};
