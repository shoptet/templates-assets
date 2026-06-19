/**
 * TEMPORARY — remove together with FbShareTrackerController.
 *
 * Sizes usage of the Facebook "share" button on article pages before deciding
 * whether to drop the feature. The button renders as a cross-origin iframe, so
 * its click cannot be observed directly. We detect it indirectly: clicking the
 * button moves focus into its iframe, which fires a window "blur" with
 * document.activeElement pointing at that iframe. That is reported to the
 * FbShareTracker beacon (a GET request whose query string is captured by access
 * logs and flows into Snowflake). Inert on pages without a share button.
 */
(function () {
    var SELECTOR = '.fb-share-button';

    function init() {
        if (!document.querySelector(SELECTOR)) {
            return;
        }

        var lastSent = 0;

        window.addEventListener('blur', function () {
            var active = document.activeElement;
            if (!active || active.tagName !== 'IFRAME' || !active.closest(SELECTOR)) {
                return;
            }

            var now = Date.now();
            if (now - lastSent < 1000) {
                return;
            }
            lastSent = now;

            var button = active.closest(SELECTOR);
            var url = '/action/FbShareTracker/?articleUrl=' + encodeURIComponent(location.href);
            var articleId = button.getAttribute('data-article-id');
            if (articleId) {
                url += '&articleId=' + encodeURIComponent(articleId);
            }
            url += '&t=' + now;

            fetch(url, { method: 'GET', keepalive: true }).catch(function () {});
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
