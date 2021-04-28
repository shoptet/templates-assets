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
            'data-url',
            $cofidis.attr('data-url').replace(/(cenaZbozi=)(.+)(&idObchodu)/, '$1' + newPrice + '$3')
        );
    }

    function handleClick(e) {
        e.preventDefault();
        var url = e.currentTarget.dataset.url;
        window.open(url, 'iPlatba', 'width=770,height=650,menubar=no,toolbar=no');
    }

    function addCalculatorListeners() {
        var cofidisCalculatorLinks = document.querySelectorAll('.js-cofidis-open');
        for (var i = 0; i < cofidisCalculatorLinks.length; i++) {
            cofidisCalculatorLinks[i].removeEventListener('click', shoptet.cofidis.handleClick);
            cofidisCalculatorLinks[i].addEventListener('click', shoptet.cofidis.handleClick);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        shoptet.cofidis.addCalculatorListeners();
        var elements = shoptet.cofidis.getElements();

        var successCallback = function(response) {
            var index = response.getFromPayload('index');
            var minPayment = response.getFromPayload('minPayment');
            if (minPayment) {
                shoptet.cofidis.setMinPayment(elements[index], minPayment);
            }
        };

        for (var i = 0; i < elements.length; i++) {
            var minPayment = parseInt(elements[i].getAttribute('data-minpay'));
            if (minPayment) {
                shoptet.cofidis.setMinPayment(elements[i], minPayment);
            } else {
                shoptet.ajax.makeAjaxRequest(
                    '/action/Iplatba/GetMinPayment/',
                    shoptet.ajax.requestTypes.post,
                    {
                        price: parseInt(elements[i].getAttribute('data-price')),
                        index: i
                    },
                    {
                        'success': successCallback
                    },
                    {
                        'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                    }
                )
            }
        }
    });

    document.addEventListener('ShoptetDOMContentLoaded', function() {
        shoptet.cofidis.addCalculatorListeners();
    });

    shoptet.cofidis = shoptet.cofidis || {};
    shoptet.scripts.libs.cofidis.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'cofidis');
    });
})(shoptet);
