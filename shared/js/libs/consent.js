/// <reference path="./ajax/response.js" />
// @ts-check

import { ensure, ensureEvery } from '../typeAssertions';

const CONSENT_VALIDITY = 180; // 6 months

(function (shoptet) {
  const isHTMLInputElement = value => value instanceof HTMLInputElement;
  const isHTMLScriptElement = value => value instanceof HTMLScriptElement;

  /**
   * @typedef {{consent: string, cookieId: string}} CookieConsentSettings
   */

  /** @type {Array<(agreements: Array<string>) => void>} */
  const acceptEvents = [];

  /**
   * This function returns the current consent settings or false if the cookie is not set.
   * @returns {CookieConsentSettings | false}
   */
  function get() {
    const content = shoptet.cookie.get(shoptet.config.cookiesConsentName);
    if (!content) {
      return false;
    }
    return JSON.parse(content);
  }

  /**
   * This function saves the consent settings to the cookie and the backend db.
   * @param {Array<string>} agreements Array of consent agreements
   * @returns {boolean}
   */
  function set(agreements) {
    let consentValidity = CONSENT_VALIDITY;
    if (agreements.length === 0) {
      agreements.push(shoptet.config.cookiesConsentOptNone);
      consentValidity = shoptet.config.cookiesConsentRefuseDuration;
    }

    let cookieId = '';
    for (let i = 0; i < 8; i++) {
      cookieId += Math.random().toString(32).slice(2, 6);
    }

    /** @type {CookieConsentSettings} */
    const cookieData = {
      consent: agreements.join(','),
      cookieId: cookieId,
    };
    if (
      !shoptet.cookie.create(shoptet.config.cookiesConsentName, JSON.stringify(cookieData), { days: consentValidity })
    ) {
      return false;
    }

    fetch(shoptet.config.cookiesConsentUrl, {
      method: shoptet.ajax.requestTypes.post,
      headers: {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(cookieData),
    }).then(response => {
      if (response.ok) {
        console.debug('ajax db saving ok');
      }
    });

    if (acceptEvents.length > 0) {
      acceptEvents.forEach(function (fn) {
        fn(agreements);
      });
    }
    return true;
  }

  /**
   * This function registers a function to be called when the user accepts the consent.
   * @param {() => void} event Function to be registered
   */
  function onAccept(event) {
    if (typeof event === 'function') {
      acceptEvents.push(event);
    }
  }

  /**
   * This function checks if the consent is set.
   * @returns {boolean}
   */
  function isSet() {
    return !!get();
  }

  /**
   * This function checks if the given consent is accepted.
   * @param {string} agreementType
   * @returns {boolean}
   */
  function isAccepted(agreementType) {
    if (shoptet.config.cookiesConsentIsActive !== 1) {
      return true;
    }
    const cookie = get();
    if (!cookie || !cookie.consent) {
      return false;
    }
    const allowed = cookie.consent.split(',');
    return allowed.includes(agreementType);
  }

  /**
   * This function opens the consent settings modal.
   */
  function openCookiesSettingModal() {
    document.documentElement.classList.add('cookies-visible');
    window.showSpinner();
    setTimeout(() => {
      /** @type {(response: AjaxResponse) => void} */
      const successCallback = response => {
        const requestedDocument = shoptet.common.createDocumentFromString(response.getPayload());
        let content = requestedDocument.querySelector('.js-cookiesSetting');
        content.querySelectorAll('.js-cookiesConsentOption').forEach(el => {
          const input = ensure(el, isHTMLInputElement);
          if (isAccepted(input.value)) {
            input.setAttribute('checked', 'checked');
          }
        });
        content = content.innerHTML;
        window.hideSpinner();
        shoptet.modal.open({
          opacity: '.8',
          html: shoptet.content.colorboxHeader + content + shoptet.content.colorboxFooter,
          className: shoptet.modal.config.classMd,
          width: shoptet.modal.config.widthMd,
          onComplete: () => {
            document.querySelector('#cboxContent')?.classList.add('cookiesDialog');
            shoptet.modal.shoptetResize();
          },
          onClosed: () => {
            document.documentElement.classList.remove('cookies-visible');
            document.querySelector('#cboxContent')?.classList.remove('cookiesDialog');
          },
        });
        shoptet.scripts.signalDomLoad('ShoptetDOMContentLoaded');
      };
      shoptet.ajax.makeAjaxRequest(
        shoptet.config.cookiesConsentSettingsUrl,
        shoptet.ajax.requestTypes.get,
        '',
        {
          success: successCallback,
        },
        {
          'X-Shoptet-XHR': 'Shoptet_Coo7ai',
        }
      );
    });
  }

  /**
   * This function submits the consent settings form.
   * @param {'all' | 'reject' | 'selection' | 'none'} value Value of the form
   */
  function cookiesConsentSubmit(value) {
    document.querySelector('.js-siteCookies')?.remove();
    shoptet.modal.close();
    setTimeout(() => {
      const possibleAgreements = [
        shoptet.config.cookiesConsentOptAnalytics,
        shoptet.config.cookiesConsentOptPersonalisation,
      ];
      /** @type {Array<string>} */
      const agreements = [];
      switch (value) {
        case 'all':
          agreements.push(...possibleAgreements);
          break;
        case 'reject':
          value = 'none';
          break;
        case 'selection':
          document.querySelectorAll('.js-cookiesConsentOption').forEach(el => {
            const input = ensure(el, isHTMLInputElement);
            if (input.checked === true && possibleAgreements.includes(input.value)) {
              agreements.push(input.value);
            }
          });
          break;
        default:
          if (value !== 'none') {
            console.debug('unknown consent action');
            return;
          }
      }
      if (!set(agreements)) {
        console.debug('error setting consent cookie');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    (() => {
      'use strict';
      const CookieConsent = function () {
        const script_selector = 'data-cookiecategory';
        const _cookieconsent = {};

        _cookieconsent.run = () => {
          if (isSet()) {
            const consent = get();
            if (consent) {
              const accepted_categories = consent.consent.split(',');
              const scripts = ensureEvery(
                Array.from(document.querySelectorAll('script[' + script_selector + ']')),
                isHTMLScriptElement
              );

              /** @param {Array<HTMLScriptElement>} scripts, @param {number} index */
              const _loadScripts = (scripts, index) => {
                if (index < scripts.length) {
                  const curr_script = scripts[index];
                  const curr_script_category = curr_script.getAttribute(script_selector);
                  if (curr_script_category && accepted_categories.includes(curr_script_category)) {
                    curr_script.type = 'text/javascript';
                    curr_script.removeAttribute(script_selector);
                    let src = curr_script.getAttribute('data-src');
                    const fresh_script = document.createElement('script');
                    fresh_script.textContent = curr_script.innerHTML;
                    ((destination, source) => {
                      let attr,
                        attributes = source.attributes;
                      const len = attributes.length;
                      for (let i = 0; i < len; i++) {
                        attr = attributes[i];
                        if (attr.nodeValue) {
                          destination.setAttribute(attr.nodeName, attr.nodeValue);
                        }
                      }
                    })(fresh_script, curr_script);
                    src ? (fresh_script.src = src) : (src = curr_script.src);
                    if (src) {
                      fresh_script.onload = () => {
                        fresh_script.onload = null;
                        _loadScripts(scripts, ++index);
                      };
                    }
                    curr_script.parentNode?.replaceChild(fresh_script, curr_script);
                    if (src) return;
                  }
                  _loadScripts(scripts, ++index);
                }
              };
              if (scripts.length > 0) {
                _loadScripts(scripts, 0);
              }
            }
          }
        };

        return _cookieconsent;
      };

      if (typeof window.initCookieConsent !== 'function') {
        window.initCookieConsent = CookieConsent;
      }
    })();
    const cc = window.initCookieConsent();
    cc.run();
    onAccept(() => {
      cc.run();
    });
  });

  shoptet.consent = shoptet.consent || {};
  shoptet.scripts.libs.consent.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'consent');
  });
  shoptet.consent.acceptEvents = acceptEvents;
})(shoptet);
