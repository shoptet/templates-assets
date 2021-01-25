(function(shoptet) {
    shoptet.config = shoptet.config || {};
    shoptet.config.animationDuration = 300;
    shoptet.config.dismissTimeout = 6000;
    shoptet.config.unveilTimeout = shoptet.custom.config.unveilTimeout || 1000;
    shoptet.config.adminBarTimeout = 800;

// Must be identically as media query breakpoints in CSS
    shoptet.config.breakpoints = {};
    shoptet.config.breakpoints.xs = 479;
    shoptet.config.breakpoints.sm = 767;
    shoptet.config.breakpoints.md = 991;
    shoptet.config.breakpoints.lg = 1199;
    shoptet.config.breakpoints.xl = 1439;

    shoptet.config.colorbox = {};
    shoptet.config.colorbox.opacity = 0.65;
    shoptet.config.colorbox.maxWidth = '98%';
    shoptet.config.colorbox.maxHeight = '95%';
    shoptet.config.colorbox.initialHeight = 480;
    shoptet.config.colorbox.widthXs = 300;
    shoptet.config.colorbox.widthSm = 500;
    shoptet.config.colorbox.widthMd = 700;
    shoptet.config.colorbox.widthLg = 1152;
    shoptet.config.colorbox.classXs = 'shoptet-modal-xs';
    shoptet.config.colorbox.classSm = 'shoptet-modal-sm';
    shoptet.config.colorbox.classMd = 'shoptet-modal-md';
    shoptet.config.colorbox.classLg = 'shoptet-modal-lg';

    shoptet.config.updateQuantityTimeout = 1000;

    shoptet.config.cartActionUrl = '/action/Cart';

})(shoptet);
