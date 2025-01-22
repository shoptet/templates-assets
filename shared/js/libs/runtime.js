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
            const windowChanged = window.innerWidth !== shoptet.runtime.resize.windowWidth;
            if (windowChanged) {
                shoptet.layout.clearCache('detectResolution');
            }
            shoptet.scripts.signalNativeEvent('resizeEnd', document);
            if (windowChanged) {
                resizeEndCallback();
                shoptet.runtime.resize.windowWidth = window.innerWidth;
            }

            const height = window.innerHeight;
            if (height !== shoptet.runtime.resize.windowHeight) {
                shoptet.layout.clearCache('vh');
                document.documentElement.style.setProperty('--vh', `${shoptet.layout.getViewHeight()}px`);
                shoptet.runtime.resize.windowHeight = height;
            }
        }
    }

    shoptet.runtime = shoptet.runtime || {};
    shoptet.runtime.setPcsTimeout = false;
    // we need to clear messages after page load
    shoptet.runtime.dismiss = setTimeout(() => {
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

    shoptet.scripts.libs.runtime.forEach((fnName) => {
        const fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'runtime');
    });

    document.addEventListener('DOMContentLoaded', () => {
        shoptet.runtime.resize.windowWidth = window.innerWidth;
        shoptet.runtime.resize.windowHeight = window.innerHeight;
    });

    window.addEventListener('resize', () => {
        shoptet.runtime.resize.rtime = new Date();
        if (shoptet.runtime.resize.timeout === false) {
            shoptet.runtime.resize.timeout = true;
            setTimeout(() => {
                shoptet.runtime.resizeEnd();
            }, shoptet.runtime.resize.delta);
        }
    });

    shoptet.events.paymentGwRedirectScheduled = new Promise(resolve => {
        shoptet.runtime.resolvePaymentGwRedirectScheduled = resolve;
    });
})(shoptet);
