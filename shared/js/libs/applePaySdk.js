// @ts-check
/// <reference path="../../../types.d.ts" />

if (!shoptet.layout.showApplePay() && shoptet.config.initApplePaySdk) {
  const script = document.createElement('script');
  script.onload = () => {
    shoptet.layout.clearCache('showApplePay');
    if (shoptet.layout.showApplePay()) {
      document.documentElement.classList.add('apple-pay-available');
    } else {
      shoptet.checkoutShared.removeApplePay(true);
    }
  };
  script.src = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}
