(function (shoptet) {
    const pDetailInner = document.querySelector('.p-detail-inner')
    const quantityInput = pDetailInner?.querySelector('.quantity input')
    const quantityDiscountsFlag = pDetailInner?.querySelector('.js-quantity-discounts__flag')
    const quantityDiscountsTable = document.querySelector('.js-quantity-discounts')
    const quantityDiscountsSavedAmount = document.querySelector('.js-quantity-discounts__saved-amount')
    const quantityDiscountsItems = document.querySelectorAll('.js-quantity-discounts__item')
  
    let productOrigPrice = document.querySelector('.quantity-discounts__table')?.dataset.origPrice

    function onVariantChange(show, newPrice, minimumAmount) {
        if (!quantityDiscountsTable) {
            return
        }
        if (show) {
            showQuantityDiscountsFlag();
            showQuantityDiscountsTable();
            getQuantityDiscountElementByAmount(minimumAmount)
            recalculateQuantityDiscountsTable(newPrice)
        } else {
            hideQuantityDiscountsFlag();
            hideQuantityDiscountsTable();
        }
    }

    function showQuantityDiscountsFlag() {
        if (quantityDiscountsFlag) {
            quantityDiscountsFlag.classList.remove('hidden')
        }
    }

    function hideQuantityDiscountsFlag() {
        if (quantityDiscountsFlag) {
            quantityDiscountsFlag.classList.add('hidden')
        }
    }

    function showQuantityDiscountsTable() {
        if (quantityDiscountsTable) {
            quantityDiscountsTable.classList.add('visible')
        }
    }

    function hideQuantityDiscountsTable() {
        if (quantityDiscountsTable) {
            quantityDiscountsTable.classList.remove('visible')
        }
    }

    function recalculateQuantityDiscountsTable(newPrice) {
        if (newPrice === undefined || isNaN(newPrice) || typeof newPrice !== 'number') {
            console.error('recalculateQuantityDiscountsTable: Invalid price')
            return
        }

        productOrigPrice = newPrice
        quantityDiscountsItems.forEach((item) => {
            const priceRatio = item.dataset.priceRatio
            const price = newPrice * priceRatio
            item.querySelector('.quantity-discounts__price').textContent = price.ShoptetFormatAsCurrency()
        })
    }

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
        if (!el.dataset.priceRatio || !el.dataset.amount) {
            console.error('updateQuantityDiscount: Invalid element')
            return
        }

        const productPrice = Number(productOrigPrice)
        const priceRatio = Number(el.dataset.priceRatio);

        return ((quantityInput?.value || el.dataset.amount) * (productPrice - (productPrice * priceRatio))).ShoptetFormatAsCurrency()
    }

    quantityDiscountsTable && quantityInput?.addEventListener('change', () => {
        getQuantityDiscountElementByAmount(Number(quantityInput.value))
    })

    quantityDiscountsItems.forEach((item) => {
        item.addEventListener('click', () => {
            if (quantityInput) {
                quantityInput.value = item.dataset.amount
                shoptet.helpers.updateQuantity(quantityInput, quantityInput.dataset.min, quantityInput.dataset.max, quantityInput.dataset.decimals, 'change')
            }

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
