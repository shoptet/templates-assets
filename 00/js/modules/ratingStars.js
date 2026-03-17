// @ts-check

import { ensure, ensureEvery, isHTMLFormElement, isHTMLInputElement, maybe } from '../../../shared/js/typeAssertions';

const voteForm = maybe(document.querySelector('#formRating'), isHTMLFormElement);
// @ts-expect-error Shoptet object types are not defined
if (voteForm && shoptet.config.discussion_rating_forms) {
  // TODO: Remove the ums condition above in issue #20873
  const search = window.location.search;
  const emailInput = ensure(voteForm.querySelector('input[name="email"]'), isHTMLInputElement);
  const buyerNameInput = ensure(voteForm.querySelector('input[name="fullName"]'), isHTMLInputElement);
  const scoreInputs = ensureEvery(Array.from(voteForm.querySelectorAll('input[name="score"]')), isHTMLInputElement);
  scoreInputs.forEach(scoreInput => {
    scoreInput.addEventListener('change', () => {
      const score = scoreInput.value;
      const ariaDescribedby = scoreInput.getAttribute('aria-describedby');
      if (ariaDescribedby) {
        document.querySelectorAll('.rating-star-description').forEach(el => el.setAttribute('hidden', 'hidden'));
        document.getElementById(ariaDescribedby)?.removeAttribute('hidden');
      }
      scoreInput
        .closest('.form-group')
        ?.querySelectorAll('.msg-error')
        .forEach(msg => msg.remove());
      scoreInputs.forEach(input => {
        input.classList.remove('error-field');
        input.parentElement?.classList.remove('full');
        if (input.value <= score) {
          input.parentElement?.classList.add('full');
        }
      });
    });
  });

  if (search.length > 0) {
    const searchValues = new URLSearchParams(search);
    const email = searchValues.get('email');
    const buyerName = searchValues.get('buyerName');
    const preselectStars = searchValues.get('preselectStars');

    if (email || buyerName || preselectStars) {
      document.querySelector('.rate-wrapper .vote-form')?.classList.add('visible');
      document.querySelector('.rate-wrapper.unveil-wrapper')?.classList.add('unveiled');
    }

    if (email) {
      emailInput.value = email;
    }
    if (buyerName) {
      buyerNameInput.value = buyerName;
    }
    if (preselectStars) {
      scoreInputs.find(input => input.value === preselectStars)?.parentElement?.click();
    }
  }
}
