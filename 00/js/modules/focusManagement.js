// @ts-check

import { ensure, maybe } from '../../../shared/js/typeAssertions';

const isHTMLElement = value => value instanceof HTMLElement;
const isHTMLDialogElement = value => value instanceof HTMLDialogElement;

(function (shoptet) {
  /** Selector for focusable elements */
  const FOCUSABLE_SELECTOR = [
    'a[href]:not([tabindex="-1"])',
    'area[href]:not([tabindex="-1"])',
    'button:not([tabindex="-1"])',
    'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  /**
   * Finds the first focusable element within the given wrapper.
   * @param {HTMLElement} wrapper
   * @returns {HTMLElement|null}
   */
  function findFirstFocusable(wrapper) {
    if (!wrapper) return null;
    const el = maybe(wrapper.querySelector(FOCUSABLE_SELECTOR), isHTMLElement);
    if (el) return el;
  }

  /**
   * Finds the last focusable element within the given wrapper.
   * @param {HTMLElement} wrapper
   * @returns {HTMLElement|null}
   */
  function findLastFocusable(wrapper) {
    if (!wrapper) return null;
    const list = wrapper.querySelectorAll(FOCUSABLE_SELECTOR);
    for (let i = list.length - 1; i >= 0; i--) {
      const el = maybe(list[i], isHTMLElement);
      if (el) return el;
    }
    return null;
  }

  /**
   * Focuses either the root element or (if tryInside=true) the first focusable
   * descendant inside it. If the target element is not naturally focusable
   * (tabIndex < 0), a temporary tabindex="-1" is added and removed on blur.
   * Dialog mode:
   * - order: [autofocus] → aria-labelledby → first focusable → dialog
   * - never scrolls the page
   * @param {HTMLElement} root Element to focus or search within.
   * @param {boolean} [tryInside=false] If true, focus the first focusable descendant of `root`.
   * @param {boolean} [scrollToEl=false] If true, scroll to the target before focusing (smooth).
   * @param {boolean} [isDialog=false]   If true (modal dialog)
   * @returns {void}
   */
  function focusFirst(root, tryInside = false, scrollToEl = false, isDialog = false) {
    ensure(root, isHTMLElement);

    /** @type {HTMLElement|null} */
    let target = null;
    let canForceTabindex = true;

    if (isDialog) {
      const autofocus = root.querySelector('[autofocus]');
      if (autofocus instanceof HTMLElement && autofocus.matches(FOCUSABLE_SELECTOR)) {
        target = autofocus;
      }
      if (!target) {
        const labelledBy = root.getAttribute('aria-labelledby');
        if (labelledBy) {
          const heading = document.getElementById(labelledBy);
          if (heading instanceof HTMLElement) {
            target = heading;
          }
        }
      }
      if (!target) {
        target = findFirstFocusable(root);
      }
      if (!target) {
        target = root;
        canForceTabindex = false;
      }
    } else {
      target = tryInside ? findFirstFocusable(root) : null;
      if (!target) target = root;
    }

    let addedTabindex = false;
    if (target.tabIndex < 0 && canForceTabindex) {
      target.setAttribute('tabindex', '-1');
      addedTabindex = true;
    }

    const shouldScroll = scrollToEl && !isDialog;

    requestAnimationFrame(() => {
      if (shouldScroll) {
        shoptet.scroll.scrollToEl(target);
        target.focus({ preventScroll: true });
      } else {
        target.focus();
      }

      if (addedTabindex) {
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
  }

  /**
   * Focus-trap
   * @param {HTMLElement} root
   * @param {AbortSignal} signal
   */
  function setupFocusTrap(root, signal) {
    /** @param {KeyboardEvent} e */
    const onKeyDown = e => {
      if (e.key !== 'Tab') return;

      const first = findFirstFocusable(root);
      const last = findLastFocusable(root);
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };

    root.addEventListener('keydown', onKeyDown, { signal });
  }

  /**
   * Keyboard handling for dialog exit and opener interaction.
   *
   * - Tab on last item: close dialog after focus moves out.
   * - Shift+Tab on first item: move focus to opener.
   * - Tab on opener (while open): move focus into dialog.
   * - Shift+Tab on opener (while open): close dialog after focus moves out.
   *
   * @param {HTMLElement} root Popover/dialog container element.
   * @param {HTMLElement} opener Trigger element that opened the dialog.
   * @param {string} windowTarget Popup target name (e.g. "login").
   * @param {() => void} onClose Function that closes the dialog.
   */
  function setupDialogPassThroughFocus(root, opener, windowTarget, onClose) {
    ensure(root, isHTMLElement);
    opener = ensure(opener, isHTMLElement);

    if (root.dataset.dialogExitInit === 'true') {
      return;
    }

    const openClass = `${windowTarget}-window-visible`;

    root.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;

      const first = findFirstFocusable(root);
      const last = findLastFocusable(root);
      if (!first || !last) return;

      const active = /** @type {HTMLElement|null} */ (document.activeElement);
      if (!active) return;

      const isForwardFromLast = !e.shiftKey && active === last;
      const isBackwardFromFirst = e.shiftKey && active === first;

      if (isForwardFromLast) {
        const openerEl = opener;
        setTimeout(() => {
          onClose();
          openerEl.setAttribute('aria-expanded', 'false');
        });
        return;
      }

      if (isBackwardFromFirst) {
        e.preventDefault();
        opener.focus();
      }
    });

    opener.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;

      const isDialogOpen = document.body.classList.contains(openClass);
      if (!isDialogOpen) return;

      if (!e.shiftKey) {
        e.preventDefault();
        focusFirst(root, true, false, true);
      } else {
        const openerEl = opener;
        setTimeout(() => {
          onClose();
          openerEl.setAttribute('aria-expanded', 'false');
        });
      }
    });

    root.dataset.dialogExitInit = 'true';
  }

  shoptet.scripts.libs.focusManagement = [
    'findFirstFocusable',
    'findLastFocusable',
    'focusFirst',
    'setupFocusTrap',
    'setupDialogPassThroughFocus',
  ];

  shoptet.helpers.findFirstFocusable = wrapper => {
    shoptet.dev.deprecated(
      '2026-06-30',
      'shoptet.helpers.findFirstFocusable(wrapper)',
      'shoptet.focusManagement.findFirstFocusable(wrapper)'
    );
    return shoptet.focusManagement.findFirstFocusable(wrapper);
  };

  shoptet.helpers.focusFirst = (root, tryInside, scrollToEl, isDialog) => {
    shoptet.dev.deprecated(
      '2026-06-30',
      'shoptet.helpers.focusFirst(root, tryInside, scrollToEl, isDialog)',
      'shoptet.focusManagement.focusFirst(root, tryInside, scrollToEl, isDialog)'
    );
    return shoptet.focusManagement.focusFirst(root, tryInside, scrollToEl, isDialog);
  };

  shoptet.focusManagement = shoptet.focusManagement || {};
  shoptet.scripts.libs.focusManagement.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'focusManagement');
  });
  // @ts-expect-error Shoptet object is not defined yet.
})(shoptet);
