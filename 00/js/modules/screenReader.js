// @ts-check

(function (shoptet) {
  /**
   * Announces a message to screen readers using an ARIA live region.
   *
   * @param {string} message - the message to be announced by the screen reader
   * @param {'polite' | 'assertive'} [liveType="polite"] - the type of announcement
   *  - polite (default): Announces the message at the next available opportunity.
   *  - assertive: Announces the message immediately, interrupting any current speech.
   * @returns {void}
   */
  function announceToScreenReader(message, liveType = 'polite') {
    const announcer = document.getElementById('screen-reader-announcer');
    if (!announcer) return;

    announcer.setAttribute('aria-live', liveType);

    setTimeout(() => {
      announcer.innerHTML = message;

      setTimeout(() => {
        announcer.innerHTML = '';
      }, 2000);
    }, 200);
  }

  shoptet.scripts.libs.screenReader = ['announceToScreenReader'];

  shoptet.helpers.announceToScreenReader = (message, liveType) => {
    shoptet.dev.deprecated(
      '2025-12-31',
      'shoptet.helpers.announceToScreenReader(message, liveType)',
      'shoptet.screenReader.announceToScreenReader(message, liveType)'
    );
    return shoptet.screenReader.announceToScreenReader(message, liveType);
  };

  shoptet.screenReader = shoptet.screenReader || {};
  shoptet.scripts.libs.screenReader.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'screenReader');
  });
  // @ts-expect-error Shoptet object is not defined yet.
})(shoptet);
