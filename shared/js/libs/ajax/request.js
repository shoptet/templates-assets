/// <reference path="./response.js" />
// @ts-check

import { preserveEditorPreviewUrl } from '../themeEditor/lib';

(function (shoptet) {
  const requestTypes = Object.freeze({
    get: 'GET',
    post: 'POST',
  });

  /**
   * Sends an AJAX request to the specified URL with the given parameters and handles the response.
   * This function creates an asynchronous XMLHttpRequest to communicate with a server. It supports
   * both GET and POST requests and allows for flexible handling of the response through callback functions.
   * @param {string} url url of AJAX request
   * @param {typeof requestTypes[keyof requestTypes]} type type of request, GET or POST
   * @param {string} data serialized form data in case of post request, empty string in case of get request
   * @param {AjaxResponseSettings} callbacks object with functions to be fired after request
   * @param {Record<string, string>} [header] identification of request (optional)
   * @returns {Promise<AjaxResponse>} Promise object represents the response of the request
   */
  function makeAjaxRequest(url, type, data, callbacks = {}, header = {}) {
    return new Promise(function (resolve, reject) {
      const xmlhttp = new XMLHttpRequest();
      const requestUrl = preserveEditorPreviewUrl(url);

      xmlhttp.open(type, requestUrl, true);

      if (header && header.hasOwnProperty('X-Shoptet-XHR')) {
        if (header['X-Shoptet-XHR'] === 'Shoptet_Coo7ai') {
          xmlhttp.setRequestHeader('X-Shoptet-XHR', 'Shoptet_Coo7ai');
        }
      }

      xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      if (header && header.hasOwnProperty('Content-Type')) {
        xmlhttp.setRequestHeader('Content-Type', header['Content-Type']);
      } else if (type === requestTypes.post) {
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      }

      xmlhttp.onload = function () {
        if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
          /** @type {AjaxResponse} */
          const response = new shoptet.ajax.AjaxResponse(xmlhttp.response);
          /** @type {Array<keyof AjaxResponseSettings>} */
          const allowedCallbacks = ['success', 'failed', 'redirect', 'complete'];
          allowedCallbacks.forEach(function (callback) {
            response.setCallback(callback, function () {
              if (callbacks.hasOwnProperty(callback) && typeof callbacks[callback] === 'function') {
                callbacks[callback]?.(response);
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
          reject({
            status: this.status,
            statusText: this.statusText,
          });
        }
      };
      xmlhttp.onerror = function () {
        reject({
          status: this.status,
          statusText: this.statusText,
        });
      };
      xmlhttp.send(shoptet.common.serializeData(data));
    });
  }

  shoptet.ajax = shoptet.ajax || {};
  shoptet.ajax.makeAjaxRequest = makeAjaxRequest;
  shoptet.ajax.requestTypes = requestTypes;
  shoptet.ajax.pendingClass = 'ajax-pending-element';
})(shoptet);
