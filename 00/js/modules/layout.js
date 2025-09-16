// @ts-check

(function (shoptet) {
  /**
   * Calculates the offset based on fixed/sticky elements at the top (header, admin bar, messages) + optional extra.
   * @param {number} [extra=0] additional offset
   * @returns {number} px to subtract from target offset
   */
  function getScrollOffset(extra = 0) {
    const isSmUp = shoptet.layout.detectResolution(shoptet.config.breakpoints.sm);
    const isTemplate10 = shoptet.abilities.about.id === '10';
    const isTemplate11 = shoptet.abilities.about.id === '11';

    const header =
      (isTemplate11 && !isSmUp && document.querySelector('.cart-header')) ||
      (isTemplate11 && !isSmUp && document.querySelector('.top-navigation-bar')) ||
      (isTemplate10 && !isSmUp && document.querySelector('.header-navigation')) ||
      (isTemplate10 && document.querySelector('.navigation-buttons')) ||
      document.querySelector('#header');

    const headerIsFixed =
      !!header && (getComputedStyle(header).position === 'fixed' || shoptet.abilities.feature.fixed_header);
    const headerHeight = headerIsFixed ? header.getBoundingClientRect().height || 0 : 0;

    return headerHeight + (Number(extra) || 0);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.style.setProperty('--scroll-offset-runtime', `${getScrollOffset(10)}px`);
  });

  shoptet.layout = shoptet.layout || {};
  shoptet.layout.getScrollOffset = getScrollOffset;
})(shoptet);
