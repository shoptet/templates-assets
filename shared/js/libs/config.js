(function(shoptet) {
    shoptet.config = shoptet.config || {};

    shoptet.config.animationDuration =
        typeof shoptet.custom.config.animationDuration !== 'undefined' ?
        shoptet.custom.config.animationDuration : 300;

    shoptet.config.submenuTimeout =
        typeof shoptet.custom.config.submenuTimeout !== 'undefined' ?
        shoptet.custom.config.submenuTimeout : 150;

    shoptet.config.dismissTimeout =
        typeof shoptet.custom.config.dismissTimeout !== 'undefined' ?
        shoptet.custom.config.dismissTimeout : 6000;

    shoptet.config.unveilTimeout =
        typeof shoptet.custom.config.unveilTimeout !== 'undefined' ?
        shoptet.custom.config.unveilTimeout : 1000;

    shoptet.config.updateQuantityTimeout =
        typeof shoptet.custom.config.updateQuantityTimeout !== 'undefined' ?
        shoptet.custom.config.updateQuantityTimeout : 1000;

    shoptet.config.adminBarTimeout =
        typeof shoptet.custom.config.adminBarTimeout !== 'undefined' ?
        shoptet.custom.config.adminBarTimeout : 800;

// Must be identically as media query breakpoints in CSS
    shoptet.config.breakpoints = {};
    shoptet.config.breakpoints.xs = 479;
    shoptet.config.breakpoints.sm = 767;
    shoptet.config.breakpoints.md = 991;
    shoptet.config.breakpoints.lg = 1199;
    shoptet.config.breakpoints.xl = 1439;

})(shoptet);
