(function(shoptet) {
    /**
     * Function that fires after end of resize
     *
     * This function does not accept any arguments.
     */
    function resizeEnd() {
        if (new Date() - shoptet.runtime.resize.rtime < shoptet.runtime.resize.delta) {
            setTimeout(resizeEnd, shoptet.runtime.resize.delta);
        } else {
            shoptet.runtime.resize.timeout = false;
            shoptet.scripts.signalNativeEvent('resizeEnd', document);
            var window_changed = $(window).width() !== shoptet.runtime.resize.windowWidth;
            if (window_changed) {
                resizeEndCallback();
                shoptet.runtime.resize.windowWidth = $(window).width();
            }

            var height = window.innerHeight;
            if (height !== shoptet.runtime.resize.windowHeight) {
                document.documentElement.style.setProperty('--vh', (height * 0.01) + 'px');
                shoptet.runtime.resize.windowHeight = height;
            }
        }
    }

    shoptet.runtime = shoptet.runtime || {};
    shoptet.runtime.setPcsTimeout = false;
    // we need to clear messages after page load
    shoptet.runtime.dismiss = setTimeout(function() {
        hideMsg();
    }, shoptet.config.dismissTimeout);
    shoptet.runtime.resize = {
        delta: 300,
        rtime: false,
        timeout: false,
        windowWidth: false,
        windowHeight: false
    };
    shoptet.runtime.cloudZoom = false;
    shoptet.runtime.updateMenu = false;
    shoptet.runtime.adminBar = false;

    shoptet.scripts.libs.runtime.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'runtime');
    });

    document.addEventListener('DOMContentLoaded', function() {
        shoptet.runtime.resize.windowWidth = $(window).width();
        shoptet.runtime.resize.windowHeight = window.innerHeight;
        document.documentElement.style.setProperty('--vh',
            (shoptet.runtime.resize.windowHeight * 0.01) + 'px'
        );
    });

    window.addEventListener('resize', function() {
        shoptet.runtime.resize.rtime = new Date();
        if (shoptet.runtime.resize.timeout === false) {
            shoptet.runtime.resize.timeout = true;
            setTimeout(function() {
                shoptet.runtime.resizeEnd();
            }, shoptet.runtime.resize.delta);
        }
    });

})(shoptet);
