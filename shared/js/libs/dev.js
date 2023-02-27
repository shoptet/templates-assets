(function(shoptet) {

    function enableEventsMonitoring(reload = false, expires = {}) {
        let defaultExpiration = {days: 1};
        expires = {...defaultExpiration, ...expires};
        shoptet.cookie.create("monitorJSEvents", 1, expires);
        console.info('%cEvents monitoring has been enabled,', shoptet.dev.config.log.styles.success);
        if (reload) {
            console.info('%creloading...', shoptet.dev.config.log.styles.success);
            window.location.reload();
        } else {
            console.info('%cplease reload the page...', shoptet.dev.config.log.styles.success);
        }
        return true;
    }

    function disableEventsMonitoring() {
        shoptet.cookie.create("monitorJSEvents", 1, {days: -1});
        console.info('%cEvents monitoring has been disabled, reloading.', shoptet.dev.config.log.styles.success);
        window.location.reload();
        return true;
    }

    function printMonitoringInfo() {
        console.info(
            '%c' + shoptet.dev.config.name + ' version ' + shoptet.dev.config.version,
            shoptet.dev.config.log.styles.infoInv
        );
        if (shoptet.dev.config.monitorEvents) {
            console.info(
                '%cEvents monitoring is enabled.',
                shoptet.dev.config.log.styles.info
            );
            console.log(
                'To disable events monitoring, run %cshoptet.dev.disableEventsMonitoring()',
                shoptet.dev.config.log.styles.shell
            );
        } else {
            console.info(
                '%cEvents monitoring is disabled.',
                shoptet.dev.config.log.styles.info
            );
            console.log(
                'To enable events monitoring, run %cshoptet.dev.enableEventsMonitoring()',
                shoptet.dev.config.log.styles.shell
            );
        }
        if (shoptet.dev.config.shoptetDevMode) {
            console.warn(
                '%cDevelopment mode is enabled.',
                shoptet.dev.config.log.styles.fontLarger
            );
            if (shoptet.dev.config.suppressRegFn) {
                console.warn(
                    '%cExceptions about failed function registering are being suppressed.',
                    shoptet.dev.config.log.styles.fontLarger
                );
            }
        }
    }

    function printEventInfo(key) {
        console.info(
            '%cApplied function name:%c '+ key,
            shoptet.dev.config.log.styles.infoInv,
            shoptet.dev.config.log.styles.fontLarger
        );
        console.log('%cPassed arguments:', shoptet.dev.config.log.styles.infoInv);
        console.log(shoptet.scripts.arguments[key]);
    }

    function attachEventInfo(event) {
        if (shoptet.dev.config.monitorEvents) {
            shoptet.dev.printEventInfo(event.type);
        }
    }

    /**
     * Get RegExp for the particular cookie name
     *
     * @param {String} cookieName
     * cookieName = name of the cookie
     */
    function getCookieRegExp(cookieName) {
        return new RegExp('; ' + cookieName + '=([^;]*);');
    }

    shoptet.dev = shoptet.dev || {};
    shoptet.dev.config = {};
    shoptet.dev.config.log = {
        colors: {
            success: {
                front: '#fff',
                back: '#5cb85c'
            },
            error: {
                front: '#fff',
                back: '#d9534f'
            },
            info: {
                front: '#fff',
                back: '#3276b1'
            },
            shell: {
                front: '#CBCAB4',
                back: '#002B36'
            }
        },
        fontSize: {
            larger: '13px'
        }
    };
    shoptet.dev.config.log.styles = {
        success: 'background: ' + shoptet.dev.config.log.colors.success.back
            + '; color: ' + shoptet.dev.config.log.colors.success.front,
        error: 'background: ' + shoptet.dev.config.log.colors.error.back
            + '; color: ' + shoptet.dev.config.log.colors.error.front,
        info: 'background: ' + shoptet.dev.config.log.colors.info.back
            + '; color: ' + shoptet.dev.config.log.colors.info.front,
        successInv: 'background: ' + shoptet.dev.config.log.colors.success.front
            + '; color: ' + shoptet.dev.config.log.colors.success.back,
        errorInv: 'background: ' + shoptet.dev.config.log.colors.error.front
            + '; color: ' + shoptet.dev.config.log.colors.error.back,
        infoInv: 'background: ' + shoptet.dev.config.log.colors.info.front
            + '; color: ' + shoptet.dev.config.log.colors.info.back,
        shell: 'background: ' + shoptet.dev.config.log.colors.shell.back
            + '; color: ' + shoptet.dev.config.log.colors.shell.front,
        fontLarger: 'font-size: ' + shoptet.dev.config.log.fontSize.larger,
    };
    shoptet.dev.config.name = "Shoptet developers tools";
    shoptet.dev.config.version = '0.2.0';
    shoptet.dev.config.monitorEvents = ('; ' + document.cookie + ';').match(getCookieRegExp('monitorJSEvents'));
    shoptet.dev.config.shoptetDevMode = ('; ' + document.cookie + ';').match(getCookieRegExp('shoptetDevMode'));
    shoptet.dev.config.suppressRegFn = ('; ' + document.cookie + ';').match(getCookieRegExp('suppressRegFn'));

    shoptet.dev.enableEventsMonitoring = enableEventsMonitoring;
    shoptet.dev.disableEventsMonitoring = disableEventsMonitoring;
    shoptet.dev.printMonitoringInfo = printMonitoringInfo;
    shoptet.dev.printEventInfo = printEventInfo;
    shoptet.dev.attachEventInfo = attachEventInfo;
    shoptet.dev.getCookieRegExp = getCookieRegExp;

    if (!shoptet.abilities || shoptet.abilities.about.generation !== 3) {
        return false;
    }
    shoptet.dev.printMonitoringInfo();
    if (shoptet.dev.config.monitorEvents) {
        shoptet.scripts.monitoredFunctions.forEach(function(key) {
            (function(key) {
                document.addEventListener(key, shoptet.dev.attachEventInfo);
            })(key);
        });
    }

})(shoptet);
