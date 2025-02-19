// @ts-check

/**
 * Settings type
 * @typedef {Object} AjaxResponseSettings
 * @property {(response: AjaxResponse) => void} [success] The success callback (optional)
 * @property {(response: AjaxResponse) => void} [failed] The failed callback (optional)
 * @property {(response: AjaxResponse) => void} [redirect] The redirect callback (optional)
 * @property {(response: AjaxResponse) => void} [complete] The complete callback (optional)
 */

/**
 * Ajax response type
 * @class
 * @param {string | object} result The response result
 * @param {Record<keyof AjaxResponseSettings, (() => void) | null>} [customSettings] The custom settings for the response (optional)
 * @returns {AjaxResponse} The response object
 */
function AjaxResponse(result, customSettings) {
  /** @type {200} The code for OK response */
  this.R200_OK = 200;
  /** @type {301} The code for 301 redirect */
  this.R301_REDIRECT = 301;
  /** @type {302} The code for 302 redirect */
  this.R302_REDIRECT = 302;
  /** @type {303} The code for 303 redirect */
  this.R303_REDIRECT = 303;
  /** @type {500} The code for server error */
  this.R500_SERVER_ERROR = 500;

  /** @type {{code: number, message: string | null, messages: Array<string>, payload: unknown}} */
  this.response = {
    code: this.R200_OK,
    message: null,
    messages: [],
    payload: result,
  };

  /** @type {Record<keyof AjaxResponseSettings, (() => void) | null>} The settings for the response */
  this.settings = {
    complete: null,
    success: null,
    failed: null,
    redirect: null,
    ...customSettings,
  };

  if (typeof result === 'object') {
    this.response = result;
  } else if (typeof result === 'string') {
    try {
      this.response = JSON.parse(result);
    } catch (e) {}
  }

  return this;
}

/** @type {(callback: keyof AjaxResponseSettings, fn: () => void) => AjaxResponse} The function to set the callback */
AjaxResponse.prototype.setCallback = function (callback, fn) {
  if (typeof fn === 'function') {
    this.settings[callback] = fn;
  } else {
    throw new Error('Argument is not a function');
  }

  return this;
};

/** @type {() => boolean} The function to check if the response is failed */
AjaxResponse.prototype.isFailed = function () {
  return this.getCode() === this.R500_SERVER_ERROR;
};

/** @type {() => boolean} The function to check if the response is successful */
AjaxResponse.prototype.isSuccess = function () {
  return this.getCode() === this.R200_OK;
};

/** @type {() => boolean} The function to check if the response is redirected */
AjaxResponse.prototype.isRedirected = function () {
  return (
    typeof this.getFromPayload('returnUrl') === 'string' &&
    (this.getCode() === this.R301_REDIRECT ||
      this.getCode() === this.R302_REDIRECT ||
      this.getCode() === this.R303_REDIRECT)
  );
};

/** @type {() => void | false} The function to redirect */
AjaxResponse.prototype.redirect = function () {
  if (this.isRedirected()) {
    location.replace(String(this.getFromPayload('returnUrl')));
  }

  return false;
};

/** @type {() => number} The function to get the response code */
AjaxResponse.prototype.getCode = function () {
  return this.response.code;
};

/** @type {() => string | null} The function to get the response message */
AjaxResponse.prototype.getMessage = function () {
  return this.response.message;
};

/** @type {() => Array<string>} The function to get the response messages */
AjaxResponse.prototype.getMessages = function () {
  return this.response.messages;
};

/** @type {() => unknown} The function to get the response payload */
AjaxResponse.prototype.getPayload = function () {
  return this.response.payload;
};

/** @type {(key: string) => unknown | null} The function to get the response payload by key */
AjaxResponse.prototype.getFromPayload = function (key) {
  const payload = this.getPayload();
  if (payload === null) {
    return null;
  }
  if (payload?.hasOwnProperty(key)) {
    return payload[key];
  }

  return null;
};

/** @type {() => false | AjaxResponse} The function to show the notification */
AjaxResponse.prototype.showNotification = function () {
  const message = this.getMessage();
  if (!message) {
    return false;
  }
  if (this.isFailed()) {
    window.showMessage(message, 'error');
  } else {
    window.showMessage(message, 'success');
  }

  return this;
};

/** @type {() => void} processResult - The function to process the result */
AjaxResponse.prototype.processResult = function () {
  /** @type {(() => void)?} callback */
  let callback;
  if (this.isFailed()) {
    callback = this.settings.failed;
  } else if (this.isRedirected()) {
    this.redirect();
    callback = this.settings.redirect;
  } else {
    callback = this.settings.success;
  }

  if (typeof callback === 'function') {
    callback();
  }

  if (typeof this.settings.complete === 'function') {
    this.settings.complete();
  }
};
(function (shoptet) {
  shoptet.ajax = shoptet.ajax || {};
  shoptet.ajax.AjaxResponse = AjaxResponse;
})(shoptet);

window.AjaxResponse = function (...args) {
  shoptet.dev.deprecated('2025-12-31', 'AjaxResponse()', 'shoptet.ajax.AjaxResponse()');
  if (this === window) {
    return this;
  }
  return new AjaxResponse(...args);
};
