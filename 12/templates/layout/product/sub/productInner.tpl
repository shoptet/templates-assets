{extends file=$layout->getRootTemplate("layout/product/sub/productInner.tpl")}
{block name="freeShippingFlag"}{/block}
{block name="btnCartClass"}{/block}
{block name="productCategoryStandardPrice"}{if isset($list)}{$smarty.block.parent}{/if}{/block}
{block name="productCategorySavePrice"}{if isset($list)}{$smarty.block.parent}{/if}{/block}
{block name="pricePlaceholder"}{/block}
{block name="productCategoryMainPrices"}
    {include file=$layout->getTemplate("layout/product/sub/additionalPrice.tpl")}
    {include file=$layout->getTemplate("layout/product/sub/mainPrice.tpl")}
{/block}
{block name="detailButtonCondition"}
    {if $product->isCartButton()}{$displayDetailButton = false}{/if}
{/block}

{block name="extraFlags"}
    {include file=$layout->getTemplate("layout/product/sub/innerDiscounts.tpl") source=$product pageType="category"}
{/block}
{block name="ratings"}
    {$smarty.capture.availability|safeHtml}
{/block}
