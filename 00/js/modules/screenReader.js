// @ts-check

(function (shoptet) {
  let clearTimer;
  let rafId;

  /**
   * Announces a message to screen readers using an ARIA live region.
   *
   * @param {string} message - the message to be announced by the screen reader
   * @param {'polite' | 'assertive'} [liveType="polite"] - the type of announcement
   *  - polite (default): Announces the message at the next available opportunity.
   *  - assertive: Announces the message immediately, interrupting any current speech.
   * @param {Object} [options] - Additional options.
   * @param {number|null} [options.clearAfterMs=3000]
   *   Delay in milliseconds before the message is cleared; set to `null` to skip auto-clear.
   * @returns {void}
   */

  function announceToScreenReader(message, liveType = 'polite', { clearAfterMs = 3000 } = {}) {
    const el = document.getElementById('screen-reader-announcer');
    if (!el || !message) return;

    el.setAttribute('aria-live', liveType);
    el.textContent = '';

    cancelAnimationFrame(rafId);
    clearTimeout(clearTimer);

    rafId = requestAnimationFrame(() => {
      el.textContent = message;

      if (clearAfterMs != null) {
        clearTimer = setTimeout(() => {
          el.textContent = '';
        }, clearAfterMs);
      }
    });
  }

  /**
   * Loader options
   * @typedef {Object} LoaderOptions
   * @property {number} [firstPingAfter=1500]  Delay before the first "Still loading..." (ms).
   * @property {number} [pingEvery=5000]       Interval between next pings (ms).
   * @property {number} [maxPings=10]           Max. number of "still loading" pings.
   * @property {string} [initialMessage]       Initial message (default: "Loading...").
   * @property {string} [stillLoadingMessage]  Message during loading (default: "Still loading...").
   * @property {string} [finalMessage]         Final message (default: "").
   * @property {string} [errorMessage]         Error message (default: "Loading failed. Please try again.").
   */

  /** @typedef {ReturnType<typeof setTimeout>} TimerId */

  class LoadingAnnouncer {
    /**
     * @param {LoaderOptions} [options]
     */
    constructor(options = {}) {
      /** @type {TimerId|null} */
      this.intervalId = null;
      /** @type {TimerId|null} */
      this.firstPingTimer = null;
      /** @type {number} */
      this.pingCount = 0;
      /** @type {HTMLElement|null} */
      this.wrapper = null;

      this.config = {
        firstPingAfter: 1500,
        pingEvery: 5000,
        maxPings: 10,
        initialMessage: shoptet.messages['loading'],
        stillLoadingMessage: shoptet.messages['stillLoading'],
        finalMessage: '',
        errorMessage: shoptet.messages['loadingFailed'],
        ...options,
      };
    }

    /**
     * Starts announcing: sets aria-busy, announces initialMessage, schedules pings.
     * @param {HTMLElement} [wrapper]
     */
    begin(wrapper) {
      this.clearTimers();

      if (this.wrapper && this.wrapper !== wrapper) {
        this.wrapper.removeAttribute('aria-busy');
      }
      if (wrapper) {
        this.wrapper = wrapper;
        this.wrapper.setAttribute('aria-busy', 'true');
      }

      this.pingCount = 0;
      if (this.config.initialMessage) {
        announceToScreenReader(this.config.initialMessage, 'polite');
      }

      this.firstPingTimer = setTimeout(() => {
        this.ping();
        this.intervalId = setInterval(() => {
          if (this.pingCount >= this.config.maxPings) {
            this.clearTimers();
            return;
          }
          this.ping();
        }, this.config.pingEvery);
      }, this.config.firstPingAfter);
    }

    /**
     * Finishes successfully: stops timers, announces finalMessage, removes aria-busy.
     */
    end() {
      this.clearTimers();
      if (!!this.config.finalMessage) {
        announceToScreenReader(this.config.finalMessage, 'polite');
      }
      if (this.wrapper) {
        this.wrapper.removeAttribute('aria-busy');
        this.wrapper = null;
      }
    }

    /**
     * Finishes with error: stops timers, announces errorMessage (assertive), removes aria-busy.
     */
    error() {
      this.clearTimers();
      announceToScreenReader(this.config.errorMessage, 'assertive');
      if (this.wrapper) {
        this.wrapper.removeAttribute('aria-busy');
        this.wrapper = null;
      }
    }

    ping() {
      this.pingCount++;
      announceToScreenReader(this.config.stillLoadingMessage, 'polite');
      if (this.pingCount >= this.config.maxPings) this.clearTimers();
    }

    clearTimers() {
      if (this.firstPingTimer !== null) {
        clearTimeout(this.firstPingTimer);
        this.firstPingTimer = null;
      }
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }

  function createLoadingAnnouncer(options) {
    return new LoadingAnnouncer(options);
  }

  shoptet.scripts.libs.screenReader = ['announceToScreenReader', 'createLoadingAnnouncer'];

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
})(shoptet);
