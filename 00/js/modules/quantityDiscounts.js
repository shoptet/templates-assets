(function (shoptet) {
    const quantityDiscountsTable = document.querySelector('.js-quantity-discounts')
    const quantityInput = document.querySelector('.p-detail-inner .quantity input')
    const quantityDiscountsSavedAmount = document.querySelector('.js-quantity-discounts__saved-amount')
    const quantityDiscountsItems = document.querySelectorAll('.js-quantity-discounts__item')

    function getQuantityDiscountElementByAmount(amount) {
        if (amount === undefined || isNaN(amount) || typeof amount !== 'number') {
          console.error('getQuantityDiscountElementByAmount: Invalid amount')
          amount = 1
        }

        amount = Math.max(...Array.from(quantityDiscountsItems).map(item => parseInt(item.dataset.amount)).filter(item => item <= amount))
        const el = document.querySelector(`.js-quantity-discounts__item[data-amount="${amount}"]`)
        updateQuantityDiscount(el)
    }

    function updateQuantityDiscount(el) {
        if (!el) {
            console.error('updateQuantityDiscount: Invalid element')
            return
        }

        document.querySelector('.quantity-discounts__item--highlighted')?.classList.remove('quantity-discounts__item--highlighted')
        el.classList.add('quantity-discounts__item--highlighted')

        if (quantityDiscountsSavedAmount) {
            quantityDiscountsSavedAmount.textContent = calculateQuantityDiscount(el)
        }
    }

    function calculateQuantityDiscount(el) {
        if (!el.dataset.priceRatio) {
            console.error('updateQuantityDiscount: Invalid element')
            return
        }
        const productPrice = getShoptetDataLayer().product.priceWithVat;
        const priceRatio = el.dataset.priceRatio;

        return (quantityInput.value * (productPrice - (productPrice * priceRatio))).ShoptetFormatAsCurrency()
    }

    quantityDiscountsTable && quantityInput?.addEventListener('change', () => {
        getQuantityDiscountElementByAmount(Number(quantityInput.value))
    })

    quantityDiscountsItems.forEach((item) => {
        item.addEventListener('click', () => {
            quantityInput.value = item.dataset.amount
            shoptet.helpers.updateQuantity(quantityInput, quantityInput.dataset.min, quantityInput.dataset.max, quantityInput.dataset.decimals, 'change')
            updateQuantityDiscount(item)
            shoptet.scripts.signalCustomEvent('ShoptetQuantityDiscountUpdated', item);
        })
    })

    shoptet.quantityDiscounts = shoptet.quantityDiscounts || {};
    shoptet.scripts.libs.quantityDiscounts.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'quantityDiscounts');
    });
})(shoptet);
