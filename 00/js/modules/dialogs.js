// @ts-check

import { ensure, maybe } from '../../../shared/js/typeAssertions';

const isHTMLElement = value => value instanceof HTMLElement;
const isHTMLDialogElement = value => value instanceof HTMLDialogElement;

(function (shoptet) {
  /** @type {WeakMap<HTMLDialogElement, HTMLElement>} */
  const dialogOpenerMap = new WeakMap();

  /**
   * Opens the dialog (with CSS-driven animation).
   * @param {HTMLDialogElement} dialog
   * @param {HTMLElement|null} triggerEl
   * @returns {void}
   */
  function openDialog(dialog, triggerEl) {
    const isModal = dialog.classList.contains('js-dialog--modal');
    const ac = new AbortController();
    const { signal } = ac;

    if (triggerEl) dialogOpenerMap.set(dialog, triggerEl);

    const onClose = () => ac.abort();
    dialog.addEventListener('close', onClose, { once: true, signal });

    isModal ? dialog.showModal() : dialog.show();

    requestAnimationFrame(() => dialog.classList.add('is-visible'));

    if (isModal) {
      dialog.addEventListener(
        'cancel',
        e => {
          e.preventDefault();
          closeDialog(dialog);
        },
        { once: true, signal }
      );

      shoptet.focusManagement.setupFocusTrap(dialog, signal);
      shoptet.focusManagement.focusFirst(dialog, false, false, true);
    } else {
      dialog.addEventListener(
        'keydown',
        e => {
          if (e.key === 'Escape') closeDialog(dialog);
        },
        { once: true, signal }
      );

      shoptet.focusManagement.focusFirst(dialog, true, false, false);
    }

    dialog.addEventListener(
      'pointerdown',
      e => {
        if (e.target === dialog) closeDialog(dialog);
      },
      { once: true, capture: true, signal }
    );
  }

  /**
   * Closes the dialog with animation.
   * @param {HTMLDialogElement} dialog
   * @returns {void}
   */
  function closeDialog(dialog) {
    if (!dialog.open) return;

    dialog.classList.remove('is-visible');
    dialog.classList.add('is-closing');

    const dialogWrapper = maybe(dialog.querySelector('.dialog__wrapper'), isHTMLElement);

    const finish = () => {
      dialog.classList.remove('is-closing');
      dialog.close();

      const opener = maybe(dialogOpenerMap.get(dialog), isHTMLElement);
      dialogOpenerMap.delete(dialog);
      if (opener && 'focus' in opener) opener.focus();
    };

    if (shoptet.a11y.reducedMotion || !dialogWrapper) {
      finish();
      return;
    }

    const closeFallback = setTimeout(() => {
      dialogWrapper.removeEventListener('transitionend', onTransitionEnd);
      finish();
    }, 500);

    /** @param {TransitionEvent} ev */
    function onTransitionEnd(ev) {
      if (ev.target === dialogWrapper) {
        clearTimeout(closeFallback);
        dialogWrapper.removeEventListener('transitionend', onTransitionEnd);
        finish();
      }
    }

    dialogWrapper.addEventListener('transitionend', onTransitionEnd);
  }

  /**
   * @returns {void}
   */
  function initDialogs() {
    document.addEventListener('click', e => {
      const target = maybe(e.target, isHTMLElement);
      if (!target) return;

      // Opening dialog
      if (target.matches('[data-dialog-id]')) {
        const dialogId = target.getAttribute('data-dialog-id');
        if (!dialogId) return;

        const dialogEl = ensure(document.getElementById(dialogId), isHTMLDialogElement);
        openDialog(dialogEl, target);
        return;
      }

      // Closing dialog
      if (target.matches('[data-dialog-close]')) {
        const dialogEl = maybe(target.closest('.dialog'), isHTMLDialogElement);
        if (dialogEl) {
          closeDialog(dialogEl);
        }
      }
    });
  }

  initDialogs();

  shoptet.scripts.libs.dialog = ['initDialogs', 'openDialog', 'closeDialog'];

  shoptet.dialog = shoptet.dialog || {};
  shoptet.scripts.libs.dialog.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'dialog');
  });
  // @ts-expect-error Shoptet object is not defined yet.
})(shoptet);
