(function(shoptet) {
    function updateFlags(codeId) {
        var discountFlagsSelector = '.flag.flag-xy-discount';

        $(discountFlagsSelector).each(function() {
            var $flag = $(this);
            var xyDiscountVariants = $flag.data('xyDiscountVariants') ? String($flag.data('xyDiscountVariants')).split(' ') : [];

            if (!xyDiscountVariants.length || xyDiscountVariants.includes(String(codeId))) {
                $flag.removeClass('hidden');
            } else {
                $flag.addClass('hidden');
            }
        });
    }

    shoptet.xyDiscounts = shoptet.xyDiscounts || {};

    shoptet.scripts.libs.xyDiscounts.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'xyDiscounts');
    });
})(shoptet);
