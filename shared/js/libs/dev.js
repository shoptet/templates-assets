/// <reference path="./cookie.js" />
// @ts-check

const LOG_TO_CONSOLE = false; // Enable this feature after you inform partners about this way of logging deprecated features.

const CONFIG_NAME = 'Shoptet developers tools';
const CONFIG_VERSION = '0.2.0';

const MONITOR_EVENTS_COOKIE = 'monitorJSEvents';
const SHOPTET_DEV_MODE_COOKIE = 'shoptetDevMode';
const SUPPRESS_REG_FN_COOKIE = 'suppressRegFn';

(function (shoptet) {
  const monitorEvents = document.cookie.includes(MONITOR_EVENTS_COOKIE);
  const shoptetDevMode = document.cookie.includes(SHOPTET_DEV_MODE_COOKIE);
  const suppressRegFn = document.cookie.includes(SUPPRESS_REG_FN_COOKIE);

  const configStyle = Object.freeze({
    colors: {
      success: {
        front: '#fff',
        back: '#5cb85c',
      },
      error: {
        front: '#fff',
        back: '#d9534f',
      },
      info: {
        front: '#fff',
        back: '#3276b1',
      },
      shell: {
        front: '#CBCAB4',
        back: '#002B36',
      },
    },
    fontSize: {
      larger: '13px',
    },
    fontWeights: {
      bold: 'bold;',
    },
  });

  const consoleStyle = Object.freeze({
    success: `background: ${configStyle.colors.success.back}; color: ${configStyle.colors.success.front}`,
    error: `background: ${configStyle.colors.error.back}; color: ${configStyle.colors.error.front}`,
    info: `background: ${configStyle.colors.info.back}; color: ${configStyle.colors.info.front}`,
    successInv: `background: ${configStyle.colors.success.front}; color: ${configStyle.colors.success.back}`,
    errorInv: `background: ${configStyle.colors.error.front}; color: ${configStyle.colors.error.back}`,
    infoInv: `background: ${configStyle.colors.info.front}; color: ${configStyle.colors.info.back}`,
    shell: `background: ${configStyle.colors.shell.back}; color: ${configStyle.colors.shell.front}`,
    fontLarger: `font-size: ${configStyle.fontSize.larger}`,
    fontBold: `font-weight: ${configStyle.fontWeights.bold}`,
    default: '',
  });

  /**
   * This function enables Shoptet events monitoring.
   * @param {boolean} [reload] If true, the page will be reloaded after enabling events monitoring.
   * @param {CookieExpiration} [expires] Optional expiration time, default is 1 day.
   * @returns {true}
   */
  function enableEventsMonitoring(reload = false, expires = {}) {
    const defaultExpiration = { days: 1 };
    expires = { ...defaultExpiration, ...expires };
    shoptet.cookie.create(MONITOR_EVENTS_COOKIE, 1, expires);
    console.info('%cEvents monitoring has been enabled,', consoleStyle.success);
    if (reload) {
      console.info('%creloading...', consoleStyle.success);
      window.location.reload();
    } else {
      console.info('%cplease reload the page...', consoleStyle.success);
    }
    return true;
  }

  /**
   * This function disables Shoptet events monitoring.
   * @returns {true}
   */
  function disableEventsMonitoring() {
    shoptet.cookie.create(MONITOR_EVENTS_COOKIE, 1, { days: -1 });
    console.info('%cEvents monitoring has been disabled, reloading.', consoleStyle.success);
    window.location.reload();
    return true;
  }

  /**
   * This function prints the default information about the current dev configuration.
   */
  function printMonitoringInfo() {
    console.info(`%c${CONFIG_NAME} version ${CONFIG_VERSION}`, consoleStyle.infoInv);
    if (monitorEvents) {
      console.info('%cEvents monitoring is enabled.', consoleStyle.info);
      console.log('To disable events monitoring, run %cshoptet.dev.disableEventsMonitoring()', consoleStyle.shell);
    } else {
      console.info('%cEvents monitoring is disabled.', consoleStyle.info);
      console.log('To enable events monitoring, run %cshoptet.dev.enableEventsMonitoring()', consoleStyle.shell);
    }
    if (shoptetDevMode) {
      console.warn('%cDevelopment mode is enabled.', consoleStyle.fontLarger);
      if (suppressRegFn) {
        console.warn('%cExceptions about failed function registering are being suppressed.', consoleStyle.fontLarger);
      }
    }
  }

  /**
   * This function prints the information about the aplied function and its arguments.
   * @param {string} key Name of the function that is being monitored
   */
  function printEventInfo(key) {
    console.info(`%cApplied function name:%c ${key}`, consoleStyle.infoInv, consoleStyle.fontLarger);
    console.log('%cPassed arguments:', consoleStyle.infoInv);
    console.log(shoptet.scripts.arguments[key]);
  }

  /**
   * If the events monitoring is enabled, this function calls the printEventInfo function.
   * @param {CustomEvent} event Event that is being monitored
   */
  function attachEventInfo(event) {
    if (monitorEvents) {
      printEventInfo(event.type);
    }
  }

  /**
   * @param {string} deadline Date when the function will be removed. E.g. '2012-12-21'.
   * @param {string} functionName Name of the function that is deprecated.
   * @param {string} [replaceWith] Name of the function that should be used instead. (optional)
   * @param {string} [customMessage] Custom message to be displayed instead of the default one. (optional)
   */
  function deprecated(deadline, functionName, replaceWith, customMessage) {
    if (!LOG_TO_CONSOLE) {
      return;
    }
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      console.error(`[Validation Error]: Invalid deadline date: ${deadline}`);
      return;
    }

    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    if (timeDiff >= 0) {
      if (replaceWith || customMessage) {
        const message = customMessage ?? `Please use %c${replaceWith}%c instead.`;
        console.warn(
          `[Deprecated]: Function %c${functionName}%c is deprecated and will be removed after ${deadline}. ${message}`,
          consoleStyle.fontBold,
          consoleStyle.default,
          consoleStyle.fontBold,
          consoleStyle.default
        );
      } else {
        console.warn(
          `[Deprecated]: Function %c${functionName}%c is deprecated and will be removed after ${deadline}.`,
          consoleStyle.fontBold,
          consoleStyle.default
        );
      }
    } else {
      console.error(
        `[Deprecated]: Function %c${functionName}%c has been removed and will no longer work in future versions.`,
        consoleStyle.fontBold,
        consoleStyle.default
      );
    }
  }

  shoptet.dev = shoptet.dev || {};
  shoptet.dev.config = {};
  shoptet.dev.config.log = {
    ...configStyle,
    styles: consoleStyle,
  };
  shoptet.dev.config.name = CONFIG_NAME;
  shoptet.dev.config.version = CONFIG_VERSION;

  shoptet.dev.config.monitorEvents = monitorEvents;
  shoptet.dev.config.shoptetDevMode = shoptetDevMode;
  shoptet.dev.config.suppressRegFn = suppressRegFn;

  shoptet.dev.enableEventsMonitoring = enableEventsMonitoring;
  shoptet.dev.disableEventsMonitoring = disableEventsMonitoring;
  shoptet.dev.printMonitoringInfo = printMonitoringInfo;
  shoptet.dev.printEventInfo = printEventInfo;
  shoptet.dev.attachEventInfo = attachEventInfo;
  shoptet.dev.deprecated = deprecated;

  /**
   * Get RegExp for the particular cookie name
   * @param {string} cookieName Name of the cookie
   * @returns {boolean}
   */
  shoptet.dev.getCookieRegExp = cookieName => {
    deprecated(
      '2025-12-31',
      'shoptet.dev.getCookieRegExp(cookieName)',
      undefined,
      'Please use document.cookie.includes(cookieName) to check if a cookie exists.'
    );
    return document.cookie.includes(cookieName);
  };

  if (!shoptet.abilities || shoptet.abilities.about.generation !== 3) {
    return false;
  }

  printMonitoringInfo();
  if (monitorEvents) {
    shoptet.scripts.monitoredFunctions.forEach(function (key) {
      (function (key) {
        document.addEventListener(key, attachEventInfo);
      })(key);
    });
  }
})(shoptet);
