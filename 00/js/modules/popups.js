// @ts-check

import { ensure, ensureEvery, maybe } from '../../../shared/js/typeAssertions';

const isHTMLElement = value => value instanceof HTMLElement;
const isHTMLAnchorElement = value => value instanceof HTMLAnchorElement;
const isHTMLInputElement = value => value instanceof HTMLInputElement;

const CART_POPUP_WINDOW_TARGET = 'cart';
const REGISTER_POPUP_WINDOW_TARGET = 'register'; // TODO: Remove this in issue 25868 (shoptet.config.ums_a11y_login)
const NAVIGATION_POPUP_WINDOW_TARGET = 'navigation';
const SEARCH_POPUP_WINDOW_TARGET = 'search';
const LOGIN_POPUP_WINDOW_TARGET = 'login';

const CART_WINDOW_VISIBLE_CLASS = 'cart-window-visible';
const REGISTER_WINDOW_VISIBLE_CLASS = 'register-window-visible'; // TODO: Remove this in issue 25868 (shoptet.config.ums_a11y_login)
const LOGIN_WINDOW_VISIBLE_CLASS = 'login-window-visible';
const NAVIGATION_WINDOW_VISIBLE_CLASS = 'navigation-window-visible';
const SEARCH_WINDOW_VISIBLE_CLASS = 'search-window-visible';
const USER_ACTION_VISIBLE_CLASS = 'user-action-visible';
const TOP_NAVIGATION_MENU_VISIBLE_CLASS = 'top-navigation-menu-visible';
const MENU_HELPER_VISIBLE_CLASS = 'menu-helper-visible';

const MENU_HELPER_IDENTIFIER = '.menu-helper';

const REGISTER_FORM = 'register-form'; // TODO: Remove this in issue 25868 (shoptet.config.ums_a11y_login)

/** @type {HTMLElement | null} */
let lastPopupTrigger = null;

(function (shoptet) {
  const escClasses = [USER_ACTION_VISIBLE_CLASS, TOP_NAVIGATION_MENU_VISIBLE_CLASS, MENU_HELPER_VISIBLE_CLASS];
  const bodyClasses = [
    USER_ACTION_VISIBLE_CLASS,
    CART_WINDOW_VISIBLE_CLASS,
    REGISTER_WINDOW_VISIBLE_CLASS, // TODO: Remove this in issue 25868 (shoptet.config.ums_a11y_login)
    LOGIN_WINDOW_VISIBLE_CLASS,
    NAVIGATION_WINDOW_VISIBLE_CLASS,
    SEARCH_WINDOW_VISIBLE_CLASS,
    TOP_NAVIGATION_MENU_VISIBLE_CLASS,
    MENU_HELPER_VISIBLE_CLASS,
    'currency-window-visible',
    'language-window-visible',
    'submenu-visible',
    'navigation-hovered',
    'categories-window-visible',
    'search-focused',
  ];

  /**
   * Hide window displayed by user interaction.
   * @param {string} [skipElement] Selector of the HTML element to skip when hiding windows (optional).
   */
  function hideContentWindows(skipElement) {
    document.querySelectorAll('[aria-hidden]').forEach(el => {
      el.ariaHidden = 'true';
    });
    let bodyClassesToRemove = bodyClasses;
    if (!!skipElement) {
      bodyClassesToRemove = bodyClasses.filter(className => !className.includes(skipElement));
    }
    document.body.classList.remove(...bodyClassesToRemove);
    shoptet.cookieBar.setCookieBarVisibility(true);
  }

  /**
   * This function shows the window specified by the target data-attribute of the clicked element.
   * @param {HTMLElement} el Element that triggered the window.
   * @param {boolean} [focusTrapping] When set to true, function will set the focus trap to the target element (optional).
   */
  function showWindow(el, focusTrapping = false) {
    if (el.classList.contains('hide-content-windows')) {
      hideContentWindows();
      return;
    }
    const target = el.dataset.target;
    const ariaControls = el.getAttribute('aria-controls') ?? undefined;
    if (target && (!el.classList.contains('hovered') || target === NAVIGATION_POPUP_WINDOW_TARGET)) {
      showPopupWindow(target, true, ariaControls, focusTrapping);
    }
    el.classList.remove('hovered');
  }

  /**
   * Helper function for displaying/hiding user action windows on hover.
   * @param {string} target Part of selector of affected HTML element.
   * @param {boolean} show When set to true, function will only hide other windows (used for empty cart).
   * @param {string} [ariaControls] ID of the element that should be focused after the window is shown (optional).
   * @param {boolean} [focusTrapping] When set to true, function will set the focus element to the target element (optional).
   * @returns {void | false}
   */
  function showPopupWindow(target, show, ariaControls, focusTrapping = false) {
    hideContentWindows(target);
    document.querySelectorAll(`[aria-controls="${ariaControls}"]`).forEach(el => {
      el.setAttribute('aria-expanded', document.body.classList.contains(`${target}-window-visible`) ? 'false' : 'true');
    });

    if (!show) {
      return false;
    }

    if (target === CART_POPUP_WINDOW_TARGET) {
      shoptet.cookieBar.setCookieBarVisibility(false);
      if (typeof shoptet.events.cartLoaded === 'undefined') {
        shoptet.events.cartLoaded = true;
        document.body.classList.add('ajax-pending');
        const callback = () => {
          // Track FB pixel for templates with extended AJAX cart
          if (typeof shoptet.content.initiateCheckoutData !== 'undefined') {
            // @ts-ignore
            if (typeof window.fbq !== 'undefined') {
              // @ts-ignore
              window.fbq('track', 'InitiateCheckout', shoptet.content.initiateCheckoutData);
              delete shoptet.content.initiateCheckoutData;
            }
          }
          document.body.classList.remove('ajax-pending');
          if (!!ariaControls) {
            focusPopupWindow(ariaControls, focusTrapping);
          }
        };
        setTimeout(() => {
          shoptet.cart.getCartContent(false, callback);
        });
      } else {
        if (!!ariaControls) {
          focusPopupWindow(ariaControls, focusTrapping);
        }
      }
    }

    if (target === NAVIGATION_POPUP_WINDOW_TARGET) {
      if (!document.body.classList.contains(NAVIGATION_WINDOW_VISIBLE_CLASS)) {
        setTimeout(function () {
          document.dispatchEvent(new CustomEvent('menuUnveiled'));
        }, shoptet.config.animationDuration);
      }
    }

    if (document.body.classList.contains(`${target}-window-visible`)) {
      document.body.classList.remove(USER_ACTION_VISIBLE_CLASS);
    } else {
      document.body.classList.add(USER_ACTION_VISIBLE_CLASS);
    }

    document.body.classList.toggle(`${target}-window-visible`);

    if (target === SEARCH_POPUP_WINDOW_TARGET && document.body.classList.contains(SEARCH_WINDOW_VISIBLE_CLASS)) {
      setTimeout(function () {
        maybe(document.querySelector('.js-search-main .js-search-input'), isHTMLInputElement)?.focus();
      }, shoptet.config.animationDuration);
    } else {
      maybe(document.querySelector('.js-search-main .js-search-input'), isHTMLElement)?.blur();
      // @ts-expect-error Shoptet global functions are not defined yet.
      window.clearSearchFocus();
    }

    // TODO: Remove this in issue 25868 -- START (shoptet.config.ums_a11y_login)
    if (!shoptet.config.ums_a11y_login && target === REGISTER_POPUP_WINDOW_TARGET) {
      const userActionRegisterLoader = document.querySelector('.user-action-register .loader');
      if (userActionRegisterLoader) {
        const successCallback = response => {
          const requestedDocument = shoptet.common.createDocumentFromString(response.getPayload());
          const content = ensure(requestedDocument.getElementById(REGISTER_FORM), isHTMLElement);
          userActionRegisterLoader.remove();
          document.querySelector('.place-registration-here')?.insertAdjacentElement('beforeend', content);
          const additionalInformation = maybe(document.getElementById('additionalInformation'), isHTMLElement);
          if (additionalInformation && !additionalInformation.classList.contains('visible')) {
            // @ts-expect-error Shoptet global functions are not defined yet.
            window.toggleRequiredAttributes($(additionalInformation), 'remove', false);
          }
          shoptet.validator.initValidator($(ensure(document.getElementById(REGISTER_FORM), isHTMLElement)));
          // @ts-expect-error Shoptet global functions are not defined yet.
          window.initDatepickers();
          // @ts-expect-error Shoptet global functions are not defined yet.
          window.initTooltips();
          shoptet.scripts.signalDomLoad('ShoptetDOMRegisterFormLoaded');
        };
        shoptet.ajax.makeAjaxRequest(
          shoptet.config.registerUrl,
          shoptet.ajax.requestTypes.get,
          '',
          {
            success: successCallback,
          },
          {
            'X-Shoptet-XHR': 'Shoptet_Coo7ai',
          }
        );
      }
    }
    // TODO: Remove this in issue 25868 -- END (shoptet.config.ums_a11y_login)

    if (shoptet.config.ums_a11y_login) {
      // TODO: Remove this wrapper in issue 25868 -- (shoptet.config.ums_a11y_login)
      if (target === LOGIN_POPUP_WINDOW_TARGET && document.body.classList.contains(LOGIN_WINDOW_VISIBLE_CLASS)) {
        const dialog = ensure(document.getElementById('login'), isHTMLElement);
        dialog.setAttribute('aria-hidden', 'false');
        shoptet.focusManagement.focusFirst(dialog, false, false, true);

        const openerCandidate =
          lastPopupTrigger && lastPopupTrigger.dataset.target === LOGIN_POPUP_WINDOW_TARGET
            ? lastPopupTrigger
            : document.querySelector(`[data-target="${LOGIN_POPUP_WINDOW_TARGET}"]`);

        const opener = ensure(openerCandidate, isHTMLElement);

        shoptet.focusManagement.setupDialogPassThroughFocus(dialog, opener, LOGIN_POPUP_WINDOW_TARGET, () => {
          hideContentWindows();
        });
      }
    } // TODO: Remove this wrapper in issue 25868 -- (shoptet.config.ums_a11y_login)

    shoptet.images.unveil();
  }

  /**
   * This function finds visible popup window and marks it as hidden for screen readers.
   */
  function hidePopupWindowCallback() {
    const visiblePopup = maybe(document.querySelector('[aria-hidden="false"]'), isHTMLElement);
    const ariaControls = visiblePopup?.id;
    if (visiblePopup && ariaControls) {
      visiblePopup.setAttribute('aria-hidden', 'true');
      const target = maybe(document.querySelector(`[aria-controls="${ariaControls}"]`), isHTMLElement);
      if (target) {
        target.focus();
        target.ariaExpanded = 'false';
      }
    }
  }

  /**
   * This function sets the focus trap to the target element. This is necessary to prevent screen readers from reading the content outside of the target element and to prevent keyboard navigation outside of the target element.
   * @param {HTMLElement} targetElement The element to set focus trap.
   */
  function focusTrap(targetElement) {
    const elements = ensureEvery(
      Array.from(
        targetElement.querySelectorAll(
          'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled])'
        )
      ),
      isHTMLElement
    );

    const firstEl = elements[0];
    const lastEl = elements[elements.length - 1];

    setTimeout(() => {
      firstEl.focus();
    });

    targetElement.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  /** @type {NodeJS.Timeout} */
  let hidePopupWindow;

  document.querySelectorAll(`.popup-widget, .hovered-nav, ${MENU_HELPER_IDENTIFIER}`).forEach(el => {
    el.addEventListener('mouseenter', function (e) {
      clearTimeout(hidePopupWindow);
    });
  });

  ensureEvery(Array.from(document.querySelectorAll('.popup-widget, .hovered-nav')), isHTMLElement).forEach(el => {
    el.addEventListener('mouseleave', () => {
      // TODO: Remove `|| el.classList.contains('register-widget')` in issue 25868 -- (shoptet.config.ums_a11y_login)
      if (el.classList.contains('login-widget') || el.classList.contains('register-widget')) {
        if (el.querySelector('input:focus')) {
          return false;
        }
      }
      if (el.classList.contains('stay-open')) {
        return false;
      }
      hidePopupWindow = setTimeout(() => {
        document.body.classList.remove(...bodyClasses);
        shoptet.cookieBar.setCookieBarVisibility(true);
        hidePopupWindowCallback();
      }, shoptet.config.animationDuration);
      el.classList.remove('hovered');
    });
  });

  ensureEvery(Array.from(document.querySelectorAll('.toggle-window[data-hover="true"]')), isHTMLElement).forEach(el => {
    el.addEventListener('mouseenter', e => {
      e.preventDefault();
      el.classList.add('hovered');
      clearTimeout(hidePopupWindow);
      const target = el.dataset.target;
      const ariaControls = el.getAttribute('aria-controls') ?? undefined;
      if (target && !document.body.classList.contains(`${target}-window-visible`)) {
        const show = target === CART_POPUP_WINDOW_TARGET && !el.classList.contains('full') ? false : true;
        showPopupWindow(target, show, ariaControls, false);
      }
    });
    el.addEventListener('mouseleave', () => {
      if (shoptet.layout.detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
        hidePopupWindow = setTimeout(() => {
          hidePopupWindowCallback();
          document.body.classList.remove(...bodyClasses);
        }, shoptet.config.animationDuration);
      }
    });
  });

  ensureEvery(Array.from(document.querySelectorAll('.hide-content-windows')), isHTMLElement).forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      hideContentWindows();
    });
  });

  document.addEventListener('keydown', e => {
    const el = maybe(e.target, isHTMLElement);
    if (!el) {
      return;
    }
    if (e.key === 'Escape' && escClasses.some(selector => document.body.classList.contains(selector))) {
      if (document.body.classList.contains(MENU_HELPER_VISIBLE_CLASS)) {
        maybe(document.querySelector(MENU_HELPER_IDENTIFIER), isHTMLElement)?.focus();
      }
      hidePopupWindowCallback();
      document.body.classList.remove(...bodyClasses);
      const overlay = maybe(document.querySelector('.overlay'), isHTMLElement);
      overlay?.parentElement?.removeChild(overlay);
      if (document.querySelector('.msg')) {
        // @ts-expect-error Shoptet global functions are not defined yet.
        window.hideMsg();
      }
    }
  });

  /**
   * This function sets the focus to the target element and sets the aria-hidden attribute to false.
   * @param {string} ariaControls The ID of the element to set focus to.
   * @param {boolean} focusTrapping When set to true, function will set the focus trap to the target element (optional).
   */
  const focusPopupWindow = (ariaControls, focusTrapping) => {
    if (!ariaControls) {
      return;
    }
    const el = document.getElementById(ariaControls);
    if (!el) {
      return;
    }
    if (focusTrapping) {
      focusTrap(el);
    }
    setTimeout(() => {
      el.setAttribute('aria-hidden', 'false');
    });
  };

  document.addEventListener('click', e => {
    const targetEl = maybe(e.target, isHTMLElement);
    const el = maybe(targetEl?.closest('.toggle-window'), isHTMLElement);
    if (!el) return;
    lastPopupTrigger = el;

    if (!el.dataset.redirect && !el.classList.contains('languagesMenu__box')) {
      e.preventDefault();
    }
    showWindow(el, false);
  });

  document.addEventListener(
    'touchend',
    e => {
      const targetEl = maybe(e.target, isHTMLElement);
      const el = maybe(targetEl?.closest('.toggle-window'), isHTMLElement);
      if (!el) return;
      lastPopupTrigger = el;

      if (!el.classList.contains('languagesMenu__box')) {
        e.preventDefault();
      }
      showWindow(el, false);
    },
    { passive: false }
  );

  document.addEventListener('keydown', e => {
    const targetEl = maybe(e.target, isHTMLElement);
    const el = maybe(targetEl?.closest('.toggle-window'), isHTMLElement);
    if (!el) return;
    switch (e.key) {
      case 'Enter':
        if (isHTMLAnchorElement(el)) {
          const hrefAttr = el.getAttribute('href')?.trim();
          const hasRedirect = el.dataset.redirect === 'true';
          if (hasRedirect && hrefAttr && hrefAttr !== '#') {
            e.preventDefault();
            window.location.href = el.href;
            return;
          }
        }
      // fall through
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        lastPopupTrigger = el;
        showWindow(el, true);
        break;
    }
  });

  shoptet.config.bodyClasses = bodyClasses.join(' ');

  shoptet.popups = shoptet.popups || {};
  shoptet.scripts.libs.popups.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'popups');
  });
  // @ts-expect-error Shoptet object is not defined yet.
})(shoptet);
