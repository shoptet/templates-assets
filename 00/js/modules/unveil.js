// TODO: Delete this file after jQuery removal
if (typeof $ !== 'undefined') {
    $.fn.unveil = function(threshold, callback) {
        console.warn('Function $.fn.unveil() is deprecated and will be removed in future versions. Please use shoptet.images.unveil() instead.');
        shoptet.images.unveil();

        if (threshold) {
            console.error('The threshold parameter is no longer supported in this version of unveil() function.');
        }
        if (callback) {
            console.error('The callback function is no longer supported in this version of unveil() function.');
        }

        return this;
    };
}
