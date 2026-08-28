// @vitest-environment jsdom

/**
 * Defect 38306 was fixed by PR 39690, which hard-coded two decimal places here. Defect 40163 was
 * that fix being wrong, and PR 40661 corrected it to the configured value. Neither shipped a test.
 */
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';

/** Functions the module hands back through shoptet.scripts.registerFunction. */
const registered = {};

const ORIGINAL_PRICE = 100;
const PRICE_RATIO = 0.9;

function buildDom() {
  document.body.innerHTML = `
    <div class="p-detail-inner">
      <div class="quantity"><input type="text" data-decimals="0" value="1"></div>
      <span class="js-quantity-discounts__flag hidden"></span>
    </div>
    <table class="js-quantity-discounts quantity-discounts__table" data-orig-price="${ORIGINAL_PRICE}">
      <tr class="js-quantity-discounts__item" data-amount="5" data-price-ratio="${PRICE_RATIO}">
        <td class="quantity-discounts__price"></td>
      </tr>
    </table>
    <span class="js-quantity-discounts__saved-amount"></span>
  `;
}

function renderedDiscountPrice() {
  return document.querySelector('.quantity-discounts__price').textContent;
}

beforeAll(async () => {
  buildDom();

  // Defined in another storefront file, so the module cannot be imported without it.
  // eslint-disable-next-line no-extend-native
  Number.prototype.ShoptetFormatAsCurrency = function (_symbol, _separator, decPlaces) {
    return this.toFixed(decPlaces);
  };

  globalThis.shoptet = {
    config: { decPlaces: 2 },
    quantity: { enforceAndAnnounceLimits: () => {} },
    scripts: {
      libs: { quantityDiscounts: ['recalculateQuantityDiscountsTable'] },
      registerFunction: (fn, namespace) => {
        registered[namespace] = registered[namespace] ?? {};
        registered[namespace][fn.name] = fn;
      },
      signalCustomEvent: () => {},
    },
  };

  // Dynamic, and after the DOM exists: the module reads the document as it loads.
  await import('./quantityDiscounts.js');
});

describe('recalculateQuantityDiscountsTable', () => {
  beforeEach(() => {
    globalThis.shoptet.config.decPlaces = 2;
  });

  test('is reachable through shoptet.scripts.registerFunction', () => {
    expect(registered.quantityDiscounts?.recalculateQuantityDiscountsTable).toBeTypeOf('function');
  });

  test('formats the discounted price to the shop decimal places, not a hard-coded 2', () => {
    const recalculate = registered.quantityDiscounts.recalculateQuantityDiscountsTable;

    globalThis.shoptet.config.decPlaces = 2;
    recalculate(ORIGINAL_PRICE);
    expect(renderedDiscountPrice()).toBe('90.00');

    globalThis.shoptet.config.decPlaces = 0;
    recalculate(ORIGINAL_PRICE);
    expect(renderedDiscountPrice()).toBe('90');
  });

  test('a shop configured for three decimal places gets three', () => {
    const recalculate = registered.quantityDiscounts.recalculateQuantityDiscountsTable;

    globalThis.shoptet.config.decPlaces = 3;
    recalculate(ORIGINAL_PRICE);

    expect(renderedDiscountPrice()).toBe('90.000');
  });

  test('applies the row price ratio rather than echoing the price it was given', () => {
    const recalculate = registered.quantityDiscounts.recalculateQuantityDiscountsTable;

    recalculate(250);

    // 250 * 0.9, so a test that ignored the ratio would read 250.00 here.
    expect(renderedDiscountPrice()).toBe('225.00');
  });

  test('refuses a non-numeric price instead of rendering NaN', () => {
    const recalculate = registered.quantityDiscounts.recalculateQuantityDiscountsTable;

    recalculate(ORIGINAL_PRICE);
    const before = renderedDiscountPrice();

    recalculate(undefined);

    expect(renderedDiscountPrice()).toBe(before);
  });
});
