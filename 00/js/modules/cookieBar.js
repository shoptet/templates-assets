// @ts-check

import { maybe } from '../../../shared/js/typeAssertions';

const isHTMLElement = value => value instanceof HTMLElement;

(function (shoptet) {
  /**
   * This function hides or shows the cookie bar element.
   * @param {boolean} visible Set to true to show the cookie bar, false to hide it.
   */
  function setCookieBarVisibility(visible) {
    if (!shoptet.layout.detectResolution(shoptet.config.breakpoints.md)) {
      const cookieBarElement = maybe(
        document.querySelector('.cookies') || document.querySelector('.siteCookies'),
        isHTMLElement
      );
      if (cookieBarElement) {
        cookieBarElement.hidden = !visible;
      }
    }
  }

  shoptet.cookieBar = shoptet.cookieBar || {};
  shoptet.scripts.libs.cookieBar.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'cookieBar');
  });
})(shoptet);
