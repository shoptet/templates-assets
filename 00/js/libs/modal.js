(function(shoptet) {

    /**
     * Wrapper function to open colorbox or any other modal rendering script
     *
     * @param {Object} options
     * options = options provided to modal rendering library
     */
    function open(options) {
        // we can switch to any other library in future
        $.colorbox(options);
    }

    /**
     * Close modal window
     *
     * This function does not accept any arguments.
     */
    function close() {
        $.colorbox.close();
    }

    /**
     * Resize modal window directly
     *
     * @param {Object} options
     * options = dimensions passed to resize function
     */
    function resize(options) {
        $.colorbox.resize(options);
    }

    /**
     * Resize modal window for 1-3G
     *
     * This function does not accept any arguments.
     */
    function shoptetResize() {
        var width;
        var $colorbox = $('#colorbox');
        // 'colorbox-xs|sm|lg' is fallback for hardcoded classes in partners scripts
        if ($colorbox.hasClass('colorbox-xs') || $colorbox.hasClass(shoptet.config.colorbox.classXs)) {
            width = shoptet.config.colorbox.widthXs;
        } else if ($colorbox.hasClass('colorbox-sm') || $colorbox.hasClass(shoptet.config.colorbox.classSm)) {
            width = shoptet.config.colorbox.widthSm;
        } else if ($colorbox.hasClass('colorbox-lg') || $colorbox.hasClass(shoptet.config.colorbox.classLg)) {
            width = shoptet.config.colorbox.widthLg;
        } else {
            // colorbox.widthMd is default width of colorbox
            width = shoptet.config.colorbox.widthMd;
        }
        if (!detectResolution(shoptet.config.breakpoints.lg)) {
            var responsiveWidth;
            if (shoptet.abilities.about.generation === 3) {
                responsiveWidth = $('.content-wrapper').width()
            } else {
                responsiveWidth = $('#content').width() - 30
            }
            width = responsiveWidth > width ? width : responsiveWidth;
            shoptet.modal.resize({
                width: width
            });
        } else {
            shoptet.modal.resize({
                width: width
            });
        }
    }

    shoptet.modal = shoptet.modal || {};
    shoptet.scripts.libs.modal.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'modal');
    });

})(shoptet);
