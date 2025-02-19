// TODO: Delete this file after jQuery removal
if (typeof $ !== 'undefined') {
  $.fn.unveil = function (threshold, callback) {
    shoptet.dev.deprecated('2025-12-31', '$.fn.unveil()', 'Please use shoptet.images.unveil() instead.');
    shoptet.images.unveil();

    if (threshold) {
      console.error(
        '[VersionError]: The threshold parameter is no longer supported in this version of unveil() function.'
      );
    }
    if (callback) {
      console.error(
        '[Version Error]: The callback function is no longer supported in this version of unveil() function.'
      );
    }

    return this;
  };
}
