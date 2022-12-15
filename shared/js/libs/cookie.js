(function(shoptet) {

    function get(cookieName) {
        var regexp = new RegExp('; ' + cookieName + '=([^;]*);');
        var match = ('; ' + document.cookie + ';').match(regexp);
        if (cookieName && match) {
            return unescape(match[1]);
        }
        return false;
    }

    function create(name, value, expires) {
        if (typeof expires === 'undefined') {
            console.log(
                '%cCookie expiration is required',
                shoptet.dev.config.log.styles.error
            );
            return false;
        }

        if (typeof name !== 'string') {
            console.log(
                '%cCookie name must be a string',
                shoptet.dev.config.log.styles.error
            );
            return false;
        }

        var defaultExpiration = {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        for (var key in expires) {
            if (expires.hasOwnProperty(key)) {
                defaultExpiration[key] = expires[key];
            }
        }

        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        var expiration = new Date(
            year + parseInt(defaultExpiration.years),
            month + parseInt(defaultExpiration.months),
            day + parseInt(defaultExpiration.days),
            hour + parseInt(defaultExpiration.hours),
            minute + parseInt(defaultExpiration.minutes),
            second + parseInt(defaultExpiration.seconds)
        );
        var maxAge = parseInt(defaultExpiration.days) * 24 * 60 * 60;
        document.cookie = name + '=' + value + '; expires=' + expiration.toGMTString() + '; max-age=' + maxAge + '; path=/';
        return true;
    }

    shoptet.cookie = shoptet.cookie || {};
    shoptet.scripts.libs.cookie.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'cookie');
    });

})(shoptet);
