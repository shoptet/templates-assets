// @ts-check

/**
 * @typedef {{
 *  years?: number,
 *  months?: number,
 *  days?: number,
 *  hours?: number,
 *  minutes?: number,
 *  seconds?: number
 * }} CookieExpiration
 */

(function (shoptet) {
  /**
   * This function returns a value of a cookie if it exists, otherwise it returns false.
   * @param {string} cookieName Name of the cookie to get
   * @returns {string | false}
   */
  function get(cookieName) {
    if (document.cookie.includes(cookieName)) {
      const cookie = document.cookie.split('; ').find(row => row.startsWith(`${cookieName}=`));
      if (cookie) {
        return cookie.split('=')[1] || false;
      }
    }
    return false;
  }

  /**
   * This function creates a cookie with a given name, value and expiration time.
   * @param {string} name Name of the cookie
   * @param {string} value Value of the cookie
   * @param {CookieExpiration} expires Object with expiration time. At least one of the keys is required.
   * @param {string} [path] Optional path of the cookie, default is '/'.
   * @returns {boolean}
   */
  function create(name, value, expires, path = '/') {
    if (typeof expires === 'undefined') {
      console.log('%cCookie expiration is required', shoptet.dev.config.log.styles.error);
      return false;
    }

    if (typeof name !== 'string') {
      console.log('%cCookie name must be a string', shoptet.dev.config.log.styles.error);
      return false;
    }

    if (!Object.keys(expires).some(key => ['years', 'months', 'days', 'hours', 'minutes', 'seconds'].includes(key))) {
      console.log(
        '%cCookie expiration must contain at least one of the required keys',
        shoptet.dev.config.log.styles.error
      );
      return false;
    }

    const defaultExpiration = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    for (const key in expires) {
      if (expires.hasOwnProperty(key)) {
        defaultExpiration[key] = expires[key];
      }
    }

    const now = new Date();
    const expirationDate = new Date(
      now.getFullYear() + defaultExpiration.years,
      now.getMonth() + defaultExpiration.months,
      now.getDate() + defaultExpiration.days,
      now.getHours() + defaultExpiration.hours,
      now.getMinutes() + defaultExpiration.minutes,
      now.getSeconds() + defaultExpiration.seconds
    );

    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=${path}${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    return true;
  }

  shoptet.cookie = shoptet.cookie || {};
  shoptet.scripts.libs.cookie.forEach(function (fnName) {
    var fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'cookie');
  });
})(shoptet);
