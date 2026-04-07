// @ts-check
/// <reference path="../../../types.d.ts" />

import { ensureEvery, isHTMLFormElement, isHTMLInputElement, maybe } from '../../../shared/js/typeAssertions';

(shoptet => {
  /**
   * Init rating stars behavior for the given form.
   * - Attaches listeners
   * - Applies preselectStars prefill when enabled.
   *
   * @param {HTMLFormElement} form
   * @param {{ enableUnveil?: boolean }} [options]
   * @returns {void}
   */
  function setupRatingStars(form, { enableUnveil = false } = {}) {
    const scoreInputs = ensureEvery(Array.from(form.querySelectorAll('input[name="score"]')), isHTMLInputElement);

    if (form.dataset.ratingStarsInit === 'true') return;
    form.dataset.ratingStarsInit = 'true';

    scoreInputs.forEach(scoreInput => {
      scoreInput.addEventListener('change', () => {
        const score = scoreInput.value;
        const ariaDescribedby = scoreInput.getAttribute('aria-describedby');

        if (ariaDescribedby) {
          form.querySelectorAll('.rating-star-description').forEach(el => el.setAttribute('hidden', 'hidden'));
          document.getElementById(ariaDescribedby)?.removeAttribute('hidden');
        }

        scoreInput
          .closest('.form-group')
          ?.querySelectorAll('.msg-error')
          .forEach(msg => msg.remove());

        scoreInputs.forEach(input => {
          input.classList.remove('error-field');
          input.parentElement?.classList.remove('full');
          if (Number(input.value) <= Number(score)) {
            input.parentElement?.classList.add('full');
          }
        });
      });
    });

    const searchParams = new URLSearchParams(window.location.search);
    const preselectStars = searchParams.get('preselectStars');
    const guid = searchParams.get('guid');

    if (preselectStars) {
      const match = scoreInputs.find(input => input.value === preselectStars);
      if (match) {
        match.checked = true;
        match.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    if (enableUnveil && preselectStars && guid) {
      document.querySelector('.rate-wrapper .vote-form')?.classList.add('visible');
      document.querySelector('.rate-wrapper.unveil-wrapper')?.classList.add('unveiled');
      shoptet.scripts.signalCustomEvent('ShoptetRatingStarsUnveiled', form);
    }
  }

  /**
   * Init for modal
   *
   * @param {HTMLFormElement} form
   * @returns {void}
   */
  function initRatingStars(form) {
    setupRatingStars(form, { enableUnveil: false });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tabForm = maybe(document.querySelector('#formRating'), isHTMLFormElement);
    if (tabForm) {
      setupRatingStars(tabForm, { enableUnveil: true });
    }
  });

  shoptet.scripts.libs.ratingStars = ['initRatingStars'];

  shoptet.ratingStars ??= /** @type {Shoptet['ratingStars']} */ ({});
  shoptet.scripts.libs.ratingStars.forEach(function (fnName) {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'ratingStars');
  });
})(shoptet);
