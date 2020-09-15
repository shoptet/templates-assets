(function(shoptet) {

    function getElements() {
        return document.querySelectorAll('.btn-cofidis');
    }

    function setMinPayment(el, minPayment) {
        el.querySelector('b').textContent = minPayment;
        el.classList.remove('hidden');
    }

    function calculator($newPriceHolder, $cofidis) {
        var newPrice = parseFloat($newPriceHolder.text().replace(/[^\d,.-]/g, ''));
        $cofidis.attr(
            'onClick',
            $cofidis.attr('onClick').replace(/(cenaZbozi=)(.+)(&idObchodu)/, '$1' + newPrice + '$3')
        );
    }

    document.addEventListener('DOMContentLoaded', function() {
        var elements = shoptet.cofidis.getElements();
        var successCallback = function(response) {
            var index = response.getFromPayload('index');
            var minPayment = response.getFromPayload('minPayment');
            if (minPayment) {
                shoptet.cofidis.setMinPayment(elements[index], minPayment);
            }
        };
        for (var i = 0; i < elements.length; i++) {
            shoptet.ajax.makeAjaxRequest(
                '/action/Iplatba/GetMinPayment/',
                shoptet.ajax.requestTypes.post,
                {
                    price: parseInt(elements[i].getAttribute('data-price')),
                    index: i
                },
                {
                    success: successCallback
                }
            )
        }
    });

    shoptet.cofidis = shoptet.cofidis || {};
    shoptet.scripts.libs.cofidis.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'cofidis');
    });
})(shoptet);
