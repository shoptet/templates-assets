(function(shoptet) {
    function decSep() {
        try {
            return shoptet.config.decSeparator;
        } catch(ex) {
            return window.decSeparator;
        }
    }

    function toFloat(value) {
        if (typeof(value) !== 'string') {
            value = value + '';
        }
        return parseFloat(value.replace(decSep(), '.'));
    }

    function toLocaleFloat(value, decimals, trim) {
        value = value.toFixed(decimals === 'undefined' ? 0 : decimals).toString();

        if (trim && value.indexOf('.') != -1) {
            value = value.replace(/\.?0*$/, '');
        }
        return value.replace('.', decSep());
    }

    function resolveMinimumAmount(decimals) {
        switch (decimals) {
            case 1:
                return 0.1;
            case 2:
                return 0.01;
            case 3:
                return 0.001;
            default:
                return 1;
        }
    }

    /**
     * Increase/decrease quantity of products in input
     * by clickin' on arrows
     * Decimals, min and max values are passed by data-attributes
     *
     * @param {Object} el
     * el = input field that have to be updated
     * @param {Number} min
     * decimals = minimum allowed amount
     * @param {Number} max
     * max = maximum allowed amount
     * @param {Number} decimals
     * decimals = allowed decimal places
     * @param {String} action
     * action = accepts 'increase' or 'decrease'
     * @param {Function} callback
     * callback = optional callback after quantity update
     */
    function updateQuantity(el, min, max, decimals, action, callback) {
        var value = shoptet.helpers.toFloat(el.value);
        if (isNaN(value)) {
            return false;
        }

        var decimals = typeof decimals !== 'undefined'
            ? toFloat(decimals) : 0;

        var min = typeof min !== 'undefined'
            ? toFloat(min) : resolveMinimumAmount(decimals);
        var max = typeof max !== 'undefined'
            ? toFloat(max) : toFloat(shoptet.config.defaultProductMaxAmount);

        if (action === 'increase') {
            value += (min > 1) ? 1 : min;
        } else {
            value -= (min > 1) ? 1 : min;
        }

        if (value < min || value > max) {
            return false;
        }

        el.value = shoptet.helpers.toLocaleFloat(value, decimals, true);

        if (typeof callback === 'function') {
            callback();
        }

        return true;
    }

    function isTouchDevice() {
        var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        var mq = function(query) {
            return window.matchMedia(query).matches;
        };
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }
        var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }

    shoptet.helpers = shoptet.helpers || {};
    shoptet.helpers.toFloat = toFloat;
    shoptet.helpers.toLocaleFloat = toLocaleFloat;
    shoptet.helpers.updateQuantity = updateQuantity;
    shoptet.helpers.resolveMinimumAmount = resolveMinimumAmount;
    shoptet.helpers.isTouchDevice = isTouchDevice;

})(shoptet);
