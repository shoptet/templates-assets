(function(shoptet) {

    function enableEventsMonitoring() {
        shoptet.dev.config.monitorEvents = true;
        console.log('%cEvents monitoring has been enabled.', shoptet.dev.config.log.styles.success);
        return true;
    }

    function disableEventsMonitoring() {
        shoptet.dev.config.monitorEvents = false;
        console.log('%cEvents monitoring has been disabled.', shoptet.dev.config.log.styles.success);
        return true;
    }

    function printMonitoringInfo() {
        console.log(
            '%c' + shoptet.dev.config.name + ' version ' + shoptet.dev.config.version,
            shoptet.dev.config.log.styles.infoInv
        );
        if (shoptet.dev.config.monitorEvents) {
            console.log(
                '%cEvents monitoring is enabled.',
                shoptet.dev.config.log.styles.info
            );
            console.log(
                'To disable events monitoring, run %cshoptet.dev.disableEventsMonitoring()',
                shoptet.dev.config.log.styles.shell
            );
        } else {
            console.log(
                '%cEvents monitoring is disabled.',
                shoptet.dev.config.log.styles.info
            );
            console.log(
                'To enable events monitoring, run %cshoptet.dev.enableEventsMonitoring()',
                shoptet.dev.config.log.styles.shell
            );
        }
    }

    function printEventInfo(key) {
        console.log(
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

    document.addEventListener("DOMContentLoaded", function() {
        if (!shoptet.abilities || shoptet.abilities.about.generation !== 3) {
            return false;
        }
        printMonitoringInfo();
        shoptet.scripts.monitoredFunctions.forEach(function(key) {
            (function(key) {
                document.addEventListener(key, shoptet.dev.attachEventInfo);
            })(key);
        });
    });

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
            larger: '14px'
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
    shoptet.dev.config.version = '0.1.3';
    shoptet.dev.config.monitorEvents = false;

    shoptet.dev.enableEventsMonitoring = enableEventsMonitoring;
    shoptet.dev.disableEventsMonitoring = disableEventsMonitoring;
    shoptet.dev.printMonitoringInfo = printMonitoringInfo;
    shoptet.dev.printEventInfo = printEventInfo;
    shoptet.dev.attachEventInfo = attachEventInfo;

    document.addEventListener('DOMContentLoaded', function() {
        if (shoptet.cookie.get('monitorJSEvents')) {
            shoptet.dev.enableEventsMonitoring();
        }
    });

})(shoptet);
