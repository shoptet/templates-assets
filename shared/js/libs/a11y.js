// @ts-check

(function (shoptet) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

  shoptet.a11y = shoptet.a11y || {};
  shoptet.a11y.reducedMotion = mq.matches;

  mq.addEventListener('change', event => {
    shoptet.a11y.reducedMotion = event.matches;
  });
})(shoptet);
