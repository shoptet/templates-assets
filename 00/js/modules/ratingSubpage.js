// @ts-check
/// <reference path="../../../types.d.ts" />

import {
  ensure,
  ensureEvery,
  isHTMLElement,
  isHTMLFormElement,
  maybe,
  isString,
} from '../../../shared/js/typeAssertions';

/**
 * Replaces every element matching selector with a clone of the given source node.
 * @param {string} selector
 * @param {HTMLElement} source
 */
function replaceAllWithClone(selector, source) {
  const targets = ensureEvery(Array.from(document.querySelectorAll(selector)), isHTMLElement);

  targets.forEach(oldEl => {
    const clone = source.cloneNode(true);
    oldEl.replaceWith(clone);
  });
}

/**
 * Build request URL for the rating modal from trigger attributes
 * and merge allowed email-link params from the current page URL.
 *
 * @param {HTMLElement} trigger
 * @returns {string}
 */
function getRequestUrlFromTrigger(trigger) {
  const base = ensure(trigger.getAttribute('data-simple-rating'), isString);
  const productId = ensure(trigger.getAttribute('data-product-id'), isString);

  const url = new URL(base, window.location.origin);
  url.searchParams.set('productId', productId);

  const currentParams = new URLSearchParams(window.location.search);
  const allowedParams = new Set(['guid', 'preselectStars']);

  for (const [key, value] of currentParams) {
    if (allowedParams.has(key) && !url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

/**
 * Updates rating summary parts on the page from the response payload.
 * Payload contains exactly ONE instance of each part, but the page can contain many.
 * - Replace all .stars--productDetail with cloned payload stars node
 * - Replace all .starsLabel--productDetail with cloned payload label node
 * @param {ShoptetAjaxResponse} response
 */
function updateRatingSummaryFromPayload(response) {
  const payload = response.getPayload();
  if (typeof payload !== 'string' || payload.trim() === '') return;

  const tpl = document.createElement('template');
  tpl.innerHTML = payload;

  const newStars = maybe(tpl.content.querySelector('.stars--productDetail'), isHTMLElement);
  const newLabel = maybe(tpl.content.querySelector('.starsLabel--productDetail'), isHTMLElement);

  if (newStars) replaceAllWithClone('.stars--productDetail', newStars);
  if (newLabel) replaceAllWithClone('.starsLabel--productDetail', newLabel);
  shoptet.scripts.signalCustomEvent('ShoptetRatingSummaryUpdated');
}

/**
 * Opens rating modal automatically when user arrives from email link
 * @returns {void}
 */
function autoOpenRatingModalFromEmailLink() {
  const trigger = maybe(document.querySelector('.js-ratingDialogTrigger'), isHTMLElement);

  if (
    !(
      trigger &&
      shoptet.config.rating.enabled === true &&
      shoptet.config.rating.advanced === false &&
      window.location.hash === '#ratingWrapper'
    )
  )
    return;

  openRatingModal();
}

/**
 * Opens the rating modal dialog.
 * Loads the form via AJAX, initializes tooltips, validator, and rating stars.
 * @returns {void}
 */
function openRatingModal() {
  const trigger = ensure(document.querySelector('.js-ratingDialogTrigger'), isHTMLElement);
  const href = getRequestUrlFromTrigger(trigger);

  const announcer = shoptet.screenReader.createLoadingAnnouncer();
  announcer.begin(document.body);

  shoptet.modal.open({
    href,
    className: shoptet.modal.config.classMd + ' ratingDialog',
    width: shoptet.modal.config.widthMd,
    maxWidth: shoptet.modal.config.maxWidth,
    onComplete: () => {
      window.initTooltips();
      shoptet.modal.resize();

      const form = maybe(document.querySelector('#dialogFormRating'), isHTMLFormElement);
      if (form) {
        shoptet.validator.initValidator($(form));
        shoptet.ratingStars.initRatingStars(form);
      }

      announcer.end();
      shoptet.scripts.signalCustomEvent('ShoptetRatingModalOpened', trigger);
    },
  });
}

/**
 * Submit handler for rating form (#dialogFormRating).
 * @param {HTMLFormElement} form
 */
function submitRatingForm(form) {
  const data = shoptet.common.serializeForm(form);

  const announcer = shoptet.screenReader.createLoadingAnnouncer();
  const dialog = ensure(document.querySelector('#colorbox'), isHTMLElement);

  announcer.begin(dialog);

  shoptet.ajax.makeAjaxRequest(shoptet.config.rateProduct, shoptet.ajax.requestTypes.post, data, {
    success: response => {
      let message = response.getMessage();
      let isError = response.isFailed();

      if (!message || message.trim().startsWith('<')) {
        const payload = response.getPayload?.();
        if (typeof payload === 'string') {
          const tpl = document.createElement('template');
          tpl.innerHTML = payload;
          const errorEl = maybe(tpl.content.querySelector('.msg-error'), isHTMLElement);
          if (errorEl) {
            message = errorEl.textContent?.trim();
            isError = true;
          }
        }
      }

      const messageType = isError ? 'error' : 'success';

      if (message) {
        window.showMessage(message, messageType);
      }

      if (!isError) {
        updateRatingSummaryFromPayload(response);
        shoptet.modal.close();
        shoptet.scripts.signalCustomEvent('ShoptetRatingUpdated', dialog);
      }

      announcer.end();
    },
    failed: () => {
      announcer.error();
    },
  });
}

function init() {
  document.addEventListener('submit', e => {
    const form = maybe(e.target, isHTMLFormElement);
    if (!form || !form.matches('#dialogFormRating')) return;
    e.preventDefault();

    if (shoptet.validator.formContainsInvalidFields(form)) return;

    submitRatingForm(form);
  });

  document.addEventListener('click', e => {
    const target = maybe(e.target, isHTMLElement);
    if (!target) return;

    const trigger = maybe(target.closest('.js-ratingDialogTrigger'), isHTMLElement);
    if (!trigger) return;

    openRatingModal();
  });

  autoOpenRatingModalFromEmailLink();
}

document.addEventListener('DOMContentLoaded', init);
