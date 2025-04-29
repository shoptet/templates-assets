// @ts-check

import { ensure } from '../../../../shared/js/typeAssertions';

const isHTMLElement = value => value instanceof HTMLElement;

(function (shoptet) {
  /** @type {{productId: number, productVariantId: number, ean: string}[]} */
  const productVariants = [];
  let dataLoading = false;

  /** This function is used to get the product variants data. */
  function getProductVariants() {
    return productVariants;
  }

  /**
   * This function is called when the product variant is changed.
   * It is used to fetch the variant data and change all dynamic values.
   * @param {number} [priceId] PriceId of the selected variant (optional). If `undefined`, it resets to the default value.
   */
  function fetchData(priceId) {
    if (dataLoading || !document.querySelector('.productEan')) return;

    if (!priceId) {
      changeDynamicValues(undefined);
      return;
    }

    if (productVariants.length) {
      changeDynamicValues(priceId);
      return;
    }

    let dataLayer;
    try {
      //  @ts-expect-error Shoptet global functions are not defined yet.
      dataLayer = window.getShoptetDataLayer();
    } catch (error) {
      console.error('Error fetching dataLayer:', error);
      return;
    }

    const productId = dataLayer.product.id;

    dataLoading = true;
    shoptet.ajax.makeAjaxRequest(
      `/action/productDetail/getProductVariants/?productId=${productId}`,
      'GET',
      '',
      {
        success: response => {
          if (response) {
            productVariants.push(...response.getFromPayload('data'));
            changeDynamicValues(priceId);
          }
        },
        complete: () => {
          dataLoading = false;
        },
      },
      {
        'X-Shoptet-XHR': 'Shoptet_Coo7ai',
      }
    );
  }

  /**
   * This function is used to change all dynamic values.
   * For now it only changes the EAN code.
   * But it can be extended in the future to change other dynamic values.
   * @param {number} [priceId] PriceId of the selected variant (optional). If `undefined`, it resets to the default value.
   * */
  function changeDynamicValues(priceId) {
    changeEan(priceId);
  }

  /**
   * This function is used to change the EAN code of the selected variant.
   * @param {number} [priceId] PriceId of the selected variant (optional). If `undefined`, it resets to the `Choose variant`.
   * */
  function changeEan(priceId) {
    const el = document.querySelector('.js-productEan__value');
    if (!el) return;

    const eanEl = ensure(el, isHTMLElement);
    if (!priceId) {
      eanEl.innerText = shoptet.messages.chooseVariant;
      return;
    }

    const newValue = productVariants.find(variant => variant.productVariantId === priceId)?.ean ?? '';
    if (newValue === '') {
      eanEl.innerHTML = '<span class="productEan__value--empty">&mdash;</span>';
    } else {
      eanEl.innerText = newValue;
    }
  }

  shoptet.scripts.libs.variantsData = ['fetchData', 'getProductVariants'];

  shoptet.variantsData = shoptet.variantsData || {};
  shoptet.scripts.libs.variantsData.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'variantsData');
  });
  // @ts-expect-error Shoptet object is not defined yet.
})(shoptet);
